import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';

export default function Login({ partner }) {
  const [error, setError] = useState('');
  const brand = partner || { appName: 'Aashi Dreams', tagline: 'Admissions Intelligence', primaryColor: '#7c3aed' };

  async function handleSignIn() {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Google sign-in is not configured yet. Add Firebase environment variables in Railway, or use this page as the public preview.');
      console.error(err);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <section className="card" style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ color: brand.primaryColor, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: '.75rem' }}>
          {brand.tagline}
        </div>
        <h1 style={{ marginTop: '.75rem', fontSize: '2.25rem', lineHeight: 1.05 }}>{brand.appName}</h1>
        <p style={{ marginTop: '1rem', color: '#94a3b8', lineHeight: 1.7 }}>
          Sign in to open your Student Digital Twin dashboard, admissions roadmap, scholarship tracker and partner-branded reports.
        </p>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} onClick={handleSignIn}>
          Continue with Google
        </button>
        {error && <p style={{ marginTop: '1rem', color: '#f59e0b', lineHeight: 1.6 }}>{error}</p>}
      </section>
    </main>
  );
}
