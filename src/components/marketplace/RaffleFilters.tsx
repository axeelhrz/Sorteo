'use client';

import { useState, useCallback } from 'react';
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
  const [status, setStatus] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'closest' | 'price-asc' | 'price-desc'>('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleApplyFilters = useCallback(() => {
    const filters: RaffleFiltersType = {
      search: search || undefined,
      category: category || undefined,
      shopId: shopId || undefined,
      status: status || undefined,
      minValue: minValue ? parseFloat(minValue) : undefined,
      maxValue: maxValue ? parseFloat(maxValue) : undefined,
      sortBy,
      page: 1,
    };

    onFiltersChange(filters);
  }, [search, category, shopId, status, minValue, maxValue, sortBy, onFiltersChange]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setShopId('');
    setStatus('');
    setMinValue('');
    setMaxValue('');
    setSortBy('newest');
    onFiltersChange({ sortBy: 'newest', page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilters();
  };

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            placeholder="Buscar por nombre de producto, sorteo o tienda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            disabled={isLoading}
          />
          <button type="submit" className={styles.searchButton} disabled={isLoading}>
            <span>🔍</span>
          </button>
        </div>
      </form>

      {/* Sort and Filters Toggle */}
      <div className={styles.controlsRow}>
        <div className={styles.sortControl}>
          <label htmlFor="sortBy" className={styles.label}>
            Ordenar por:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              onFiltersChange({
                sortBy: e.target.value as any,
                page: 1,
              });
            }}
            className={styles.select}
            disabled={isLoading}
          >
            <option value="newest">Más recientes</option>
            <option value="closest">Más cerca de completarse</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
        </div>

        <button
          type="button"
          className={`${styles.toggleButton} ${showAdvanced ? styles.active : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isLoading}
        >
          {showAdvanced ? '✕ Cerrar filtros' : '⚙️ Más filtros'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className={styles.advancedFilters}>
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className={styles.filterGroup}>
              <label htmlFor="category" className={styles.label}>
                Categoría
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="">Todas las categorías</option>
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
            <div className={styles.filterGroup}>
              <label htmlFor="shop" className={styles.label}>
                Tienda
              </label>
              <select
                id="shop"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="">Todas las tiendas</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className={styles.filterGroup}>
            <label htmlFor="status" className={styles.label}>
              Estado
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="sold_out">Agotado</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className={styles.priceRange}>
            <div className={styles.filterGroup}>
              <label htmlFor="minValue" className={styles.label}>
                Precio mínimo (S/)
              </label>
              <input
                id="minValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className={styles.input}
                disabled={isLoading}
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="maxValue" className={styles.label}>
                Precio máximo (S/)
              </label>
              <input
                id="maxValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="Sin límite"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                className={styles.input}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.filterActions}>
            <button
              type="button"
              onClick={handleApplyFilters}
              className={styles.applyButton}
              disabled={isLoading}
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
              disabled={isLoading}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}