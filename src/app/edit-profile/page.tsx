'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiArrowLeft } from 'react-icons/fi';
import { firebaseAuthService } from '@/services/firebase-auth-service';
import { useAuthStore } from '@/store/auth-store';
import Logo from '@/components/Logo';
import styles from '@/components/RegisterForm.module.css';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
    });
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (formData.name.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);

    try {
      const updatedUser = await firebaseAuthService.updateUserName(formData.name);
      if (updatedUser) {
        setUser(updatedUser);
        setSuccess(true);

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <Link href="/dashboard" className={styles.backLink}>
          <FiArrowLeft />
          Volver
        </Link>

        <Logo size="medium" className={styles.logo} />
        <h2 className={styles.title}>Editar Perfil</h2>
        <p className={styles.subtitle}>Actualiza tu información personal</p>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && (
          <div className={styles.successMessage}>
            Perfil actualizado correctamente. Redirigiendo...
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              <FiUser className={styles.labelIcon} />
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={3}
              className={styles.input}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              <FiMail className={styles.labelIcon} />
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className={styles.input}
              placeholder="tu@email.com"
            />
            <small className={styles.helpText}>
              El correo no puede ser modificado
            </small>
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link href="/change-password" className={styles.footerLink}>
              Cambiar contraseña
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}