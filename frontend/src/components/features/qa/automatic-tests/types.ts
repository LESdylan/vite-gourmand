/**
 * Automatic test types
 */

export type AutoTestStatus = 'idle' | 'running' | 'passed' | 'failed';

export interface AutoTest {
  id: string;
  name: string;
  suite: string;
  status: AutoTestStatus;
  duration?: number;
}
