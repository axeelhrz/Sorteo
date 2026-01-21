'use client';

import { FiAlertCircle, FiSearch, FiInbox } from 'react-icons/fi';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  type: 'no-raffles' | 'no-results' | 'error';
  onRetry?: () => void;
}

export default function EmptyState({ type, onRetry }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-raffles':
        return {
          icon: FiInbox,
          title: 'No hay oportunidades activas',
          description: 'No hay oportunidades disponibles en este momento. Vuelve pronto para descubrir nuevas oportunidades.',
          showRetry: false,
        };
      case 'no-results':
        return {
          icon: FiSearch,
          title: 'Sin resultados',
          description: 'No encontramos oportunidades que coincidan con tu búsqueda. Intenta ajustar los filtros.',
          showRetry: false,
        };
      case 'error':
        return {
          icon: FiAlertCircle,
          title: 'Error al cargar',
          description: 'No pudimos cargar las oportunidades. Por favor, intenta nuevamente.',
          showRetry: true,
        };
      default:
        return {
          icon: FiInbox,
          title: 'Sin datos',
          description: 'No hay datos disponibles.',
          showRetry: false,
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <IconComponent className={styles.icon} />
      </div>
      <h2 className={styles.title}>{content.title}</h2>
      <p className={styles.description}>{content.description}</p>
      {content.showRetry && onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Reintentar
        </button>
      )}
    </div>
  );
}