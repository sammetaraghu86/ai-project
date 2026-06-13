'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLanding = pathname === '/';

  return (
    <header className={`${styles.header} ${!isLanding ? styles.solid : ''}`}>
      <div className={styles.inner}>
        <div className={styles.logo} onClick={() => router.push('/')}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>ResumeAI</span>
        </div>

        <nav className={styles.nav}>
          {isAuthenticated ? (
            <>
              <a className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}
                onClick={() => router.push('/dashboard')}>Dashboard</a>
              <a className={`${styles.navLink} ${pathname === '/resume' ? styles.active : ''}`}
                onClick={() => router.push('/resume')}>Resume</a>
              <a className={`${styles.navLink} ${pathname === '/cover-letter' ? styles.active : ''}`}
                onClick={() => router.push('/cover-letter')}>Cover Letter</a>
              <a className={`${styles.navLink} ${pathname === '/portfolio' ? styles.active : ''}`}
                onClick={() => router.push('/portfolio')}>Portfolio</a>
              <div className={styles.divider} />
              <div className={styles.userMenu}>
                <span className={styles.avatar}>{user?.name?.[0] || '?'}</span>
                <span className={styles.userName}>{user?.name}</span>
                <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/'); }}>
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              {!isLanding && (
                <a className={styles.navLink} onClick={() => router.push('/')}>Home</a>
              )}
              <button className={styles.loginBtn} onClick={() => router.push('/login')}>
                Sign In
              </button>
              <button className={styles.signupBtn} onClick={() => router.push('/register')}>
                Get Started
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
