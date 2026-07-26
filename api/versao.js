
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','no-cache');
  return res.status(200).json({
    versao:'3.1.0',
    versaoNome:'MASTER',
    mensagem:'Painel MASTER com dashboard interativo e campo 5000 chars',
    url:'https://soutolovable.vercel.app',
    download:'https://soutolovable.vercel.app',
    obrigatoria:false,
    data: new Date().toISOString(),
    admin:'Clerio Santos - Souto Digital Servicos'
  });
}
