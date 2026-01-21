'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import UserPanelLayout from '@/components/UserPanel/UserPanelLayout';
import { userPanelService } from '@/services/user-panel-service';
import type { UserComplaintSummary } from '@/types/user-panel';
import styles from './support.module.css';

export default function SupportPage() {
  const [complaints, setComplaints] = useState<UserComplaintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await userPanelService.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Error al cargar tus reclamos');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <UserPanelLayout activeSection="support">
        <div className={styles.loadingContainer}>
          <p>Cargando centro de soporte...</p>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout activeSection="support">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>💬 Centro de Soporte</h1>
          <p className={styles.subtitle}>
            Aquí puedes crear y seguir tus reclamos
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.toolbar}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={styles.createButton}
          >
            {showCreateForm ? '✕ Cancelar' : '+ Crear Nuevo Reclamo'}
          </button>
        </div>

        {showCreateForm && (
          <div className={styles.createFormSection}>
            <h2>Crear Nuevo Reclamo</h2>
            <p className={styles.formInfo}>
              Para crear un reclamo, haz clic en el botón de abajo. Serás redirigido al formulario completo.
            </p>
            <Link href="/complaints" className={styles.formLink}>
              Ir al Formulario de Reclamos →
            </Link>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Mis Reclamos</h2>

          {complaints.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>🎯</p>
              <h3>No tienes reclamos aún</h3>
              <p>Si tienes algún problema, no dudes en crear un reclamo</p>
              <Link href="/complaints" className={styles.ctaButton}>
                Crear Reclamo
              </Link>
            </div>
          ) : (
            <div className={styles.complaintsList}>
              {complaints.map((complaint) => (
                <div key={complaint.id} className={styles.complaintCard}>
                  <div className={styles.complaintHeader}>
                    <div>
                      <h3 className={styles.complaintNumber}>
                        Reclamo #{complaint.complaintNumber}
                      </h3>
                      <p className={styles.complaintType}>{complaint.type}</p>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[complaint.status]}`}>
                      {complaint.status === 'pending' && '⏳ Pendiente'}
                      {complaint.status === 'in_review' && '👀 En Revisión'}
                      {complaint.status === 'resolved' && '✅ Resuelto'}
                      {complaint.status === 'rejected' && '❌ Rechazado'}
                      {complaint.status === 'cancelled' && '🚫 Cancelado'}
                    </span>
                  </div>

                  <div className={styles.complaintInfo}>
                    {complaint.raffleTitle && (
                      <p>
                        <strong>Sorteo:</strong> {complaint.raffleTitle}
                      </p>
                    )}
                    <p>
                      <strong>Creado:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Actualizado:</strong> {new Date(complaint.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href={`/complaints/${complaint.id}`}
                    className={styles.viewButton}
                  >
                    Ver Detalles →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.helpSection}>
          <h2 className={styles.sectionTitle}>❓ Preguntas Frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuánto tiempo tarda en responder un reclamo?</h4>
              <p>
                Nuestro equipo de soporte responde en un plazo máximo de 48 horas hábiles.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué tipos de reclamos puedo crear?</h4>
            <p>
              Puedes crear reclamos por: premio no entregado, producto diferente, problemas de compra, comportamiento de organizador, fraude en sorteo, problemas técnicos y errores de pago.
            </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo adjuntar evidencia a mi reclamo?</h4>
              <p>
                Sí, puedes adjuntar fotos, capturas de pantalla y otros archivos como evidencia de tu reclamo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa si no estoy satisfecho con la resolución?</h4>
              <p>
                Puedes responder al reclamo con más información o evidencia adicional. Nuestro equipo revisará nuevamente tu caso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserPanelLayout>
  );
}