import React from 'react';

export default function Pricing({ partner }) {
  const brand = partner || { appName: 'Aashi Dreams', primaryColor: '#7c3aed' };
  const plans = [
    ['Student Preview', '499', 'Personal dashboard, university roadmap and form checklist preview.'],
    ['Counsellor Pro', '15000', 'White-label institute dashboard, parent reports and student tracking.'],
    ['Partner Studio', '30000', 'Custom branding, cohort dashboard and premium advisory workflows.'],
  ];

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <a className="btn btn-outline" href="/">Back</a>
      <section style={{ marginTop: '2rem' }}>
        <div style={{ color: brand.primaryColor, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: '.75rem' }}>
          Access plans
        </div>
        <h1 style={{ marginTop: '.75rem', fontSize: '2.25rem' }}>Unlock {brand.appName}</h1>
        <p style={{ marginTop: '1rem', color: '#94a3b8', maxWidth: 720, lineHeight: 1.7 }}>
          Choose a plan for admissions intelligence, scholarship tracking, roadmap reports and partner-branded student dashboards.
        </p>
      </section>

      <section style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {plans.map(([name, price, body]) => (
          <article className="card" key={name}>
            <h2>{name}</h2>
            <div style={{ marginTop: '1rem', fontSize: '2rem', fontWeight: 800 }}>Rs {price}</div>
            <p style={{ marginTop: '.75rem', color: '#94a3b8', lineHeight: 1.6 }}>{body}</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Request access</button>
          </article>
        ))}
      </section>
    </main>
  );
}
