/**
 * Jest E2E Test Setup
 * ====================
 * 
 * This file runs before each test file.
 */

// Set test environment - this disables throttling
process.env.NODE_ENV = 'test';

// Increase timeout for E2E tests
jest.setTimeout(30000);

// Suppress specific console outputs during tests if needed
// const originalError = console.error;
// console.error = (...args) => {
//   if (args[0]?.includes?.('Warning:')) return;
//   originalError.apply(console, args);
// };
