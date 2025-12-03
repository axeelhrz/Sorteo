'use client';

import { useEffect, useState } from 'react';
import { Complaint, ComplaintStatus, ComplaintResolution } from '@/types/complaint';
import { complaintService } from '@/services/complaint-service';
import styles from './complaints.module.css';

interface ComplaintDetailProps {
  complaintId: string;
  onUpdate?: () => void;
}

export default function ComplaintDetail({ complaintId,  }: ComplaintDetailProps) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabels: Record<ComplaintStatus, string> = {
    [ComplaintStatus.PENDING]: 'Pendiente',
    [ComplaintStatus.IN_REVIEW]: 'En Revisión',
    [ComplaintStatus.RESOLVED]: 'Resuelto',
    [ComplaintStatus.REJECTED]: 'Rechazado',
    [ComplaintStatus.CANCELLED]: 'Cancelado',
  };

  const resolutionLabels: Record<ComplaintResolution, string> = {
    [ComplaintResolution.RESOLVED_USER_FAVOR]: 'A favor del usuario',
    [ComplaintResolution.RESOLVED_SHOP_FAVOR]: 'A favor de la tienda',
    [ComplaintResolution.RESOLVED_PLATFORM_FAVOR]: 'Resolución parcial',
    [ComplaintResolution.REJECTED]: 'Rechazado',
    [ComplaintResolution.CANCELLED]: 'Cancelado',
  };

  const getStatusColor = (status: ComplaintStatus): string => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return '#FFA500';
      case ComplaintStatus.IN_REVIEW:
        return '#4169E1';
      case ComplaintStatus.RESOLVED:
        return '#228B22';
      case ComplaintStatus.REJECTED:
        return '#DC143C';
      case ComplaintStatus.CANCELLED:
        return '#808080';
      default:
        return '#000';
    }
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const data = await complaintService.getComplaintById(complaintId);
        setComplaint(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el reclamo');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!complaint) return <div className={styles.error}>Reclamo no encontrado</div>;

  const maxResponseDate = new Date(complaint.maxResponseDate);
  const daysRemaining = Math.ceil((maxResponseDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={styles.detailContainer}>
      <div className={styles.header}>
        <div>
          <h2>Reclamo #{complaint.complaintNumber}</h2>
          <p className={styles.createdDate}>
            Creado: {new Date(complaint.createdAt).toLocaleDateString('es-ES')}
          </p>
        </div>
        <div
          className={styles.statusBadge}
          style={{ backgroundColor: getStatusColor(complaint.status) }}
        >
          {statusLabels[complaint.status]}
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <label>Tipo de Reclamo:</label>
          <span>{complaint.type}</span>
        </div>
        <div className={styles.infoItem}>
          <label>Tienda:</label>
          <span>{complaint.shop?.name || 'N/A'}</span>
        </div>
        <div className={styles.infoItem}>
          <label>Sorteo:</label>
          <span>{complaint.raffle?.id || 'N/A'}</span>
        </div>
        <div className={styles.infoItem}>
          <label>Admin Asignado:</label>
          <span>{complaint.assignedAdmin?.name || 'Sin asignar'}</span>
        </div>
      </div>

      <div className={styles.descriptionSection}>
        <h3>Descripción del Problema</h3>
        <p>{complaint.description}</p>
      </div>

      {complaint.resolution && (
        <div className={styles.resolutionSection}>
          <h3>Resolución</h3>
          <div className={styles.resolutionInfo}>
            <p>
              <strong>Resultado:</strong> {resolutionLabels[complaint.resolution]}
            </p>
            {complaint.resolutionNotes && (
              <p>
                <strong>Notas:</strong> {complaint.resolutionNotes}
              </p>
            )}
            {complaint.resolvedAt && (
              <p>
                <strong>Resuelto:</strong> {new Date(complaint.resolvedAt).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </div>
      )}

      <div className={styles.deadlineSection}>
        <p>
          <strong>Fecha Máxima de Respuesta:</strong>{' '}
          {maxResponseDate.toLocaleDateString('es-ES')}
          {daysRemaining > 0 ? (
            <span style={{ color: '#228B22' }}> ({daysRemaining} días restantes)</span>
          ) : (
            <span style={{ color: '#DC143C' }}> (Vencido)</span>
          )}
        </p>
      </div>

      {complaint.attachments && complaint.attachments.length > 0 && (
        <div className={styles.attachmentsSection}>
          <h3>Adjuntos ({complaint.attachments.length})</h3>
          <div className={styles.attachmentsList}>
            {complaint.attachments.map((attachment) => (
              <div key={attachment.id} className={styles.attachmentItem}>
                <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                  {attachment.fileName}
                </a>
                <small>
                  {(attachment.fileSize / 1024).toFixed(2)} KB - {attachment.fileType}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}