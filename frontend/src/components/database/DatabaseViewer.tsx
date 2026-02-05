/**
 * Database Viewer - Full-featured database management interface
 * Supports CRUD operations, search, and schema modifications
 */

import { useEffect, useState } from 'react';
import { useDatabase } from './useDatabase';
import { DatabaseService } from './DatabaseService';
import { TableSelector } from './TableSelector';
import { FilterBar } from './FilterBar';
import { DataTable } from './DataTable';
import { Pagination } from './Pagination';
import { RecordModal } from './RecordModal';
import { SchemaEditor } from './SchemaEditor';
import type { TableRecord, TableColumn } from './types';
import './DatabaseViewer.css';

type ModalType = 
  | { type: 'record'; record: TableRecord | null }
  | { type: 'addColumn' }
  | { type: 'createTable' }
  | null;

export function DatabaseViewer() {
  const db = useDatabase();
  const [modal, setModal] = useState<ModalType>(null);
  const [columns, setColumns] = useState<TableColumn[]>([]);

  useEffect(() => {
    if (db.activeTable) {
      const table = db.tables.find(t => t.name === db.activeTable);
      setColumns(table?.columns || []);
    }
  }, [db.activeTable, db.tables]);

  const handleSave = async (data: Partial<TableRecord>) => {
    if (!db.activeTable) return;
    try {
      if (modal?.type === 'record' && modal.record) {
        await DatabaseService.update(db.activeTable, modal.record.id, data);
      } else {
        await DatabaseService.create(db.activeTable, data);
      }
      setModal(null);
      db.refresh();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'Échec de l\'opération'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!db.activeTable || !confirm('Supprimer cet enregistrement ?')) return;
    try {
      await DatabaseService.delete(db.activeTable, id);
      db.refresh();
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : 'Échec de la suppression'}`);
    }
  };

  const handleSchemaChange = () => {
    setModal(null);
    db.loadTables(); // Reload schema
  };

  return (
    <div className="database-viewer">
      <header className="database-viewer-header">
        <div className="header-left">
          <TableSelector tables={db.tables} active={db.activeTable} onSelect={db.selectTable} />
        </div>
        <div className="header-actions">
          <button 
            className="btn-schema" 
            onClick={() => setModal({ type: 'createTable' })}
            title="Créer une nouvelle table"
          >
            🗂️ Nouvelle Table
          </button>
          {db.activeTable && (
            <>
              <button 
                className="btn-schema" 
                onClick={() => setModal({ type: 'addColumn' })}
                title="Ajouter une colonne"
              >
                ➕ Colonne
              </button>
              <button 
                className="btn-create" 
                onClick={() => setModal({ type: 'record', record: null })}
              >
                + Nouvel Enregistrement
              </button>
            </>
          )}
        </div>
      </header>

      {db.loading && <div className="database-loading">Chargement...</div>}

      {!db.loading && db.tables.length === 0 && (
        <div className="database-placeholder">
          <p>⚠️ Impossible de charger le schéma de la base de données</p>
          {db.error && <p style={{ color: '#f56565', fontSize: '0.875rem' }}>{db.error}</p>}
          <p className="database-placeholder-hint">Vérifiez que le backend est démarré et accessible</p>
          <button onClick={db.loadTables} style={{ marginTop: '1rem' }}>Réessayer</button>
        </div>
      )}

      {!db.activeTable && !db.loading && db.tables.length > 0 && (
        <div className="database-placeholder">
          <p>📊 Sélectionnez une table pour afficher ses données</p>
          <p className="database-placeholder-hint">{db.tables.length} tables disponibles</p>
        </div>
      )}

      {db.activeTable && columns.length > 0 && (
        <>
          <FilterBar 
            columns={columns} 
            searchTerm={db.searchTerm}
            onSearch={db.handleSearch}
            onClear={db.clearSearch}
          />
          <DataTable 
            columns={columns} 
            records={db.records} 
            onEdit={r => setModal({ type: 'record', record: r })} 
            onDelete={handleDelete} 
          />
          <Pagination 
            page={db.pagination.page} 
            pageSize={db.pagination.pageSize} 
            total={db.pagination.total} 
            onPageChange={db.setPage} 
          />
        </>
      )}

      {/* Record Create/Edit Modal */}
      {modal?.type === 'record' && (
        <RecordModal 
          columns={columns} 
          record={modal.record} 
          onSave={handleSave} 
          onClose={() => setModal(null)} 
        />
      )}

      {/* Schema Editor Modal - Add Column */}
      {modal?.type === 'addColumn' && db.activeTable && (
        <SchemaEditor
          mode="addColumn"
          tableName={db.activeTable}
          tables={db.tables}
          onSuccess={handleSchemaChange}
          onClose={() => setModal(null)}
        />
      )}

      {/* Schema Editor Modal - Create Table */}
      {modal?.type === 'createTable' && (
        <SchemaEditor
          mode="createTable"
          tables={db.tables}
          onSuccess={handleSchemaChange}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
