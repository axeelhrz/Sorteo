import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { SocialMedia } from '@/types/shop';
import styles from './SocialMediaLinks.module.css';

interface SocialMediaLinksProps {
  socialMedia?: SocialMedia;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'colored' | 'outlined';
  showLabels?: boolean;
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  socialMedia,
  size = 'medium',
  variant = 'default',
  showLabels = false,
}) => {
  if (!socialMedia) return null;

  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: socialMedia.facebook,
      color: '#1877F2',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: socialMedia.instagram,
      color: '#E4405F',
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: socialMedia.twitter,
      color: '#1DA1F2',
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: socialMedia.tiktok,
      color: '#000000',
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: socialMedia.whatsapp,
      color: '#25D366',
    },
    {
      name: 'Sitio Web',
      icon: FaGlobe,
      url: socialMedia.website,
      color: '#667eea',
    },
  ].filter((link) => link.url);

  if (socialLinks.length === 0) return null;

  const formatUrl = (url: string, platform: string): string => {
    if (!url) return '';
    
    // Si ya es una URL completa, retornarla
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Formatear según la plataforma
    switch (platform) {
      case 'Facebook':
        return `https://facebook.com/${url.replace('@', '')}`;
      case 'Instagram':
        return `https://instagram.com/${url.replace('@', '')}`;
      case 'Twitter':
        return `https://twitter.com/${url.replace('@', '')}`;
      case 'TikTok':
        return `https://tiktok.com/@${url.replace('@', '')}`;
      case 'WhatsApp':
        // Formato: https://wa.me/51984908819
        const phone = url.replace(/\D/g, '');
        return `https://wa.me/${phone}`;
      default:
        return url;
    }
  };

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      {socialLinks.map((link) => {
        const Icon = link.icon;
        const url = formatUrl(link.url!, link.name);

        return (
          <a
            key={link.name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.link} ${styles[variant]}`}
            style={
              variant === 'colored'
                ? { backgroundColor: link.color }
                : variant === 'outlined'
                ? { borderColor: link.color, color: link.color }
                : undefined
            }
            title={link.name}
          >
            <Icon className={styles.icon} />
            {showLabels && <span className={styles.label}>{link.name}</span>}
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaLinks;