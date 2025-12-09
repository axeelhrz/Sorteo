'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { firebaseAuthService } from '@/services/firebase-auth-service';
import Logo from '@/components/Logo';
import styles from '@/components/RegisterForm.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);

    try {
      await firebaseAuthService.sendPasswordReset(email);
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Error al enviar correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <Link href="/login" className={styles.backLink}>
          <FiArrowLeft />
          Volver
        </Link>

        <Logo size="medium" className={styles.logo} />
        <h2 className={styles.title}>Recuperar Contraseña</h2>
        <p className={styles.subtitle}>
          Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && (
          <div className={styles.successMessage}>
            Se ha enviado un correo de recuperación a tu dirección de email. Por favor revisa tu bandeja de entrada.
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <FiMail className={styles.labelIcon} />
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="tu@email.com"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>
          </form>
        ) : (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Si no ves el correo en tu bandeja de entrada, revisa la carpeta de spam.
            </p>
            <Link href="/login" className={styles.submitButton} style={{ display: 'inline-block' }}>
              Volver a Iniciar Sesión
            </Link>
          </div>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿Recuerdas tu contraseña?{' '}
            <Link href="/login" className={styles.footerLink}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}