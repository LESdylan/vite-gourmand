/**
 * Pagination - Modern numbered page navigation with info
 */

import './Pagination.css';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1 && total <= pageSize) return null;

  const pages = buildPageNumbers(page, totalPages);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <nav className="db-pagination" aria-label="Pagination">
      <div className="db-pagination-info">
        Affichage <strong>{startItem}-{endItem}</strong> sur <strong>{total}</strong> enregistrements
      </div>
      <div className="db-pagination-controls">
        <button 
          className="nav-btn" 
          disabled={page === 1} 
          onClick={() => onPageChange(page - 1)}
          title="Page précédente"
        >
          ←
        </button>
        {pages.map((p, i) => (
          p === '...' 
            ? <span key={`ellipsis-${i}`} className="db-pagination-ellipsis">…</span>
            : <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p as number)}>{p}</button>
        ))}
        <button 
          className="nav-btn" 
          disabled={page === totalPages || totalPages === 0} 
          onClick={() => onPageChange(page + 1)}
          title="Page suivante"
        >
          →
        </button>
      </div>
    </nav>
  );
}

function buildPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 0) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}
