'use client';

import { useState } from 'react';
import styles from './Input.module.css';

export default function Input({
  label, type = 'text', value, onChange, placeholder, error,
  required = false, disabled = false, textarea = false, rows = 4,
  icon, name, id, ...props
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  const InputTag = textarea ? 'textarea' : 'input';

  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''} ${focused ? styles.focused : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`${styles.label} ${focused || hasValue ? styles.labelFloat : ''}`}
        >
          {label}{required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <InputTag
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={focused ? placeholder : ''}
          disabled={disabled}
          required={required}
          rows={textarea ? rows : undefined}
          className={`${styles.input} ${icon ? styles.hasIcon : ''} ${textarea ? styles.textarea : ''}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
