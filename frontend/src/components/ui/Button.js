'use client';

import styles from './Button.module.css';

export default function Button({
  children, variant = 'primary', size = 'md', fullWidth = false,
  loading = false, disabled = false, icon, onClick, type = 'button', ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} />
      ) : icon ? (
        <span className={styles.icon}>{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
