'use client';

import React, { useEffect, useState } from 'react';
import UserPanelLayout from '@/components/UserPanel/UserPanelLayout';
import { userPanelService } from '@/services/user-panel-service';
import type { UserNotification } from '@/types/user-panel';
import styles from './notifications.module.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await userPanelService.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Error al cargar las notificaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await userPanelService.markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await userPanelService.markAllNotificationsAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <UserPanelLayout activeSection="notifications">
        <div className={styles.loadingContainer}>
          <p>Cargando notificaciones...</p>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout activeSection="notifications">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔔 Notificaciones</h1>
          <p className={styles.subtitle}>
            {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : 'Todas tus notificaciones están leídas'}
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'raffle_won' ? styles.active : ''}`}
              onClick={() => setFilter('raffle_won')}
            >
              Sorteos Ganados
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'tickets_purchased' ? styles.active : ''}`}
              onClick={() => setFilter('tickets_purchased')}
            >
              Compras
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'complaint_response' ? styles.active : ''}`}
              onClick={() => setFilter('complaint_response')}
            >
              Reclamos
            </button>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className={styles.markAllButton}>
              Marcar todas como leídas
            </button>
          )}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>📭</p>
            <h2>No hay notificaciones</h2>
            <p>Aquí aparecerán tus notificaciones importantes</p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
              >
                <div className={styles.notificationIcon}>
                  {notification.type === 'raffle_won' && '🏆'}
                  {notification.type === 'tickets_purchased' && '🎫'}
                  {notification.type === 'raffle_finished' && '✅'}
                  {notification.type === 'complaint_response' && '💬'}
                  {notification.type === 'account_change' && '⚙️'}
                  {notification.type === 'system' && 'ℹ️'}
                </div>

                <div className={styles.notificationContent}>
                  <h3 className={styles.notificationTitle}>{notification.title}</h3>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <p className={styles.notificationDate}>
                    {new Date(notification.createdAt).toLocaleDateString()} -{' '}
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className={styles.notificationActions}>
                  {!notification.isRead && (
                    <button
                      className={styles.markReadBtn}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Marcar como leída
                    </button>
                  )}
                  {notification.actionUrl && (
                    <a href={notification.actionUrl} className={styles.actionLink}>
                      Ver →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserPanelLayout>
  );
}