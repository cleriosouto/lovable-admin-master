
// MASTER API - Generate License - Souto Digital
let memoryStore = global.memoryStore || (global.memoryStore = new Map());
async function getStore(){
  try{
    const {kv}=await import('@vercel/kv');
    const test = await kv.get('test');
    return {
      type:'kv',
      get: async k => await kv.get(k),
      set: async (k,v) => await kv.set(k,v),
      del: async k => await kv.del(k),
      keys: async p => await kv.keys(p),
      getAll: async () => {
        const keys = await kv.keys('license:*');
        const vals = [];
        for(const k of keys){
          if(k.includes('meta')) continue;
          const v = await kv.get(k);
          if(v && v.codigo) vals.push(v);
        }
        return vals;
      }
    };
  }catch(e){
    console.log('KV not available, using memory', e.message);
    return {
      type:'memory',
      get: async k => memoryStore.get(k),
      set: async (k,v) => memoryStore.set(k,v),
      del: async k => memoryStore.delete(k),
      keys: async p => Array.from(memoryStore.keys()).filter(k=>k.startsWith(p.replace('*',''))),
      getAll: async () => Array.from(memoryStore.values()).filter(v=>v&&v.codigo)
    };
  }
}

function gen8(){return Math.floor(10000000+Math.random()*90000000).toString();}
const PLANS = {7:500,15:900,30:1500,60:2000};

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Device-Hash, X-Extension-Id');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed', method:req.method});

  try{
    const {client, phone, email, plan, customKey, price, cliente, telefone} = req.body||{};
    const clientName = client || cliente;
    const clientPhone = phone || telefone;
    
    if(!clientName) return res.status(400).json({error:'Cliente obrigatorio', success:false});
    if(!clientPhone) return res.status(400).json({error:'Telefone obrigatorio', success:false});

    const store = await getStore();
    let days = 30;
    if(plan){
      const m = String(plan).match(/\d+/);
      if(m) days = parseInt(m[0]);
      else if(!isNaN(parseInt(plan))) days = parseInt(plan);
    }
    if(days < 1) days = 1;
    if(days > 3650) days = 3650;

    const code = customKey && /^\d{8}$/.test(String(customKey)) ? String(customKey) : gen8();
    const existing = await store.get(`license:${code}`);
    if(existing) return res.status(409).json({error:'Codigo ja existe', code, success:false});

    const now = Date.now();
    const license = {
      codigo: code,
      code,
      cliente: clientName,
      client: clientName,
      telefone: clientPhone,
      phone: clientPhone,
      email: email || '',
      dias: days,
      days,
      preco: price || PLANS[days] || days*100,
      price: price || PLANS[days] || days*100,
      data: now,
      createdAt: now,
      expiracao: now + days*86400000,
      expiry: now + days*86400000,
      expiracaoDate: new Date(now+days*86400000).toLocaleDateString('pt-BR'),
      status: 'active',
      ativa: true,
      plano: `${days}D`,
      plan: `${days}D`,
      observacoes: '',
      hwid: null,
      ativacoes: 0,
      version: '3.1'
    };

    await store.set(`license:${code}`, license);
    await store.set(`license:meta:last`, {lastCode:code, lastClient:clientName, time:now});

    return res.status(200).json({success:true, license, code, message:'Licenca gerada com sucesso'});
  }catch(e){
    console.error('Generate error', e);
    return res.status(500).json({error:e.message, success:false});
  }
}
