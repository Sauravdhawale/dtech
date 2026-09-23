import React from 'react';

export default function StatCard({ value, label, tone = 'info', icon }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div>
        <div className="stat-value">{value ?? 0}</div>
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}
