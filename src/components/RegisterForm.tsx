'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiUserPlus, FiShoppingBag } from 'react-icons/fi';
import { firebaseAuthService } from '@/services/firebase-auth-service';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import Logo from './Logo';
import styles from './RegisterForm.module.css';

export default function RegisterForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as UserRole,
    shopName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que si el rol es shop, se proporcione el nombre de la tienda
    if (formData.role === 'shop' && !formData.shopName.trim()) {
      setError('El nombre de la tienda es requerido');
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para enviar
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as UserRole,
        shopName: formData.role === 'shop' ? formData.shopName.trim() : undefined,
      };

      const { user, token } = await firebaseAuthService.register(registerData);

      // Guardar token primero
      setToken(token);
      
      // Guardar usuario
      setUser(user);

      // Redirigir al dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <Logo size="medium" className={styles.logo} />
        <h2 className={styles.title}>Crear Cuenta</h2>
        <p className={styles.subtitle}>Únete a nuestra plataforma y comienza a participar</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
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
              minLength={8}
              className={styles.input}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Tipo de cuenta
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="user">Usuario</option>
              <option value="shop">Tienda</option>
            </select>
          </div>

          {formData.role === 'shop' && (
          <div className={styles.formGroup}>
            <label htmlFor="shopName" className={styles.label}>
              <FiShoppingBag className={styles.labelIcon} />
              Nombre de la Tienda
            </label>
              <input
                type="text"
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
                minLength={3}
                className={styles.input}
                placeholder="Ej: Mi Tienda de Sorteos"
              />
              <small className={styles.helpText}>
                Este será el nombre de tu tienda en la plataforma
              </small>
            </div>
          )}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              'Registrando...'
            ) : (
              <>
                <FiUserPlus className={styles.buttonIcon} />
                Crear Cuenta
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className={styles.footerLink}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}