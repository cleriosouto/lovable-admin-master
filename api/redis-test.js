import { kv } from "../services/redis.js";

export default async function handler(req,res){

    try{

        await kv.set(
            "teste:redis",
            {
                mensagem:"Redis funcionando",
                data:Date.now()
            }
        );


        const valor =
            await kv.get("teste:redis");


        const keys =
            await kv.keys("*");


        return res.json({

            sucesso:true,

            valor,

            totalKeys:keys.length,

            keys

        });


    }catch(e){

        return res.status(500).json({

            sucesso:false,

            erro:e.message

        });

    }

}