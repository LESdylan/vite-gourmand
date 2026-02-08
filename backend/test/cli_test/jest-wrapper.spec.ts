import { TestRunner } from './runner';

const runner = new TestRunner({ verbose: false });

const tests = runner.getTests();

for (const t of tests) {
  test(t.name, async () => {
    const result = await runner.runTest(t.name);
    expect(result).not.toBeNull();
    expect(result!.passed).toBe(true);
  }, 30000);
}
