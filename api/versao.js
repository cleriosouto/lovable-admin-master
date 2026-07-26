import { kv } from "../services/redis.js";

export default async function handler(req,res){

    try{

        const keys = await kv.keys("*");

        const dados=[];

        for(const key of keys){

            dados.push({
                key,
                valor: await kv.get(key)
            });

        }


        return res.json({
            total:keys.length,
            dados
        });


    }catch(e){

        return res.status(500).json({
            erro:e.message
        });

    }

}