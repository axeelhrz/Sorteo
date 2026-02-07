'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiCheckCircle } from 'react-icons/fi';
import RaffleCard from '@/components/marketplace/RaffleCard';
import RaffleFilters from '@/components/marketplace/RaffleFilters';
import EmptyState from '@/components/marketplace/EmptyState';
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

  const loadRaffles = useCallback(async (filters: RaffleFiltersType) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await publicRaffleService.getActiveRaffles(filters);
      setRaffles(result.data);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
      setTotalRaffles(result.total);
    } catch (err: any) {
      console.error('Error loading raffles:', err);
      setError('No pudimos cargar los sorteos. Intenta nuevamente.');
      setRaffles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRaffles(currentFilters);
  }, []);

  const handleFiltersChange = (newFilters: RaffleFiltersType) => {
    const updatedFilters = {
      ...currentFilters,
      ...newFilters,
      page: newFilters.page || 1,
    };
    setCurrentFilters(updatedFilters);
    loadRaffles(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = {
      ...currentFilters,
      page,
    };
    setCurrentFilters(updatedFilters);
    loadRaffles(updatedFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    loadRaffles(currentFilters);
  };

  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>Explora y participa</span>
          <h1 className={styles.heroTitle}>Oportunidades Disponibles</h1>
          <p className={styles.heroSubtitle}>
            Descubre productos de alto valor con tickets de bajo costo. Controla tu ventaja y acelera tu oportunidad cuando quieras.
          </p>
        </div>
      </section>

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
            Mostrando <strong>{raffles.length}</strong> de <strong>{totalRaffles}</strong> oportunidades
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Cargando oportunidades...</p>
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
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Proceso</span>
          <h2 className={styles.sectionTitle}>Vive la experiencia</h2>
          <p className={styles.sectionSubtitle}>
            Un proceso simple y transparente en 4 pasos
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>01</div>
            <h3 className={styles.stepTitle}>Explora</h3>
            <p className={styles.stepText}>
              Descubre oportunidades activas, revisa los premios y los tickets disponibles. Elige dónde quieres entrar y cómo jugar tu ventaja.
            </p>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>02</div>
            <h3 className={styles.stepTitle}>Participa</h3>
            <p className={styles.stepText}>
              Consigue tus tickets y aumenta tus posibilidades. Comparte tu oportunidad y ayuda a que avance más rápido.
            </p>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>03</div>
            <h3 className={styles.stepTitle}>Resultado</h3>
            <p className={styles.stepText}>
              Cuando se completan los tickets disponibles, el sistema define el resultado de forma automática, clara y verificable.
            </p>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>04</div>
            <h3 className={styles.stepTitle}>Gana</h3>
            <p className={styles.stepText}>
              Si eres el ganador, coordinas la entrega y recibes tu premio sin complicaciones. Así de simple.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <FiCheckCircle className={styles.benefitIcon} />
            <span>Sistema de selección completamente aleatorio</span>
          </div>
          <div className={styles.benefitItem}>
            <FiCheckCircle className={styles.benefitIcon} />
            <span>Resultados transparentes y verificables</span>
          </div>
          <div className={styles.benefitItem}>
            <FiCheckCircle className={styles.benefitIcon} />
            <span>Notificación inmediata por email</span>
          </div>
          <div className={styles.benefitItem}>
            <FiCheckCircle className={styles.benefitIcon} />
            <span>Experiencias claras y organizadores responsables</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>¿Eres un organizador?</h2>
          <p className={styles.ctaText}>Crea oportunidades y llega a miles de clientes potenciales</p>
          <Link href="/register" className={styles.ctaButton}>
            Registra tu organizador
          </Link>
        </div>
      </section>
    </main>
  );
}