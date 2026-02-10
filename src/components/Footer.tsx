'use client';

import Link from 'next/link';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin, FiLock, FiCheckCircle, FiAward, FiShield } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import styles from './Footer.module.css';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '984908819';
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'tiketea.online@gmail.com';
const WHATSAPP_URL = `https://wa.me/51${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=Hola%20👋%0A%0AEstoy%20visitando%20TIKETEA%20y%20quiero%20más%20información%20sobre%20cómo%20funcionan%20las%20oportunidades%20y%20la%20compra%20de%20tickets.%0A%0A¿Podrían%20ayudarme,%20por%20favor?`;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, isHydrated } = useAuth();
  const isAdmin = isHydrated && user?.role === UserRole.ADMIN;

  return (
    <footer className={styles.footer}>
      {/* Main Footer Content */}
      <div className={styles.footerContent}>
        <div className={styles.container}>
          {/* Column 1: About */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Sobre TIKETEA</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/">Inicio</Link>
              </li>
              <li>
                <Link href="/register">Registrarse</Link>
              </li>
              <li>
                <Link href="/sorteos">Explorar Sorteos</Link>
              </li>
              <li>
                <Link href="/faq">Preguntas Frecuentes</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Users */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Para Usuarios</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/login">Iniciar Sesión</Link>
              </li>
              <li>
                <Link href="/dashboard">Mi Cuenta</Link>
              </li>
              <li>
                <Link href="/user-panel/purchase-history">Historial de Compras</Link>
              </li>
              <li>
                <Link href="/user-panel/participations">Mis Participaciones</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Organizers */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Para Organizadores</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/register">Registrate como Organizador</Link>
              </li>
              <li>
                <Link href="/dashboard">Panel de Control</Link>
              </li>
              <li>
                <Link href="/faq">Guía de Organizadores</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/dashboard/admin">Administración</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Legal</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/legal/terms">Términos y Condiciones</Link>
              </li>
              <li>
                <Link href="/legal/privacy">Política de Privacidad</Link>
              </li>
              <li>
                <Link href="/legal/refund-policy">Política de Reembolsos</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact & Social */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Contacto</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FiMail className={styles.contactIcon} />
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </div>
              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} />
                <a href={`https://wa.me/51${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  +51 {WHATSAPP_NUMBER}
                </a>
              </div>
              <div className={styles.contactItem}>
                <FiMapPin className={styles.contactIcon} />
                <span>Lima, Perú</span>
              </div>
            </div>
            <div className={styles.socialLinks}>
              <a
                href="https://www.instagram.com/tiketeaonline/"
                title="Instagram"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href={WHATSAPP_URL}
                title="WhatsApp"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Trust Section */}
      <div className={styles.trustSection}>
        <div className={styles.trustContainer}>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <FiLock />
            </div>
            <div className={styles.trustText}>
              <h4>Seguro</h4>
              <p>Encriptación SSL y procesamiento seguro de pagos</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <FiCheckCircle />
            </div>
            <div className={styles.trustText}>
              <h4>Autogestionado</h4>
              <p>Cada Organizador publica y gestiona sus propias oportunidades dentro de la plataforma.</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <FiAward />
            </div>
            <div className={styles.trustText}>
              <h4>Transparente</h4>
              <p>Resultados automáticos, claros y verificables dentro del sistema.</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <FiShield />
            </div>
            <div className={styles.trustText}>
              <h4>Condiciones claras</h4>
              <p>Reglas, procesos y responsabilidades definidos para cada oportunidad.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className={styles.bottomFooter}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>
            © {currentYear} TIKETEA ONLINE. Todos los derechos reservados.
          </p>
          <div className={styles.bottomLinks}>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>
              Volver al inicio ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}