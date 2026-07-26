
# LovABLE MASTER Admin v3.1 - Souto Digital Servicos
# https://soutolovable.vercel.app

## MASTER Features
- Visual Premium com Tailwind + Glassmorphism
- Dashboard Interativo com Chart.js (receita 14 dias, planos pizza)
- Campo 5000 caracteres igual Lovable chat
- Acesso Admin Vitalicio: SOUTO-MASTER / 99999999
- API completa: generate, licenca, validate, licenses, stats, renew, versao
- KV + Memory fallback
- Mobile responsive com menu hamburger
- Export CSV/JSON, Fatura, Recibo, WhatsApp

## Deploy
1. Vercel -> New Project -> Upload este ZIP
2. Storage -> Create KV -> Connect -> Redeploy
3. Acesse https://soutolovable.vercel.app
4. Login: admin / admin123
5. Gere sua licenca admin: 99999999

## Extensao
Use a extensao v3.1 com campo 5000 chars apontada para https://soutolovable.vercel.app

## API Endpoints
POST /api/generate {client, phone, plan, price}
POST /api/licenca {codigo, hwid}
POST /api/validate {codigo}
GET /api/licenses
GET /api/stats
POST /api/renew {codigo, dias}
GET /api/versao

## Suporte
M-Pesa: 842213421 - Clerio Santos
E-mola: 870123487
