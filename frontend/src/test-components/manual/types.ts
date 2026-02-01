/**
 * Manual Testing Types
 * Interactive user flow testing with database state visualization
 */

export interface ManualTestScenario {
  id: string;
  name: string;
  description: string;
  category: ManualTestCategory;
  steps: TestStep[];
  icon: string;
}

export type ManualTestCategory = 
  | 'auth'
  | 'user'
  | 'order'
  | 'payment'
  | 'menu'
  | 'admin';

export interface TestStep {
  id: string;
  name: string;
  description: string;
  type: StepType;
  config: StepConfig;
}

export type StepType = 
  | 'form'
  | 'button'
  | 'select'
  | 'toggle'
  | 'slider'
  | 'display'
  | 'api-call';

export interface StepConfig {
  // Form fields
  fields?: FormField[];
  // Button config
  buttonText?: string;
  buttonAction?: string;
  // Select options
  options?: SelectOption[];
  // API endpoint
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // Display config
  displayType?: 'json' | 'table' | 'text';
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule;
  defaultValue?: string;
}

export interface ValidationRule {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface StepResult {
  stepId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: unknown;
  duration?: number;
  timestamp?: Date;
}

export interface ScenarioResult {
  scenarioId: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'partial';
  steps: StepResult[];
  startTime?: Date;
  endTime?: Date;
  totalDuration?: number;
}

export interface DatabaseState {
  table: string;
  columns: string[];
  rows: Record<string, unknown>[];
  lastUpdated: Date;
  changeType?: 'insert' | 'update' | 'delete' | 'none';
  changedRowIds?: string[];
}

export interface TestSession {
  id: string;
  startTime: Date;
  authToken?: string;
  refreshToken?: string;
  userId?: string;
  userEmail?: string;
  scenarioResults: ScenarioResult[];
  databaseSnapshots: DatabaseState[];
}
