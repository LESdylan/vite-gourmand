/**
 * Test Runner Module
 * Provides endpoints to run and monitor backend tests
 */
import { Module } from '@nestjs/common';
import { TestRunnerController } from './test-runner.controller';
import { TestRunnerService } from './test-runner.service';

@Module({
  controllers: [TestRunnerController],
  providers: [TestRunnerService],
  exports: [TestRunnerService],
})
export class TestRunnerModule {}
