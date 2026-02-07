'use client';

import React from 'react';
import { FiX } from 'react-icons/fi';
import { CreateRaffleForm } from '@/components/ShopPanel/CreateRaffleForm';
import { Shop } from '@/types/shop';
import styles from './CreateRaffleModal.module.css';

interface CreateRaffleModalProps {
  isOpen: boolean;
  shop: Shop | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRaffleModal({
  isOpen,
  shop,
  onClose,
  onSuccess,
}: CreateRaffleModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Crear Nueva Oportunidad</h2>
            <p className={styles.subtitle}>Completa los detalles de tu oportunidad</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Cerrar modal"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {shop ? (
            <CreateRaffleForm
              shop={shop}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          ) : (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Cargando información de la tienda...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}