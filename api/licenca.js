
let memoryStore = global.memoryStore || (global.memoryStore = new Map());
async function getStore(){
  try{
    const {kv}=await import('@vercel/kv');
    return {
      type:'kv',
      get: async k => await kv.get(k),
      set: async (k,v) => await kv.set(k,v)
    };
  }catch{
    return {
      type:'memory',
      get: async k => memoryStore.get(k),
      set: async (k,v) => memoryStore.set(k,v)
    };
  }
}

const ADMIN_CODES = ['SOUTO-MASTER','99999999','ADMIN-SOUTO','CLERIO-MASTER','SOUTO-ADMIN'];

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Device-Hash, X-Extension-Id');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({ativa:false, motivo:'Metodo nao permitido'});

  try{
    const {codigo, hwid, extension_id} = req.body||{};
    const code = String(codigo||'').trim().toUpperCase();

    if(!code) return res.status(400).json({ativa:false, motivo:'Codigo obrigatorio'});

    // Admin master codes - sempre ativos
    if(ADMIN_CODES.includes(code)){
      return res.status(200).json({
        ativa:true,
        expira_em:'Vitalicio',
        dias:3650,
        codigo:code,
        cliente:'ADMIN - Clerio Santos',
        plano:'Admin Vitalicio',
        admin:true,
        vitalicio:true
      });
    }

    const store = await getStore();
    const lic = await store.get(`license:${code}`);

    if(!lic){
      // Fallback para licencas locais de teste (8 digitos)
      if(/^\d{8}$/.test(code)){
        return res.status(200).json({
          ativa:true,
          expira_em:'30 dias (modo offline)',
          dias:30,
          codigo:code,
          cliente:'Cliente Teste Offline',
          plano:'30 dias',
          offline:true
        });
      }
      return res.status(200).json({ativa:false, motivo:'Licenca nao encontrada. Verifique o codigo.'});
    }

    if(lic.status==='blocked'){
      return res.status(200).json({ativa:false, motivo:'Licenca bloqueada. Contacte o admin.', bloqueada:true});
    }

    if(Date.now() > lic.expiracao){
      return res.status(200).json({ativa:false, motivo:'Licenca expirada. Renove para continuar.', expirada:true, expira_em:'0 dias'});
    }

    const diasRest = Math.ceil((lic.expiracao - Date.now())/86400000);

    // Anti-pirataria
    if(!lic.hwid && hwid){
      lic.hwid = hwid;
      lic.extension_id = extension_id;
      lic.primeiraAtivacao = Date.now();
      await store.set(`license:${code}`, lic);
    } else if(lic.hwid && hwid && lic.hwid !== hwid){
      const hwids = lic.hwids || [lic.hwid];
      if(!hwids.includes(hwid)){
        if(hwids.length >= 5){
          return res.status(200).json({ativa:false, motivo:'Limite de dispositivos (5) atingido. Contacte admin.', pirataria:true});
        }
        hwids.push(hwid);
        lic.hwids = hwids;
        await store.set(`license:${code}`, lic);
      }
    }

    lic.ativacoes = (lic.ativacoes||0)+1;
    lic.ultimaValidacao = Date.now();
    await store.set(`license:${code}`, lic);

    return res.status(200).json({
      ativa:true,
      expira_em:`${diasRest} dias`,
      dias:diasRest,
      codigo:lic.codigo,
      cliente:lic.cliente,
      plano:`${lic.dias} dias`,
      telefone:lic.telefone
    });

  }catch(e){
    console.error('Licenca error', e);
    return res.status(500).json({ativa:false, motivo:'Erro servidor: '+e.message});
  }
}
