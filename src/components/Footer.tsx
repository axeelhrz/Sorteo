'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
                <Link href="/sorteos">Explorar Sorteos</Link>
              </li>
              <li>
                <Link href="/faq">Preguntas Frecuentes</Link>
              </li>
              <li>
                <Link href="/register">Registrarse</Link>
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

          {/* Column 3: For Shops */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Para Tiendas</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/register">Registrar Tienda</Link>
              </li>
              <li>
                <Link href="/panel">Panel de Control</Link>
              </li>
              <li>
                <Link href="/faq">Guía de Tiendas</Link>
              </li>
              <li>
                <Link href="/admin">Administración</Link>
              </li>
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
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Configuración de cookies'); }}>
                  Configuración de Cookies
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact & Social */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Contacto</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FiMail className={styles.contactIcon} />
                <a href="mailto:support@tiketea.com">support@tiketea.com</a>
              </div>
              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} />
                <a href="tel:+51XXXXXXXXX">+51 XXXXXXXXX</a>
              </div>
              <div className={styles.contactItem}>
                <FiMapPin className={styles.contactIcon} />
                <span>Lima, Perú</span>
              </div>
            </div>
            <div className={styles.socialLinks}>
              <a href="#" title="Facebook" className={styles.socialLink}>
                <FaFacebook />
              </a>
              <a href="#" title="Twitter" className={styles.socialLink}>
                <FaTwitter />
              </a>
              <a href="#" title="Instagram" className={styles.socialLink}>
                <FaInstagram />
              </a>
              <a href="#" title="LinkedIn" className={styles.socialLink}>
                <FaLinkedin />
              </a>
              <a 
                href="https://wa.me/51XXXXXXXXX?text=Hola%20👋%0A%0AEstoy%20visitando%20TIKETEA%20y%20quiero%20más%20información%20sobre%20cómo%20funcionan%20las%20oportunidades%20y%20la%20compra%20de%20tickets.%0A%0A¿Podrían%20ayudarme,%20por%20favor?" 
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
            <div className={styles.trustIcon}>🔒</div>
            <div className={styles.trustText}>
              <h4>100% Seguro</h4>
              <p>Encriptación SSL y procesamiento seguro de pagos</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>✓</div>
            <div className={styles.trustText}>
              <h4>Verificado</h4>
              <p>Tiendas y usuarios verificados</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>⚖️</div>
            <div className={styles.trustText}>
              <h4>Transparente</h4>
              <p>Sorteos criptográficamente verificables</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>🛡️</div>
            <div className={styles.trustText}>
              <h4>Protegido</h4>
              <p>Garantía de entrega de premios</p>
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