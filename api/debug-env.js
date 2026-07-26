import { kv } from "../services/redis.js";


export default async function handler(req,res){

    try{


        await kv.set(
            "debug:redis",
            {
                mensagem:"Teste Redis",
                data:Date.now()
            }
        );


        const valor =
            await kv.get(
                "debug:redis"
            );


        const keys =
            await kv.keys("*");



        return res.status(200).json({

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