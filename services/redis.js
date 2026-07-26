import { Redis } from "@upstash/redis";


let redis = null;


try {


    const url =
        process.env.KV_REST_API_URL;


    const token =
        process.env.KV_REST_API_TOKEN;



    if(url && token){


        redis = new Redis({

            url,

            token

        });


        console.log(
            "[SUCCESS] Redis conectado"
        );


    }else{


        console.log(
            "[WARNING] Redis ENV ausente"
        );


    }



}catch(e){


    console.log(
        "Redis erro:",
        e.message
    );


}





export const kv = {


    async get(key){


        if(redis){

            return await redis.get(key);

        }


        return null;


    },




    async set(key,value){


        if(redis){

            return await redis.set(
                key,
                value
            );

        }


        return null;


    },




    async del(key){


        if(redis){

            return await redis.del(key);

        }


        return null;


    },




    async keys(pattern="*"){


        if(redis){

            return await redis.keys(
                pattern
            );

        }


        return [];


    }



};