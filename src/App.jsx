import React,{useEffect} from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {getPartnerConfig} from './lib/partners';
import Dashboard from './pages/Dashboard';

const personalUser={
  displayName:'Anushka Navin Kumar',
  email:'personal@aashidreams.local',
};

const personalSubscription={
  status:'active',
  plan:'private_workspace',
};

export default function App(){
  const partner=getPartnerConfig();

  useEffect(()=>{
    if(partner){
      document.documentElement.style.setProperty('--brand-primary',partner.primaryColor);
      document.documentElement.style.setProperty('--brand-secondary',partner.secondaryColor);
      document.title=partner.appName;
    }
  },[partner]);

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace/>}/>
        <Route path="/pricing" element={<Navigate to="/" replace/>}/>
        <Route
          path="/*"
          element={
            <Dashboard
              user={personalUser}
              subscription={personalSubscription}
              partner={partner}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
