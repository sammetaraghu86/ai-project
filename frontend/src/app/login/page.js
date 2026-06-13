'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
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
          <h1>Welcome Back</h1>
          <p>Sign in to continue building your career documents</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="login-email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            icon="✉"
          />
          <Input
            label="Password"
            type="password"
            name="login-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            icon="🔒"
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Don't have an account?{' '}
            <a onClick={() => router.push('/register')}>Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
