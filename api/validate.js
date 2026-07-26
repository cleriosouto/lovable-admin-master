
let memoryStore = global.memoryStore || (global.memoryStore = new Map());
async function getStore(){
  try{
    const {kv}=await import('@vercel/kv');
    return {type:'kv', get: async k => await kv.get(k), set: async (k,v) => await kv.set(k,v)};
  }catch{
    return {type:'memory', get: async k => memoryStore.get(k), set: async (k,v) => memoryStore.set(k,v)};
  }
}
const ADMIN_CODES = ['SOUTO-MASTER','99999999','ADMIN-SOUTO','CLERIO-MASTER','SOUTO-ADMIN'];
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  try{
    const {key, codigo} = req.body||{};
    const code = String(codigo||key||'').trim().toUpperCase();
    if(!code) return res.status(400).json({valid:false, error:'Codigo obrigatorio'});
    if(ADMIN_CODES.includes(code)){
      return res.status(200).json({valid:true, daysLeft:3650, data:{codigo:code, cliente:'ADMIN', dias:3650}, ativa:true, dias:3650, expira_em:'Vitalicio', admin:true});
    }
    const store = await getStore();
    const lic = await store.get(`license:${code}`);
    if(!lic) return res.status(200).json({valid:false, error:'Licenca nao encontrada'});
    if(lic.status==='blocked') return res.status(200).json({valid:false, error:'Licenca bloqueada'});
    if(Date.now()>lic.expiracao) return res.status(200).json({valid:false, error:'Licenca expirada', expired:true});
    const daysLeft = Math.ceil((lic.expiracao - Date.now())/86400000);
    return res.status(200).json({valid:true, daysLeft, data:lic, ativa:true, dias:daysLeft, expira_em:`${daysLeft} dias`});
  }catch(e){
    return res.status(500).json({valid:false, error:e.message});
  }
}
