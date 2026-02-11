/**
 * Schema Editor - Create tables and add columns
 * Modifies the database schema directly via API
 */

import { useState } from 'react';
import { apiRequest } from '../../services/api';
import type { TableMeta } from './types';
import './SchemaEditor.css';

interface Props {
  mode: 'createTable' | 'addColumn';
  tableName?: string;
  tables: TableMeta[];
  onSuccess: () => void;
  onClose: () => void;
}

const COLUMN_TYPES = [
  { value: 'TEXT', label: 'Texte (TEXT)' },
  { value: 'INTEGER', label: 'Entier (INTEGER)' },
  { value: 'BIGINT', label: 'Grand Entier (BIGINT)' },
  { value: 'DECIMAL', label: 'Décimal (DECIMAL)' },
  { value: 'BOOLEAN', label: 'Booléen (BOOLEAN)' },
  { value: 'TIMESTAMP', label: 'Date/Heure (TIMESTAMP)' },
  { value: 'DATE', label: 'Date (DATE)' },
  { value: 'TIME', label: 'Heure (TIME)' },
  { value: 'JSON', label: 'JSON' },
  { value: 'UUID', label: 'UUID' },
];

interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string;
  isPrimary: boolean;
  isUnique: boolean;
  foreignKey: { table: string; column: string } | null;
}

const emptyColumn = (): ColumnDef => ({
  name: '',
  type: 'TEXT',
  nullable: true,
  defaultValue: '',
  isPrimary: false,
  isUnique: false,
  foreignKey: null,
});

export function SchemaEditor({ mode, tableName, tables, onSuccess, onClose }: Props) {
  const [newTableName, setNewTableName] = useState('');
  const [columns, setColumns] = useState<ColumnDef[]>([emptyColumn()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For addColumn mode, just one column
  const [singleColumn, setSingleColumn] = useState<ColumnDef>(emptyColumn());

  const addColumn = () => {
    setColumns([...columns, emptyColumn()]);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const updateColumn = (index: number, field: keyof ColumnDef, value: unknown) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };
    setColumns(updated);
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      setError('Le nom de la table est requis');
      return;
    }
    if (columns.some((c) => !c.name.trim())) {
      setError('Toutes les colonnes doivent avoir un nom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiRequest('/api/crud/schema/table', {
        method: 'POST',
        body: {
          tableName: newTableName.trim(),
          columns: columns.map((c) => ({
            name: c.name.trim(),
            type: c.type,
            nullable: c.nullable,
            defaultValue: c.defaultValue || null,
            isPrimary: c.isPrimary,
            isUnique: c.isUnique,
            foreignKey: c.foreignKey,
          })),
        },
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async () => {
    if (!singleColumn.name.trim()) {
      setError('Le nom de la colonne est requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiRequest('/api/crud/schema/column', {
        method: 'POST',
        body: {
          tableName,
          column: {
            name: singleColumn.name.trim(),
            type: singleColumn.type,
            nullable: singleColumn.nullable,
            defaultValue: singleColumn.defaultValue || null,
            isUnique: singleColumn.isUnique,
            foreignKey: singleColumn.foreignKey,
          },
        },
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const renderColumnForm = (
    col: ColumnDef,
    index: number,
    onChange: (field: keyof ColumnDef, value: unknown) => void,
    canRemove: boolean,
  ) => (
    <div key={index} className="column-form">
      <div className="column-form-row">
        <div className="form-field">
          <label>Nom de la colonne *</label>
          <input
            type="text"
            value={col.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="ex: user_id, email, created_at"
          />
        </div>
        <div className="form-field">
          <label>Type *</label>
          <select value={col.type} onChange={(e) => onChange('type', e.target.value)}>
            {COLUMN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="column-form-row">
        <div className="form-field">
          <label>Valeur par défaut</label>
          <input
            type="text"
            value={col.defaultValue}
            onChange={(e) => onChange('defaultValue', e.target.value)}
            placeholder="ex: '', 0, NOW(), NULL"
          />
        </div>
        <div className="form-field checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!col.nullable}
              onChange={(e) => onChange('nullable', !e.target.checked)}
            />
            NOT NULL
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={col.isUnique}
              onChange={(e) => onChange('isUnique', e.target.checked)}
            />
            UNIQUE
          </label>
          {mode === 'createTable' && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={col.isPrimary}
                onChange={(e) => onChange('isPrimary', e.target.checked)}
              />
              PRIMARY KEY
            </label>
          )}
        </div>
      </div>

      <div className="column-form-row">
        <div className="form-field">
          <label>Clé étrangère (optionnel)</label>
          <div className="fk-select">
            <select
              value={col.foreignKey?.table || ''}
              onChange={(e) => {
                const table = e.target.value;
                if (!table) {
                  onChange('foreignKey', null);
                } else {
                  onChange('foreignKey', { table, column: 'id' });
                }
              }}
            >
              <option value="">Aucune référence</option>
              {tables.map((t) => (
                <option key={t.name} value={t.name}>
                  → {t.name}
                </option>
              ))}
            </select>
            {col.foreignKey && (
              <select
                value={col.foreignKey.column}
                onChange={(e) =>
                  onChange('foreignKey', { ...col.foreignKey!, column: e.target.value })
                }
              >
                {tables
                  .find((t) => t.name === col.foreignKey?.table)
                  ?.columns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>
        {canRemove && (
          <button type="button" className="btn-remove-col" onClick={() => removeColumn(index)}>
            🗑️ Supprimer
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="schema-editor-overlay" onClick={onClose}>
      <div className="schema-editor" onClick={(e) => e.stopPropagation()}>
        <header className="schema-editor-header">
          <h3>
            {mode === 'createTable'
              ? '🗂️ Créer une nouvelle table'
              : `➕ Ajouter une colonne à "${tableName}"`}
          </h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="schema-editor-content">
          {error && <div className="schema-error">{error}</div>}

          {mode === 'createTable' && (
            <>
              <div className="form-field table-name-field">
                <label>Nom de la table *</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="ex: products, categories, reviews"
                />
                <span className="hint">Utilisez le format snake_case (ex: user_settings)</span>
              </div>

              <div className="columns-section">
                <div className="columns-header">
                  <h4>📊 Colonnes</h4>
                  <button type="button" className="btn-add-col" onClick={addColumn}>
                    + Ajouter une colonne
                  </button>
                </div>

                <div className="info-box">
                  💡 Une colonne <code>id SERIAL PRIMARY KEY</code> sera automatiquement ajoutée.
                </div>

                {columns.map((col, i) =>
                  renderColumnForm(
                    col,
                    i,
                    (field, value) => updateColumn(i, field, value),
                    columns.length > 1,
                  ),
                )}
              </div>
            </>
          )}

          {mode === 'addColumn' && (
            <div className="columns-section">
              {renderColumnForm(
                singleColumn,
                0,
                (field, value) => setSingleColumn({ ...singleColumn, [field]: value }),
                false,
              )}
            </div>
          )}
        </div>

        <footer className="schema-editor-footer">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button
            type="button"
            className="btn-save"
            onClick={mode === 'createTable' ? handleCreateTable : handleAddColumn}
            disabled={loading}
          >
            {loading
              ? '⏳ En cours...'
              : mode === 'createTable'
                ? '✓ Créer la table'
                : '✓ Ajouter la colonne'}
          </button>
        </footer>
      </div>
    </div>
  );
}
