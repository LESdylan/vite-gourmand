/**
 * Test Runner Controller
 * REST API endpoints for running and fetching test results
 */
import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { TestRunnerService } from './test-runner.service';
import { RunTestsResponse } from './types';

interface RunTestDto {
  testId: string;
  verbose?: boolean;
}

@ApiTags('tests')
@Controller('tests')  // Will become /api/tests with global prefix
@SkipThrottle() // Don't rate-limit test endpoints
export class TestRunnerController {
  constructor(private readonly testRunnerService: TestRunnerService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Get test runner status' })
  @ApiResponse({ status: 200, description: 'Returns current test status' })
  getStatus(): { running: boolean; currentTest?: string } {
    return this.testRunnerService.getStatus();
  }

  @Get('results')
  @Public()
  @ApiOperation({ summary: 'Get cached test results' })
  @ApiResponse({ status: 200, description: 'Returns cached test results' })
  @ApiResponse({ status: 404, description: 'No cached results available' })
  getResults(): RunTestsResponse {
    const results = this.testRunnerService.getCachedResults();
    if (!results) {
      throw new HttpException('No cached results available', HttpStatus.NOT_FOUND);
    }
    return results;
  }

  @Post('run')
  @Public()
  @ApiOperation({ summary: 'Run a specific test suite' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        testId: { 
          type: 'string', 
          enum: ['unit', 'e2e', 'orders', 'postman'],
          description: 'Test suite to run' 
        },
        verbose: {
          type: 'boolean',
          description: 'Include raw CLI output',
        },
      } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Test results' })
  @ApiResponse({ status: 409, description: 'Tests already running' })
  async runTest(@Body() dto: RunTestDto): Promise<RunTestsResponse> {
    const status = this.testRunnerService.getStatus();
    if (status.running) {
      throw new HttpException(
        `Tests already running: ${status.currentTest}`,
        HttpStatus.CONFLICT,
      );
    }

    try {
      return await this.testRunnerService.runTest(dto.testId, { verbose: dto.verbose });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to run tests';
      throw new HttpException(
        message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('run-all')
  @Public()
  @ApiOperation({ summary: 'Run all test suites' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        verbose: {
          type: 'boolean',
          description: 'Include raw CLI output',
        },
      } 
    } 
  })
  @ApiResponse({ status: 200, description: 'All test results' })
  @ApiResponse({ status: 409, description: 'Tests already running' })
  async runAllTests(@Body() dto: { verbose?: boolean } = {}): Promise<RunTestsResponse> {
    const status = this.testRunnerService.getStatus();
    if (status.running) {
      throw new HttpException(
        `Tests already running: ${status.currentTest}`,
        HttpStatus.CONFLICT,
      );
    }

    try {
      return await this.testRunnerService.runAllTests({ verbose: dto.verbose });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to run tests';
      throw new HttpException(
        message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
