'use client';

import React, { useEffect, useState } from 'react';
import UserPanelLayout from '@/components/UserPanel/UserPanelLayout';
import { userPanelService } from '@/services/user-panel-service';
import type { UserProfile, UserPreferences, UserSecuritySettings } from '@/types/user-panel';
import styles from './profile.module.css';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [, setProfile] = useState<UserProfile | null>(null);
  const [, setPreferences] = useState<UserPreferences | null>(null);
  const [security, setSecurity] = useState<UserSecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
  });

  const [preferencesData, setPreferencesData] = useState<UserPreferences>({
    emailNotifications: true,
    emailPromotions: false,
    language: 'es',
    timezone: 'America/Argentina/Buenos_Aires',
    privacyShowInitials: false,
    privacyHideTicketList: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, preferencesData, securityData] = await Promise.all([
          userPanelService.getProfile(),
          userPanelService.getPreferences(),
          userPanelService.getSecuritySettings(),
        ]);

        setProfile(profileData);
        setPreferences(preferencesData);
        setSecurity(securityData);

        setFormData({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || '',
          country: profileData.country || '',
          city: profileData.city || '',
        });

        setPreferencesData(preferencesData);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Error al cargar tu perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await userPanelService.updateProfile(formData);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil');
    }
  };

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setPreferencesData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await userPanelService.updatePreferences(preferencesData);
      setSuccess('Preferencias actualizadas correctamente');
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Error al actualizar las preferencias');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await userPanelService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccess('Contraseña cambiada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Error al cambiar la contraseña');
    }
  };

  const handleCloseAllSessions = async () => {
    if (confirm('¿Estás seguro? Se cerrarán todas tus sesiones activas.')) {
      try {
        setError(null);
        setSuccess(null);
        await userPanelService.closeAllSessions();
        setSuccess('Todas las sesiones han sido cerradas');
      } catch (err) {
        console.error('Error closing sessions:', err);
        setError('Error al cerrar las sesiones');
      }
    }
  };

  if (loading) {
    return (
      <UserPanelLayout activeSection="profile">
        <div className={styles.loadingContainer}>
          <p>Cargando perfil...</p>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout activeSection="profile">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>👤 Mi Perfil</h1>
          <p className={styles.subtitle}>
            Gestiona tu información personal, preferencias y seguridad
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Datos Personales
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'preferences' ? styles.active : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Preferencias
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'security' ? styles.active : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Seguridad
          </button>
        </div>

        <div className={styles.content}>
          {/* Datos Personales */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className={styles.form}>
              <h2>Datos Personales</h2>

              <div className={styles.formGroup}>
                <label htmlFor="name">Nombre Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  required
                  disabled
                />
                <small>El email no puede ser modificado</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="country">País</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="city">Ciudad</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                Guardar Cambios
              </button>
            </form>
          )}

          {/* Preferencias */}
          {activeTab === 'preferences' && (
            <form onSubmit={handlePreferencesSubmit} className={styles.form}>
              <h2>Preferencias</h2>

              <div className={styles.section}>
                <h3>Notificaciones</h3>

                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={preferencesData.emailNotifications}
                      onChange={handlePreferencesChange}
                    />
                    Recibir notificaciones por email
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="emailPromotions"
                      checked={preferencesData.emailPromotions}
                      onChange={handlePreferencesChange}
                    />
                    Recibir emails promocionales
                  </label>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Configuración Regional</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="language">Idioma</label>
                  <select
                    id="language"
                    name="language"
                    value={preferencesData.language}
                    onChange={handlePreferencesChange}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="timezone">Zona Horaria</label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={preferencesData.timezone}
                    onChange={handlePreferencesChange}
                  >
                    <option value="America/Argentina/Buenos_Aires">Argentina (Buenos Aires)</option>
                    <option value="America/Mexico_City">México (Ciudad de México)</option>
                    <option value="America/Bogota">Colombia (Bogotá)</option>
                    <option value="America/Lima">Perú (Lima)</option>
                    <option value="America/Santiago">Chile (Santiago)</option>
                  </select>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Privacidad</h3>

                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="privacyShowInitials"
                      checked={preferencesData.privacyShowInitials}
                      onChange={handlePreferencesChange}
                    />
                    Mostrar solo mis iniciales cuando gano un sorteo
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="privacyHideTicketList"
                      checked={preferencesData.privacyHideTicketList}
                      onChange={handlePreferencesChange}
                    />
                    Ocultar mi lista de tickets públicamente
                  </label>
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                Guardar Preferencias
              </button>
            </form>
          )}

          {/* Seguridad */}
          {activeTab === 'security' && (
            <div className={styles.securitySection}>
              <h2>Seguridad</h2>

              <div className={styles.section}>
                <h3>Cambiar Contraseña</h3>
                <form onSubmit={handlePasswordSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="currentPassword">Contraseña Actual *</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="newPassword">Nueva Contraseña *</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <button type="submit" className={styles.submitButton}>
                    Cambiar Contraseña
                  </button>
                </form>
              </div>

              <div className={styles.section}>
                <h3>Sesiones Activas</h3>
                <p>Sesiones activas: <strong>{security?.activeSessions || 0}</strong></p>
                <button
                  onClick={handleCloseAllSessions}
                  className={styles.dangerButton}
                >
                  Cerrar Todas las Sesiones
                </button>
              </div>

              {security?.twoFactorEnabled && (
                <div className={styles.section}>
                  <h3>Autenticación de Dos Factores</h3>
                  <p className={styles.enabledBadge}>✅ Habilitada</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </UserPanelLayout>
  );
}