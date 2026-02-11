/**
 * DatabaseCards - Card-based view for mobile database browsing
 * Notion-like cards with field emphasis
 */

import type { TableColumn, TableRecord } from './types';
import './DatabaseCards.css';

interface Props {
  columns: TableColumn[];
  records: TableRecord[];
  onEdit: (record: TableRecord) => void;
  onDelete: (id: number) => void;
}

export function DatabaseCards({ columns, records, onEdit, onDelete }: Props) {
  if (records.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="db-cards">
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          columns={columns}
          onEdit={() => onEdit(record)}
          onDelete={() => onDelete(record.id as number)}
        />
      ))}
    </div>
  );
}

function RecordCard({
  record,
  columns,
  onEdit,
  onDelete,
}: {
  record: TableRecord;
  columns: TableColumn[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const titleField = findTitleField(columns, record);
  const displayFields = columns.filter((c) => !c.isPrimary).slice(0, 4);

  return (
    <article className="db-card">
      <header className="db-card-header">
        <span className="db-card-id">#{record.id}</span>
        {titleField && <h3 className="db-card-title">{titleField}</h3>}
      </header>
      <div className="db-card-fields">
        {displayFields.map((col) => (
          <FieldDisplay key={col.name} column={col} value={record[col.name]} />
        ))}
      </div>
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}

function FieldDisplay({ column, value }: { column: TableColumn; value: unknown }) {
  return (
    <div className="db-card-field">
      <span className="db-card-label">{column.name}</span>
      <span className={`db-card-value ${getValueClass(column, value)}`}>
        {formatValue(value, column)}
      </span>
    </div>
  );
}

function CardActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <footer className="db-card-actions">
      <button className="db-card-btn db-card-btn--edit" onClick={onEdit}>
        ✏️ Edit
      </button>
      <button className="db-card-btn db-card-btn--delete" onClick={onDelete}>
        🗑️
      </button>
    </footer>
  );
}

function EmptyState() {
  return (
    <div className="db-cards-empty">
      <span className="db-cards-empty-icon">📭</span>
      <p>No records found</p>
    </div>
  );
}

/* === Helpers === */
function findTitleField(columns: TableColumn[], record: TableRecord): string | null {
  const nameFields = ['name', 'title', 'label', 'email', 'username'];
  const titleCol = columns.find((c) => nameFields.includes(c.name.toLowerCase()));
  return titleCol ? String(record[titleCol.name] || '') : null;
}

function getValueClass(col: TableColumn, value: unknown): string {
  if (value === null || value === undefined) return 'db-card-value--null';
  if (typeof value === 'boolean') return value ? 'db-card-value--true' : 'db-card-value--false';
  if (col.type.includes('Int') || col.type === 'Float') return 'db-card-value--number';
  return '';
}

function formatValue(value: unknown, col: TableColumn): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'string' && col.type === 'DateTime') {
    return new Date(value).toLocaleString();
  }
  const str = String(value);
  return str.length > 50 ? str.slice(0, 47) + '...' : str;
}
