'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Create Account</h1>
          <p>Start building AI-powered career documents in seconds</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            name="register-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            icon="👤"
          />
          <Input
            label="Email"
            type="email"
            name="register-email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            icon="✉"
          />
          <Input
            label="Password"
            type="password"
            name="register-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            icon="🔒"
          />
          <Input
            label="Confirm Password"
            type="password"
            name="register-confirm"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
            icon="🔒"
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Create Account
          </Button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Already have an account?{' '}
            <a onClick={() => router.push('/login')}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
