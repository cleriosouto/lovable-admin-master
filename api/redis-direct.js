import { Redis } from "@upstash/redis";


export default async function handler(req,res){


    try{


        const redis = new Redis({

            url: process.env.KV_REST_API_URL,

            token: process.env.KV_REST_API_TOKEN

        });



        const resultado =
            await redis.set(
                "direct:test",
                "FUNCIONOU"
            );



        const valor =
            await redis.get(
                "direct:test"
            );



        const keys =
            await redis.keys("*");



        return res.json({

            resultado,

            valor,

            keys

        });



    }catch(e){


        return res.status(500).json({

            erro:e.message

        });


    }


}