'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Complaint, ComplaintStatus, ComplaintType } from '@/types/complaint';
import { complaintService } from '@/services/complaint-service';
import styles from './admin-complaints.module.css';

export default function AdminComplaintsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [filters, setFilters] = useState({
    status: '' as ComplaintStatus | '',
    type: '' as ComplaintType | '',
    shopId: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchComplaints();
      fetchStats();
    }
  }, [user, filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { complaints: data } = await complaintService.getAllComplaints({
        status: filters.status || undefined,
        type: filters.type || undefined,
        shopId: filters.shopId || undefined,
        limit: 50,
      });
      setComplaints(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar reclamos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await complaintService.getComplaintStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleSelectComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleExport = async () => {
    try {
      const { data, filename } = await complaintService.exportComplaints({
        status: filters.status || undefined,
        shopId: filters.shopId || undefined,
      });

      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err: any) {
      setError('Error al exportar reclamos');
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestión de Reclamos</h1>
        <p>Administra y resuelve reclamos de usuarios</p>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#FFA500' }}>
              {stats.pending}
            </div>
            <div className={styles.statLabel}>Pendientes</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#4169E1' }}>
              {stats.inReview}
            </div>
            <div className={styles.statLabel}>En Revisión</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#228B22' }}>
              {stats.resolved}
            </div>
            <div className={styles.statLabel}>Resueltos</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#DC143C' }}>
              {stats.rejected}
            </div>
            <div className={styles.statLabel}>Rechazados</div>
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.mainContent}>
        <div className={styles.listPanel}>
          <div className={styles.filterBar}>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as ComplaintStatus | '' })}
              className={styles.filterSelect}
            >
              <option value="">Todos los estados</option>
              <option value={ComplaintStatus.PENDING}>Pendiente</option>
              <option value={ComplaintStatus.IN_REVIEW}>En Revisión</option>
              <option value={ComplaintStatus.RESOLVED}>Resuelto</option>
              <option value={ComplaintStatus.REJECTED}>Rechazado</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as ComplaintType | '' })}
              className={styles.filterSelect}
            >
              <option value="">Todos los tipos</option>
              <option value={ComplaintType.PRIZE_NOT_DELIVERED}>No entrega del premio</option>
              <option value={ComplaintType.DIFFERENT_PRODUCT}>Producto diferente</option>
              <option value={ComplaintType.PURCHASE_PROBLEM}>Problema en compra</option>
              <option value={ComplaintType.SHOP_BEHAVIOR}>Problema con tienda</option>
              <option value={ComplaintType.RAFFLE_FRAUD}>Fraude</option>
              <option value={ComplaintType.TECHNICAL_ISSUE}>Problema técnico</option>
              <option value={ComplaintType.PAYMENT_ERROR}>Error de pago</option>
            </select>

            <button onClick={handleExport} className={styles.exportBtn}>
              📥 Exportar CSV
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Cargando reclamos...</div>
          ) : (
            <div className={styles.complaintsList}>
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className={`${styles.complaintItem} ${
                    selectedComplaint?.id === complaint.id ? styles.selected : ''
                  }`}
                  onClick={() => handleSelectComplaint(complaint)}
                >
                  <div className={styles.itemHeader}>
                    <strong>#{complaint.complaintNumber}</strong>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor:
                          complaint.status === ComplaintStatus.PENDING
                            ? '#FFA500'
                            : complaint.status === ComplaintStatus.IN_REVIEW
                            ? '#4169E1'
                            : complaint.status === ComplaintStatus.RESOLVED
                            ? '#228B22'
                            : '#DC143C',
                      }}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  <p className={styles.itemType}>{complaint.type}</p>
                  <p className={styles.itemUser}>{complaint.user?.email}</p>
                  <small>{new Date(complaint.createdAt).toLocaleDateString('es-ES')}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedComplaint && (
          <div className={styles.detailPanel}>
            <AdminComplaintDetail complaint={selectedComplaint} onUpdate={fetchComplaints} />
          </div>
        )}
      </div>
    </div>
  );
}

function AdminComplaintDetail({
  complaint,
  onUpdate,
}: {
  complaint: Complaint;
  onUpdate: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: complaint.status,
    resolution: complaint.resolution || '',
    resolutionNotes: complaint.resolutionNotes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await complaintService.updateComplaint(complaint.id, {
        status: formData.status as ComplaintStatus,
        resolution: formData.resolution,
        resolutionNotes: formData.resolutionNotes,
      });

      onUpdate();
    } catch (err: any) {
      console.error('Error al actualizar:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.detailContent}>
      <h2>#{complaint.complaintNumber}</h2>

      <div className={styles.detailInfo}>
        <p>
          <strong>Usuario:</strong> {complaint.user?.email}
        </p>
        <p>
          <strong>Tipo:</strong> {complaint.type}
        </p>
        <p>
          <strong>Tienda:</strong> {complaint.shop?.name || 'N/A'}
        </p>
        <p>
          <strong>Creado:</strong> {new Date(complaint.createdAt).toLocaleDateString('es-ES')}
        </p>
      </div>

      <div className={styles.descriptionBox}>
        <h3>Descripción</h3>
        <p>{complaint.description}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.updateForm}>
        <div className={styles.formGroup}>
          <label>Estado</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ComplaintStatus })}
          >
            <option value={ComplaintStatus.PENDING}>Pendiente</option>
            <option value={ComplaintStatus.IN_REVIEW}>En Revisión</option>
            <option value={ComplaintStatus.RESOLVED}>Resuelto</option>
            <option value={ComplaintStatus.REJECTED}>Rechazado</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Resolución</label>
          <select
            value={formData.resolution}
            onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="resolved_user_favor">A favor del usuario</option>
            <option value="resolved_shop_favor">A favor de la tienda</option>
            <option value="resolved_platform_favor">Resolución parcial</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Notas de Resolución</label>
          <textarea
            value={formData.resolutionNotes}
            onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
            rows={4}
            placeholder="Escribe las notas de resolución..."
          />
        </div>

        <button type="submit" disabled={updating} className={styles.submitBtn}>
          {updating ? 'Actualizando...' : 'Actualizar Reclamo'}
        </button>
      </form>
    </div>
  );
}