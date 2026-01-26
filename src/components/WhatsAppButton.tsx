'use client';

import React from 'react';
import styles from './WhatsAppButton.module.css';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = '5491234567890'; // Reemplaza con tu número de WhatsApp (código de país + número sin espacios ni guiones)
  const defaultMessage = `Hola
Estoy visitando TIKETEA y quiero más información sobre cómo funcionan las oportunidades y la compra de tickets.
¿Podrían ayudarme, por favor?`;

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      className={styles.whatsappButton}
      onClick={handleClick}
      aria-label="Contactar por WhatsApp"
      title="¿Necesitas ayuda? Escríbenos por WhatsApp"
    >
      <svg
        viewBox="0 0 32 32"
        className={styles.whatsappIcon}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 0C7.164 0 0 7.164 0 16c0 2.825.738 5.488 2.031 7.794L.05 31.95l8.344-2.187A15.936 15.936 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.333c-2.444 0-4.794-.656-6.806-1.9l-.488-.294-5.056 1.325 1.35-4.931-.325-.506A13.267 13.267 0 012.667 16c0-7.364 5.97-13.333 13.333-13.333S29.333 8.636 29.333 16 23.364 29.333 16 29.333z" />
        <path d="M23.094 19.525c-.394-.2-2.331-1.15-2.694-1.281-.362-.131-.625-.2-.888.2-.262.4-1.019 1.281-1.25 1.544-.231.262-.462.294-.856.094-.394-.2-1.663-.613-3.169-1.956-1.169-1.044-1.956-2.331-2.188-2.725-.231-.394-.025-.606.175-.8.181-.181.394-.469.594-.706.2-.231.262-.394.394-.656.131-.262.069-.494-.031-.694-.1-.2-.888-2.137-1.219-2.925-.319-.769-.644-.663-.888-.675-.231-.012-.494-.012-.756-.012s-.694.1-1.056.494c-.362.394-1.381 1.35-1.381 3.294s1.413 3.819 1.613 4.081c.2.262 2.825 4.313 6.844 6.05.956.413 1.7.656 2.281.844.962.306 1.838.262 2.531.156.769-.119 2.331-.956 2.662-1.875.331-.919.331-1.706.231-1.875-.1-.169-.362-.269-.756-.469z" />
      </svg>
    </button>
  );
};

export default WhatsAppButton;