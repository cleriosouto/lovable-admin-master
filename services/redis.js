import { Redis } from "@upstash/redis";


let redis = null;


try {


    const url =
        process.env.KV_REST_API_URL ||
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.STORAGES_KV_REST_API_URL;


    const token =
        process.env.KV_REST_API_TOKEN ||
        process.env.UPSTASH_REDIS_REST_TOKEN ||
        process.env.STORAGES_KV_REST_API_TOKEN;



    console.log(
        "[REDIS CHECK]",
        {
            urlExiste: !!url,
            tokenExiste: !!token
        }
    );



    if(url && token){


        redis = new Redis({

            url,

            token

        });


        console.log(
            "[SUCCESS] Upstash Redis inicializado"
        );


    }else{


        console.log(
            "[ERROR] Variáveis Redis não encontradas"
        );


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


        return Array.from(
            memory.keys()
        );


    }


};