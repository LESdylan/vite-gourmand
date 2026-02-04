/**
 * KanbanTestPage - Drag & Drop Kanban Test
 * Tests drag-drop interactions, column management
 */

import { useState } from 'react';
import './KanbanTestPage.css';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: '📋 À Faire',
    tasks: [
      { id: 't1', title: 'Valider formulaire contact', priority: 'high' },
      { id: 't2', title: 'Tester panier d\'achat', priority: 'medium' },
    ],
  },
  {
    id: 'progress',
    title: '🔄 En cours',
    tasks: [
      { id: 't3', title: 'Tests performance API', priority: 'high' },
    ],
  },
  {
    id: 'review',
    title: '👀 Review',
    tasks: [
      { id: 't4', title: 'Audit accessibilité', priority: 'low' },
    ],
  },
  {
    id: 'done',
    title: '✅ Terminé',
    tasks: [
      { id: 't5', title: 'Tests authentification', priority: 'medium' },
    ],
  },
];

export function KanbanTestPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumn: string } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, fromColumn: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask) return;

    setColumns(prevColumns => {
      return prevColumns.map(col => {
        // Remove from source column
        if (col.id === draggedTask.fromColumn) {
          return {
            ...col,
            tasks: col.tasks.filter(t => t.id !== draggedTask.task.id),
          };
        }
        // Add to target column
        if (col.id === targetColumnId) {
          return {
            ...col,
            tasks: [...col.tasks, draggedTask.task],
          };
        }
        return col;
      });
    });

    setDraggedTask(null);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `t${Date.now()}`,
      title: newTaskTitle,
      priority: 'medium',
    };

    setColumns(prev => prev.map(col =>
      col.id === 'todo' ? { ...col, tasks: [...col.tasks, newTask] } : col
    ));
    setNewTaskTitle('');
  };

  const deleteTask = (taskId: string, columnId: string) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
        : col
    ));
  };

  return (
    <div className="kanban-test-page">
      <header className="kanban-test-header">
        <a href="/" className="back-link">← Retour au Dashboard</a>
        <h1>📌 Test Manuel: Kanban</h1>
        <p className="kanban-test-description">
          Testez le drag & drop, la gestion des colonnes et l'interaction tactile
        </p>
      </header>

      <div className="kanban-test-container">
        <aside className="test-checklist">
          <h2>✅ Points à vérifier</h2>
          <ul>
            <li>Drag & drop fluide</li>
            <li>Indicateurs visuels de drop</li>
            <li>Ajout de nouvelles tâches</li>
            <li>Suppression de tâches</li>
            <li>Priorités colorées</li>
            <li>Responsive / Touch</li>
            <li>Scroll horizontal mobile</li>
          </ul>

          <div className="add-task-form">
            <h3>Ajouter une tâche</h3>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Nouvelle tâche..."
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <button onClick={addTask} className="btn-add">
              + Ajouter
            </button>
          </div>
        </aside>

        <main className="kanban-board">
          {columns.map(column => (
            <div
              key={column.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <h3 className="column-title">
                {column.title}
                <span className="task-count">{column.tasks.length}</span>
              </h3>
              <div className="column-tasks">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    className={`kanban-task priority-${task.priority}`}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                  >
                    <span className="task-title">{task.title}</span>
                    <div className="task-actions">
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                      </span>
                      <button
                        className="btn-delete"
                        onClick={() => deleteTask(task.id, column.id)}
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {column.tasks.length === 0 && (
                  <div className="empty-column">
                    Déposez une tâche ici
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
