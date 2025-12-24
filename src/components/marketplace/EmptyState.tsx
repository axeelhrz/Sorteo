'use client';

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
          icon: '🎲',
          title: 'No hay oportunidades activas',
          description: 'No hay oportunidades activas en este momento. Vuelve pronto o sigue a nuestras tiendas para estar al tanto de los próximos lanzamientos.',
          showRetry: false,
        };
      case 'no-results':
        return {
          icon: '🔍',
          title: 'No encontramos oportunidades',
          description: 'No encontramos oportunidades que coincidan con tu búsqueda. Intenta con otros filtros o términos de búsqueda.',
          showRetry: false,
        };
      case 'error':
        return {
          icon: '⚠️',
          title: 'Ocurrió un problema',
          description: 'Ocurrió un problema al cargar las oportunidades. Intenta nuevamente.',
          showRetry: true,
        };
      default:
        return {
          icon: '📦',
          title: 'Sin datos',
          description: 'No hay datos disponibles.',
          showRetry: false,
        };
    }
  };

  const content = getContent();

  return (
    <div className={styles.container}>
      <div className={styles.icon}>{content.icon}</div>
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