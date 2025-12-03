'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Logo from './Logo';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const response = await apiClient.login(formData);
      const { token, id, name, email, role } = response.data;

      // Guardar token primero
      setToken(token);
      
      // Guardar usuario
      setUser({
        id,
        name,
        email,
        role,
      });

      // Redirigir al dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <Logo size="medium" className={styles.logo} />
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <p className={styles.subtitle}>Accede a tu cuenta para continuar</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              <FiMail className={styles.labelIcon} />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="tu@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              <FiLock className={styles.labelIcon} />
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              'Iniciando sesión...'
            ) : (
              <>
                <FiLogIn className={styles.buttonIcon} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className={styles.footerLink}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}