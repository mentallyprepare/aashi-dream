import React from 'react';

export default function Dashboard({ user, partner }) {
  const brand = partner || { appName: 'Aashi Dreams', primaryColor: '#7c3aed' };
  const modules = [
    ['Admissions Fit', 'Compare target colleges, deadlines, acceptance difficulty and missing proof.'],
    ['Scholarship Radar', 'Track official funding forms, eligibility evidence and deadline windows.'],
    ['Research Profile', 'Turn papers, UX research and Mentally Prepare into admissions proof.'],
    ['Career Path', 'Model behavioural science, UX research, product and consumer insights outcomes.'],
  ];

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: brand.primaryColor, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: '.75rem' }}>
            Student Digital Twin
          </div>
          <h1 style={{ marginTop: '.5rem', fontSize: '2.25rem' }}>{brand.appName}</h1>
          <p style={{ marginTop: '.5rem', color: '#94a3b8' }}>Signed in as {user?.email || 'preview user'}</p>
        </div>
        <a className="btn btn-outline" href="/pricing">Manage access</a>
      </header>

      <section style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {modules.map(([title, body]) => (
          <article className="card" key={title}>
            <h2 style={{ fontSize: '1.1rem' }}>{title}</h2>
            <p style={{ marginTop: '.75rem', color: '#94a3b8', lineHeight: 1.6 }}>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
