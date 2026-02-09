/**
 * Test Runner Controller
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { TestRunnerService, TestSuite } from './test-runner.service';
import { Public } from '../common';

@ApiTags('Test Runner')
@Controller('test-runner')
export class TestRunnerController {
  constructor(private readonly service: TestRunnerService) {}

  @Get('unit')
  @Public()
  @ApiOperation({ summary: 'Get unit test results' })
  @ApiOkResponse({ description: 'Unit test results' })
  async getUnitResults(): Promise<TestSuite[]> {
    return this.service.getUnitTestResults();
  }

  @Get('e2e')
  @Public()
  @ApiOperation({ summary: 'Get e2e test results' })
  @ApiOkResponse({ description: 'E2E test results' })
  async getE2eResults(): Promise<TestSuite[]> {
    return this.service.getE2eTestResults();
  }

  @Get('summary')
  @Public()
  @ApiOperation({ summary: 'Get all test results summary' })
  @ApiOkResponse({ description: 'All test results' })
  async getSummary(): Promise<{ unit: TestSuite[]; e2e: TestSuite[] }> {
    return this.service.getSummary();
  }
}
