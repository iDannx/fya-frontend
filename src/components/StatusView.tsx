import type { ReactNode } from 'react';
import './StatusView.css';

interface StatusViewProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function StatusView({ title, description, action }: StatusViewProps) {
  return (
    <div className="status-view">
      <p className="status-view__title">{title}</p>
      {description && <p className="status-view__description">{description}</p>}
      {action}
    </div>
  );
}
