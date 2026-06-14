import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Header from '@/components/layout/Header';

export const metadata = {
  title: 'ResumeAI — AI-Powered Resume & Portfolio Builder',
  description: 'Create stunning, ATS-optimized resumes, personalized cover letters, and professional portfolios powered by AI. Stand out and land your dream job.',
  keywords: 'resume builder, AI resume, cover letter generator, portfolio builder, ATS optimization, career tools',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main style={{ paddingTop: 'var(--header-height)' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
