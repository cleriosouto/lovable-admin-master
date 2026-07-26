import { Redis } from "@upstash/redis";


let redis = null;


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
        "[ERROR] Redis ENV ausente"
    );

}





export const kv = {


    async get(key){


        if(!redis){

            throw new Error(
                "Redis não configurado"
            );

        }


        return await redis.get(key);


    },





    async set(key,value){


        if(!redis){

            throw new Error(
                "Redis não configurado"
            );

        }


        return await redis.set(

            key,

            value

        );


    },





    async del(key){


        if(!redis){

            throw new Error(
                "Redis não configurado"
            );

        }


        return await redis.del(key);


    },





    async keys(pattern){


        if(!redis){

            throw new Error(
                "Redis não configurado"
            );

        }


        return await redis.keys(pattern);


    }


};