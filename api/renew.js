
let memoryStore = global.memoryStore || (global.memoryStore = new Map());
async function getStore(){
  try{
    const {kv}=await import('@vercel/kv');
    return {type:'kv', get: async k=>await kv.get(k), set: async (k,v)=>await kv.set(k,v)};
  }catch{
    return {type:'memory', get: async k=>memoryStore.get(k), set: async (k,v)=>memoryStore.set(k,v)};
  }
}
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  try{
    const {codigo, dias, days} = req.body||{};
    const addDays = parseInt(dias||days||0);
    if(!codigo) return res.status(400).json({error:'Codigo obrigatorio'});
    if(!addDays || addDays < 1) return res.status(400).json({error:'Dias invalidos'});
    const store = await getStore();
    const lic = await store.get(`license:${codigo}`);
    if(!lic) return res.status(404).json({error:'Licenca nao encontrada'});
    const oldExpiry = lic.expiracao;
    lic.expiracao = Math.max(lic.expiracao, Date.now()) + addDays*86400000;
    lic.expiry = lic.expiracao;
    lic.expiracaoDate = new Date(lic.expiracao).toLocaleDateString('pt-BR');
    lic.dias = (lic.dias||0) + addDays;
    lic.days = lic.dias;
    lic.renovacoes = (lic.renovacoes||0)+1;
    lic.ultimaRenovacao = Date.now();
    await store.set(`license:${codigo}`, lic);
    return res.status(200).json({success:true, license:lic, message:`+${addDays} dias adicionados`, oldExpiry, newExpiry:lic.expiracao});
  }catch(e){
    return res.status(500).json({error:e.message});
  }
}
