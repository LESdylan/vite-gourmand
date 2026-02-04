/**
 * useMockData - Temporary mock data hook
 * Returns test data based on category
 */

import type { TestCategory } from '../features/qa/sidebar';
import type { TestItem } from '../features/qa/test-cards';
import type { AutoTest } from '../features/qa/automatic-tests';

export function useMockData(category: TestCategory) {
  const tests: TestItem[] = [
    { 
      id: '1', 
      name: 'Validation Formulaire', 
      description: 'Test du formulaire de contact - validation, soumission', 
      status: 'pending', 
      type: 'manual',
      testPath: '/test/form'
    },
    { 
      id: '2', 
      name: 'Temps Réel & Notifications', 
      description: 'Test des mises à jour en direct et WebSocket', 
      status: 'pending', 
      type: 'manual',
      testPath: '/test/realtime'
    },
    { 
      id: '3', 
      name: 'Kanban Drag & Drop', 
      description: 'Test du drag-drop et gestion de tâches', 
      status: 'pending', 
      type: 'manual',
      testPath: '/test/kanban'
    },
  ];

  const autoTests: AutoTest[] = [
    { id: 'a1', name: `${category}/health-check`, suite: category, status: 'passed', duration: 45 },
    { id: 'a2', name: `${category}/connection`, suite: category, status: 'passed', duration: 123 },
    { id: 'a3', name: `${category}/validation`, suite: category, status: 'failed', duration: 89 },
    { id: 'a4', name: `${category}/edge-cases`, suite: category, status: 'idle' },
  ];

  return { tests, autoTests };
}
