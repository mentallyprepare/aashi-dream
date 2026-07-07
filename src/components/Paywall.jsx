import React from 'react';
import {useNavigate} from 'react-router-dom';
export default function Paywall({user,subscription,partner,children}){
  const navigate=useNavigate();
  const hasAccess=subscription&&subscription.status==='active';
  const brand=partner||{appName:'Aashi Dreams',primaryColor:'#7c3aed'};
  if(hasAccess) return children;
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f0f1a'}}>
      <div className="card" style={{maxWidth:480,width:'100%',textAlign:'center',padding:'2.5rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔒</div>
        <h2 style={{fontSize:'1.4rem',fontWeight:700,marginBottom:'.75rem'}}>Unlock Your Admissions Intelligence</h2>
        <p style={{color:'#94a3b8',marginBottom:'2rem',lineHeight:1.6}}>
          You're one step away from your personalised university matches,
          Digital Twin confidence score, and 12-month roadmap.
        </p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>navigate('/pricing')} style={{padding:'.75rem 1.5rem',borderRadius:8,fontWeight:600,fontSize:'.95rem',background:brand.primaryColor,color:'white',cursor:'pointer'}}>
            See Plans — from ₹499
          </button>
          <button onClick={()=>navigate('/pricing')} style={{padding:'.75rem 1.5rem',borderRadius:8,fontWeight:600,background:'rgba(255,255,255,.08)',color:'#e8e8f0',cursor:'pointer'}}>
            Learn More
          </button>
        </div>
        <p style={{marginTop:'1.5rem',color:'#475569',fontSize:'.8rem'}}>
          Signed in as {user?.email} · <span style={{cursor:'pointer'}} onClick={()=>navigate('/login')}>Switch account</span>
        </p>
      </div>
    </div>
  );
}
