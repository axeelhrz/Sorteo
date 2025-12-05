'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import RaffleCard from '@/components/marketplace/RaffleCard';
import RaffleFilters from '@/components/marketplace/RaffleFilters';
import EmptyState from '@/components/marketplace/EmptyState';
import HowItWorks from '@/components/marketplace/HowItWorks';
import { publicRaffleService, RaffleFilters as RaffleFiltersType } from '@/services/public-raffle-service';
import { Raffle } from '@/types/raffle';
import styles from './sorteos.module.css';

export default function SorteosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [shops, setShops] = useState<Array<{ id: string; name: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRaffles, setTotalRaffles] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<RaffleFiltersType>({
    sortBy: 'newest',
    page: 1,
    limit: 12,
  });

  // Cargar categorías y tiendas
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesData, shopsData] = await Promise.all([
          publicRaffleService.getCategories(),
          publicRaffleService.getShopsWithActiveRaffles(),
        ]);
        setCategories(categoriesData);
        setShops(shopsData);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };

    loadMetadata();
  }, []);

  // Cargar sorteos
  const loadRaffles = useCallback(async (filters: RaffleFiltersType) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔍 Cargando sorteos activos con filtros:', filters);
      const result = await publicRaffleService.getActiveRaffles(filters);
      console.log('✅ Sorteos activos cargados:', result.data.length, 'de', result.total);
      setRaffles(result.data);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
      setTotalRaffles(result.total);
    } catch (err: any) {
      console.error('❌ Error loading raffles:', err);
      setError('No pudimos cargar los sorteos. Intenta nuevamente.');
      setRaffles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar sorteos iniciales
  useEffect(() => {
    loadRaffles(currentFilters);
  }, []);

  // Manejar cambios de filtros
  const handleFiltersChange = (newFilters: RaffleFiltersType) => {
    const updatedFilters = {
      ...currentFilters,
      ...newFilters,
      page: newFilters.page || 1,
    };
    setCurrentFilters(updatedFilters);
    loadRaffles(updatedFilters);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    const updatedFilters = {
      ...currentFilters,
      page,
    };
    setCurrentFilters(updatedFilters);
    loadRaffles(updatedFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar reintentar
  const handleRetry = () => {
    loadRaffles(currentFilters);
  };

  return (
    <main className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Sorteos Disponibles</h1>
        <p className={styles.subtitle}>
          Descubre increíbles premios y participá en nuestros sorteos
        </p>
      </div>

      {/* Filters */}
      <RaffleFilters
        onFiltersChange={handleFiltersChange}
        categories={categories}
        shops={shops}
        isLoading={isLoading}
      />

      {/* Results Info */}
      {!isLoading && raffles.length > 0 && (
        <div className={styles.resultsInfo}>
          <p>
            Mostrando <strong>{raffles.length}</strong> de <strong>{totalRaffles}</strong> sorteos
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Cargando sorteos...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <EmptyState type="error" onRetry={handleRetry} />
      )}

      {/* Empty State */}
      {!isLoading && !error && raffles.length === 0 && (
        <EmptyState
          type={currentFilters.search ? 'no-results' : 'no-raffles'}
        />
      )}

      {/* Raffles Grid */}
      {!isLoading && !error && raffles.length > 0 && (
        <>
          <div className={styles.grid}>
            {raffles.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                ← Anterior
              </button>

              <div className={styles.pageInfo}>
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* How It Works Section */}
      <HowItWorks />

      {/* CTA Section */}
      <div className={styles.ctaSection}>
        <h2>¿Eres una tienda?</h2>
        <p>Crea sorteos y llega a miles de clientes potenciales</p>
        <Link href="/register">
          <button className={styles.ctaButton}>Registra tu tienda</button>
        </Link>
      </div>
    </main>
  );
}