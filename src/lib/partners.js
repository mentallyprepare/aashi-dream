export const PARTNERS={
  default:   {id:'default',   appName:'Aashi Dreams',        logoText:'🎓 Aashi Dreams',        tagline:'AI-Powered College Admissions Intelligence',primaryColor:'#7c3aed',secondaryColor:'#06b6d4',accentColor:'#f59e0b',supportEmail:'hello@aashidreams.com'},
  karnal:    {id:'karnal',    appName:'Karnal Edu Hub',       logoText:'📚 Karnal Edu Hub',       tagline:'Powered by Aashi Dreams',primaryColor:'#1d4ed8',secondaryColor:'#0891b2',accentColor:'#f59e0b',supportEmail:'info@karnaledu.com',parentInstitute:'Karnal Education Hub'},
  delhi:     {id:'delhi',     appName:'Delhi Career Academy', logoText:'🏛️ Delhi Career Academy', tagline:'Powered by Aashi Dreams',primaryColor:'#dc2626',secondaryColor:'#2563eb',accentColor:'#d97706',supportEmail:'info@delhicareer.com',parentInstitute:'Delhi Career Academy'},
  chandigarh:{id:'chandigarh',appName:'CHD Study Abroad',     logoText:'✈️ CHD Study Abroad',     tagline:'Powered by Aashi Dreams',primaryColor:'#0f766e',secondaryColor:'#7c3aed',accentColor:'#ea580c',supportEmail:'hello@chdstudy.com',parentInstitute:'Chandigarh Study Abroad Centre'},
};
export function getPartnerConfig(){
  if(typeof window==='undefined') return PARTNERS.default;
  const id=new URLSearchParams(window.location.search).get('partner')?.toLowerCase();
  return PARTNERS[id]||PARTNERS.default;
}
export default PARTNERS;
