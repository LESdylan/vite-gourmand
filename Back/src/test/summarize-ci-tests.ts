import * as fs from 'node:fs/promises';
import * as path from 'node:path';

interface JestResult {
  numPassedTests: number;
  numFailedTests: number;
  numTotalTests: number;
}

interface CustomRawResult {
  summary?: {
    assertionsPassed?: number;
    assertionsFailed?: number;
    assertionsTotal?: number;
  };
}

interface TestSummaryRow {
  name: string;
  passed: number;
  failed: number;
  total: number;
}

async function readJson<T>(fileName: string): Promise<T | null> {
  try {
    const filePath = path.join(process.cwd(), fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function jestRow(name: string, result: JestResult | null): TestSummaryRow {
  return {
    name,
    passed: result?.numPassedTests ?? 0,
    failed: result?.numFailedTests ?? 0,
    total: result?.numTotalTests ?? 0,
  };
}

function customRow(result: CustomRawResult | null): TestSummaryRow {
  return {
    name: 'Custom validation',
    passed: result?.summary?.assertionsPassed ?? 0,
    failed: result?.summary?.assertionsFailed ?? 0,
    total: result?.summary?.assertionsTotal ?? 0,
  };
}

function formatMarkdown(rows: TestSummaryRow[]): string {
  const total = rows.reduce(
    (acc, row) => ({
      passed: acc.passed + row.passed,
      failed: acc.failed + row.failed,
      total: acc.total + row.total,
    }),
    { passed: 0, failed: 0, total: 0 },
  );

  const tableRows = rows
    .map(
      (row) => `| ${row.name} | ${row.passed} | ${row.failed} | ${row.total} |`,
    )
    .join('\n');

  return [
    '## Backend Test Summary',
    '',
    '| Suite | Passed | Failed | Total |',
    '| --- | ---: | ---: | ---: |',
    tableRows,
    `| **Total** | **${total.passed}** | **${total.failed}** | **${total.total}** |`,
    '',
  ].join('\n');
}

async function run(): Promise<void> {
  const [unit, e2e, custom] = await Promise.all([
    readJson<JestResult>('test-results-unit.json'),
    readJson<JestResult>('test-results-e2e.json'),
    readJson<CustomRawResult>('test-results-custom-raw.json'),
  ]);

  const rows = [
    jestRow('Jest unit', unit),
    jestRow('Jest e2e', e2e),
    customRow(custom),
  ];
  const summary = formatMarkdown(rows);

  console.log(summary);

  const stepSummaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (stepSummaryPath) {
    await fs.appendFile(stepSummaryPath, summary, 'utf-8');
  }
}

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
