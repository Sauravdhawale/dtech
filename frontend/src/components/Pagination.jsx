import React from 'react';

export default function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div className="pager">
      <button disabled={page <= 1} onClick={() => onPageChange(1)}>«</button>
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</button>
      {pages.map((p) => <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>{p}</button>)}
      <button disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>›</button>
      <button disabled={page >= pageCount} onClick={() => onPageChange(pageCount)}>»</button>
    </div>
  );
}
