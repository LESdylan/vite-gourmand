/**
 * Employee Dashboard Content
 * Renders content based on active category
 */

import { Activity } from '../components/features/qa/activity';
import type { Task, EmployeeCategoryId } from './types';
import './EmployeeContent.css';

interface EmployeeContentProps {
  activeCategory: EmployeeCategoryId;
  tasks: Task[];
  onUpdateTask: (taskId: string, status: Task['status']) => void;
}

export function EmployeeContent({ activeCategory, tasks, onUpdateTask }: EmployeeContentProps) {
  return (
    <main className="employee-content">
      <header className="employee-content-header">
        <h2 className="employee-content-title">{getCategoryTitle(activeCategory)}</h2>
      </header>
      <div className="employee-content-body">
        {renderContent(activeCategory, tasks, onUpdateTask)}
      </div>
    </main>
  );
}

function renderContent(category: EmployeeCategoryId, tasks: Task[], onUpdateTask: (taskId: string, status: Task['status']) => void) {
  switch (category) {
    case 'tasks':
      return <TaskBoard tasks={tasks} onUpdateTask={onUpdateTask} />;
    case 'orders':
      return <OrdersList />;
    case 'activity':
      return <Activity />;
    default:
      return <TaskBoard tasks={tasks} onUpdateTask={onUpdateTask} />;
  }
}

function TaskBoard({ tasks, onUpdateTask }: { tasks: Task[]; onUpdateTask: (id: string, status: Task['status']) => void }) {
  const columns: Task['status'][] = ['todo', 'in-progress', 'done'];
  const columnLabels = { todo: 'À faire', 'in-progress': 'En cours', done: 'Terminé' };

  return (
    <div className="task-board">
      {columns.map(status => (
        <TaskColumn 
          key={status}
          title={columnLabels[status]}
          tasks={tasks.filter(t => t.status === status)}
          onMove={(id, newStatus) => onUpdateTask(id, newStatus)}
          currentStatus={status}
        />
      ))}
    </div>
  );
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onMove: (id: string, status: Task['status']) => void;
  currentStatus: Task['status'];
}

function TaskColumn({ title, tasks, onMove, currentStatus }: TaskColumnProps) {
  const nextStatus: Record<Task['status'], Task['status']> = {
    'todo': 'in-progress',
    'in-progress': 'done',
    'done': 'todo',
  };

  return (
    <div className="task-column">
      <h3 className="task-column-title">{title} <span>({tasks.length})</span></h3>
      <div className="task-column-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-card task-card--${task.priority}`}>
            <span className="task-title">{task.title}</span>
            <button className="task-move" onClick={() => onMove(task.id, nextStatus[currentStatus])}>
              {currentStatus === 'done' ? '↩️' : '➡️'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersList() {
  return <div className="employee-placeholder">Liste des commandes en cours (à implémenter)</div>;
}

function getCategoryTitle(category: EmployeeCategoryId): string {
  const titles: Record<EmployeeCategoryId, string> = {
    tasks: 'Mes Tâches',
    orders: 'Commandes en cours',
    activity: 'Activité récente',
  };
  return titles[category] || 'Mes Tâches';
}
