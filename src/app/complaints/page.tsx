'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Complaint, ComplaintStatus } from '@/types/complaint';
import { complaintService } from '@/services/complaint-service';
import CreateComplaintForm from '@/components/complaints/CreateComplaintForm';
import ComplaintDetail from '@/components/complaints/ComplaintDetail';
import ComplaintMessages from '@/components/complaints/ComplaintMessages';
import styles from './complaints.module.css';

export default function ComplaintsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'detail'>('list');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user, statusFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { complaints: data } = await complaintService.getUserComplaints({
        status: statusFilter as ComplaintStatus | undefined,
        limit: 20,
      });
      setComplaints(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar reclamos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setActiveTab('detail');
  };

  const handleCreateSuccess = () => {
    setActiveTab('list');
    fetchComplaints();
  };

  if (authLoading || !user) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Mis Reclamos</h1>
        <p>Gestiona tus reclamos y seguimiento</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Mis Reclamos ({complaints.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'create' ? styles.active : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Crear Reclamo
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {activeTab === 'list' && (
        <div className={styles.listSection}>
          <div className={styles.filterBar}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | '')}
              className={styles.filterSelect}
            >
              <option value="">Todos los estados</option>
              <option value={ComplaintStatus.PENDING}>Pendiente</option>
              <option value={ComplaintStatus.IN_REVIEW}>En Revisión</option>
              <option value={ComplaintStatus.RESOLVED}>Resuelto</option>
              <option value={ComplaintStatus.REJECTED}>Rechazado</option>
              <option value={ComplaintStatus.CANCELLED}>Cancelado</option>
            </select>
          </div>

          {loading ? (
            <div className={styles.loading}>Cargando reclamos...</div>
          ) : complaints.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No tienes reclamos aún</p>
              <button
                className={styles.createBtn}
                onClick={() => setActiveTab('create')}
              >
                Crear tu primer reclamo
              </button>
            </div>
          ) : (
            <div className={styles.complaintsList}>
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className={styles.complaintCard}
                  onClick={() => handleSelectComplaint(complaint)}
                >
                  <div className={styles.cardHeader}>
                    <h3>#{complaint.complaintNumber}</h3>
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
                            : complaint.status === ComplaintStatus.REJECTED
                            ? '#DC143C'
                            : '#808080',
                      }}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  <p className={styles.cardType}>{complaint.type}</p>
                  <p className={styles.cardDescription}>{complaint.description.substring(0, 100)}...</p>
                  <div className={styles.cardFooter}>
                    <small>{new Date(complaint.createdAt).toLocaleDateString('es-ES')}</small>
                    <small>{complaint.messages?.length || 0} mensajes</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className={styles.createSection}>
          <CreateComplaintForm onSuccess={handleCreateSuccess} />
        </div>
      )}

      {activeTab === 'detail' && selectedComplaint && (
        <div className={styles.detailSection}>
          <button
            className={styles.backBtn}
            onClick={() => setActiveTab('list')}
          >
            ← Volver a la lista
          </button>
          <ComplaintDetail complaintId={selectedComplaint.id} />
          <ComplaintMessages
            complaintId={selectedComplaint.id}
            currentUserId={user.id}
          />
        </div>
      )}
    </div>
  );
}