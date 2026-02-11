'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiKey, FiCheckCircle } from 'react-icons/fi';
import Logo from '@/components/Logo';
import styles from '@/components/LoginForm.module.css';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    secret: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo registrar');
      }
      setSuccess('Administrador creado correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => router.push('/login/admin'), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al registrar administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <Logo size="medium" className={styles.logo} />
        <h2 className={styles.title}>Registro de Administrador</h2>
        <p className={styles.subtitle}>Esta página no aparece en el login público</p>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && (
          <div className={styles.successMessage} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCheckCircle style={{ fontSize: 20 }} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiUser className={styles.labelIcon} />
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Nombre y apellidos"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiMail className={styles.labelIcon} />
              Correo
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiLock className={styles.labelIcon} />
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className={styles.input}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiKey className={styles.labelIcon} />
              Código secreto
            </label>
            <input
              type="password"
              name="secret"
              value={formData.secret}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Código de seguridad"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Guardando...' : 'Registrar admin'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link href="/login/admin" className={styles.footerLink}>
              ← Volver al login admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
