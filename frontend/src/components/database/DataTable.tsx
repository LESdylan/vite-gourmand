/**
 * Data Table - Modern responsive table with actions
 */

import type { TableRecord, TableColumn } from './types';
import './DataTable.css';

interface Props {
  columns: TableColumn[];
  records: TableRecord[];
  onEdit: (record: TableRecord) => void;
  onDelete: (id: number) => void;
}

export function DataTable({ columns, records, onEdit, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <div className="data-table-empty">
        Aucun enregistrement trouvé
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.name}>
                {c.name}
                {c.isPrimary && <span className="pk-badge">PK</span>}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              {columns.map(c => {
                const cellClass = getCellClass(c, r[c.name]);
                return (
                  <td key={c.name} className={cellClass} title={String(r[c.name] ?? '')}>
                    {formatCell(r[c.name], c)}
                  </td>
                );
              })}
              <td className="data-table-actions">
                <button onClick={() => onEdit(r)} title="Modifier">✏️</button>
                <button className="btn-delete" onClick={() => onDelete(r.id)} title="Supprimer">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getCellClass(col: TableColumn, value: unknown): string {
  const classes: string[] = [];
  if (col.isPrimary || col.name === 'id') classes.push('cell-id');
  if (typeof value === 'boolean' || col.type === 'boolean') {
    classes.push('cell-boolean');
    if (value === false) classes.push('false');
  }
  return classes.join(' ');
}

function formatCell(value: unknown, col: TableColumn): string {
  if (value === null || value === undefined) return '—';
  
  // Boolean values - handled via CSS
  if (typeof value === 'boolean' || col.type === 'boolean') return '';
  
  // Date values
  if (col.name.toLowerCase().includes('date') || col.name.toLowerCase().includes('at')) {
    try {
      const date = new Date(value as string);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch { /* fall through */ }
  }
  
  // Objects/Arrays - JSON preview
  if (typeof value === 'object') {
    return JSON.stringify(value).slice(0, 40) + '…';
  }
  
  // Default - truncate long strings
  const str = String(value);
  return str.length > 50 ? str.slice(0, 47) + '…' : str;
}
