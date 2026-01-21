'use client';

import { useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { RaffleFilters as RaffleFiltersType } from '@/services/public-raffle-service';
import styles from './RaffleFilters.module.css';

interface RaffleFiltersProps {
  onFiltersChange: (filters: RaffleFiltersType) => void;
  categories?: string[];
  shops?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export default function RaffleFilters({
  onFiltersChange,
  categories = [],
  shops = [],
  isLoading = false,
}: RaffleFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [shopId, setShopId] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'closest' | 'price-asc' | 'price-desc'>('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleApplyFilters = useCallback(() => {
    const filters: RaffleFiltersType = {
      search: search || undefined,
      category: category || undefined,
      shopId: shopId || undefined,
      sortBy,
      page: 1,
    };

    onFiltersChange(filters);
  }, [search, category, shopId, sortBy, onFiltersChange]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setShopId('');
    setSortBy('newest');
    setShowAdvanced(false);
    onFiltersChange({ sortBy: 'newest', page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilters();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as any);
    onFiltersChange({
      search: search || undefined,
      category: category || undefined,
      shopId: shopId || undefined,
      sortBy: value as any,
      page: 1,
    });
  };

  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.mainFilters}>
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar productos o organizadores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              disabled={isLoading}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  onFiltersChange({ sortBy, page: 1 });
                }}
                className={styles.clearButton}
              >
                <FiX />
              </button>
            )}
          </div>
        </form>

        {/* Controls */}
        <div className={styles.controls}>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles.sortSelect}
            disabled={isLoading}
          >
            <option value="newest">Más recientes</option>
            <option value="closest">Próximos a finalizar</option>
            <option value="price-asc">Precio: Menor a mayor</option>
            <option value="price-desc">Precio: Mayor a menor</option>
          </select>

        <button
          type="button"
          className={`${styles.filterButton} ${showAdvanced ? styles.active : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isLoading}
          title="Filtros"
        >
          <FiFilter />
        </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className={styles.advancedFilters}>
          <div className={styles.filterGrid}>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={styles.filterSelect}
                  disabled={isLoading}
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Shop Filter */}
        {shops.length > 0 && (
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Organizador</label>
            <select
              value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  className={styles.filterSelect}
                  disabled={isLoading}
                >
                  <option value="">Todas</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.filterActions}>
            <button
              type="button"
              onClick={handleApplyFilters}
              className={styles.applyButton}
              disabled={isLoading}
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
              disabled={isLoading}
            >
              Limpiar todo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}