import { Redis } from "@upstash/redis";


let redis = null;


try {

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;


    if(url && token){

        redis = new Redis({
            url,
            token
        });

        console.log("[SUCCESS] Redis conectado");

    }else{

        console.log("[WARN] Variáveis Redis ausentes");

    }


}catch(e){

    console.log(
        "Redis config error:",
        e.message
    );

}



const memory = new Map();



export const kv = {


    async get(key){

        if(redis){

            return await redis.get(key);

        }

        return memory.get(key) || null;

    },


    async set(key,value){

        if(redis){

            return await redis.set(
                key,
                value
            );

        }

        memory.set(
            key,
            value
        );

        return "OK";

    },


    async del(key){

        if(redis){

            return await redis.del(key);

        }

        memory.delete(key);

        return 1;

    },


    async keys(pattern="*"){

        if(redis){

            return await redis.keys(pattern);

        }


        return [
            ...memory.keys()
        ];

    }

};