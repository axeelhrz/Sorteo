'use client';

import { useEffect, useState } from 'react';
import { ComplaintMessage } from '@/types/complaint';
import { complaintService } from '@/services/complaint-service';
import styles from './complaints.module.css';

interface ComplaintMessagesProps {
  complaintId: string;
  currentUserId: string;
}

export default function ComplaintMessages({
  complaintId,
  currentUserId,
}: ComplaintMessagesProps) {
  const [messages, setMessages] = useState<ComplaintMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await complaintService.getMessages(complaintId);
        setMessages(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar mensajes');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [complaintId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError(null);

    try {
      const message = await complaintService.addMessage(complaintId, newMessage);
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className={styles.loading}>Cargando mensajes...</div>;

  return (
    <div className={styles.messagesContainer}>
      <h3>Conversación</h3>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.messagesList}>
        {messages.length === 0 ? (
          <p className={styles.noMessages}>No hay mensajes aún</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.senderId === currentUserId ? styles.messageSent : styles.messageReceived
              }`}
            >
              <div className={styles.messageHeader}>
                <strong>{msg.sender?.name || 'Usuario'}</strong>
                <small>{new Date(msg.createdAt).toLocaleString('es-ES')}</small>
              </div>
              <p>{msg.message}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          maxLength={5000}
          rows={3}
          disabled={sending}
        />
        <div className={styles.messageFormFooter}>
          <small>{newMessage.length}/5000</small>
          <button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}