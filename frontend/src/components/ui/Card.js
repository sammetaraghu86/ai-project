'use client';

import styles from './Card.module.css';

export default function Card({
  children, className = '', hover = true, glow = false, padding = 'md', onClick
}) {
  return (
    <div
      className={`${styles.card} ${hover ? styles.hover : ''} ${glow ? styles.glow : ''} ${styles[`pad-${padding}`]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
