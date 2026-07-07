import React,{useEffect,useState} from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from './lib/firebase';
import {getPartnerConfig} from './lib/partners';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Paywall from './components/Paywall';

export default function App(){
  const [user,setUser]=useState(undefined);
  const [subscription,setSubscription]=useState(null);
  const partner=getPartnerConfig();

  useEffect(()=>{
    if(partner){
      document.documentElement.style.setProperty('--brand-primary',partner.primaryColor);
      document.documentElement.style.setProperty('--brand-secondary',partner.secondaryColor);
      document.title=partner.appName;
    }
  },[partner]);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async firebaseUser=>{
      setUser(firebaseUser);
      if(firebaseUser){
        try{
          const token=await firebaseUser.getIdToken();
          await fetch('/api/auth/sync',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}});
          const r=await fetch('/api/payments/status',{headers:{Authorization:`Bearer ${token}`}});
          const d=await r.json();
          setSubscription(d.subscription);
        }catch(e){console.error('Sync error:',e);}
      }
    });
    return()=>unsub();
  },[]);

  if(user===undefined) return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
      <div style={{color:'#7c3aed',fontSize:'1.5rem'}}>✨ Loading Aashi Dreams...</div>
    </div>
  );

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user?<Login partner={partner}/>:<Navigate to="/"/>}/>
        <Route path="/pricing" element={<Pricing user={user} subscription={subscription} partner={partner}/>}/>
        <Route path="/*" element={!user?<Navigate to="/login"/>:
          <Paywall user={user} subscription={subscription} partner={partner}>
            <Dashboard user={user} subscription={subscription} partner={partner}/>
          </Paywall>}/>
      </Routes>
    </BrowserRouter>
  );
}
