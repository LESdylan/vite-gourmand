/**
 * Record Modal - Create/Edit record form with smart field types
 */

import { useState, useEffect } from 'react';
import type { TableRecord, TableColumn } from './types';
import './RecordModal.css';

interface Props {
  columns: TableColumn[];
  record: TableRecord | null;
  onSave: (data: Partial<TableRecord>) => void;
  onClose: () => void;
}

/** Determine the best input type based on column name and type */
function getInputType(col: TableColumn): string {
  const name = col.name.toLowerCase();
  const type = col.type.toLowerCase();
  
  // Boolean fields
  if (type === 'boolean' || name.startsWith('is_') || name.startsWith('has_')) {
    return 'checkbox';
  }
  
  // Date/time fields
  if (type === 'datetime' || name.includes('_date') || name === 'createdat' || name === 'updatedat') {
    return 'datetime-local';
  }
  if (name.includes('_hour') || name.includes('_time') || name === 'opentime' || name === 'closetime') {
    return 'time';
  }
  
  // Number fields
  if (type === 'int' || type === 'float' || type === 'decimal' || name.includes('price') || name.includes('_id') || name === 'id') {
    return 'number';
  }
  
  // Email
  if (name === 'email') {
    return 'email';
  }
  
  // Password
  if (name === 'password' || name.includes('password')) {
    return 'password';
  }
  
  // URL
  if (name.includes('url') || name.includes('image') || name.includes('photo')) {
    return 'url';
  }
  
  // Phone
  if (name.includes('phone') || name.includes('telephone')) {
    return 'tel';
  }
  
  return 'text';
}

/** Format value for input based on type */
function formatValueForInput(value: unknown, inputType: string): string {
  if (value === null || value === undefined) return '';
  
  if (inputType === 'datetime-local' && value) {
    try {
      const date = new Date(value as string);
      return date.toISOString().slice(0, 16);
    } catch { return ''; }
  }
  
  if (inputType === 'checkbox') {
    return '';
  }
  
  return String(value);
}

/** Parse value from input based on type */
function parseValueFromInput(value: string, inputType: string, checked?: boolean): unknown {
  if (inputType === 'checkbox') return checked;
  if (inputType === 'number' && value) return Number(value);
  if (inputType === 'datetime-local' && value) return new Date(value).toISOString();
  return value;
}

export function RecordModal({ columns, record, onSave, onClose }: Props) {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const isEdit = !!record;

  useEffect(() => {
    if (record) {
      const data: Record<string, unknown> = {};
      columns.forEach(c => { data[c.name] = record[c.name]; });
      setForm(data);
    } else {
      // Initialize with defaults for new records
      const data: Record<string, unknown> = {};
      columns.forEach(c => {
        const inputType = getInputType(c);
        if (inputType === 'checkbox') data[c.name] = false;
        else if (inputType === 'number' && c.name.endsWith('Id')) data[c.name] = '';
      });
      setForm(data);
    }
  }, [record, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up the form data - remove empty strings, undefined, and id fields
    const cleanedData: Record<string, unknown> = {};
    Object.entries(form).forEach(([key, value]) => {
      // Skip id and primary key fields - backend doesn't accept them in body
      if (key === 'id' || key.endsWith('_id') && columns.find(c => c.name === key)?.isPrimary) {
        return;
      }
      if (value !== '' && value !== undefined) {
        cleanedData[key] = value;
      }
    });
    onSave(cleanedData as Partial<TableRecord>);
  };

  const handleChange = (col: TableColumn, value: string, checked?: boolean) => {
    const inputType = getInputType(col);
    setForm({ ...form, [col.name]: parseValueFromInput(value, inputType, checked) });
  };

  const editableColumns = columns.filter(c => !c.isPrimary && c.name !== 'createdAt' && c.name !== 'updatedAt');

  return (
    <div className="record-modal-overlay" onClick={onClose}>
      <div className="record-modal" onClick={e => e.stopPropagation()}>
        <header className="record-modal-header">
          <h3>{isEdit ? '✏️ Modifier l\'enregistrement' : '➕ Nouvel enregistrement'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="record-modal-fields">
            {editableColumns.map(col => {
              const inputType = getInputType(col);
              const value = formatValueForInput(form[col.name], inputType);
              const isRequired = !col.nullable && inputType !== 'checkbox';
              
              return (
                <div key={col.name} className={`record-field ${inputType === 'checkbox' ? 'checkbox-field' : ''}`}>
                  <label>
                    <span className="field-name">{col.name}</span>
                    <span className="field-type">{col.type}</span>
                    {isRequired && <span className="required">*</span>}
                  </label>
                  {inputType === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={Boolean(form[col.name])}
                      onChange={e => handleChange(col, '', e.target.checked)}
                    />
                  ) : (
                    <input
                      type={inputType}
                      value={value}
                      onChange={e => handleChange(col, e.target.value)}
                      required={isRequired}
                      placeholder={col.nullable ? '(optionnel)' : `Entrez ${col.name}`}
                      step={inputType === 'number' ? 'any' : undefined}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="record-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save">{isEdit ? '💾 Enregistrer' : '✓ Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
