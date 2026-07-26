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
            "[ERROR] Variáveis Redis ausentes"
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


        if(!redis)
            return null;



        const value =
            await redis.get(key);



        if(value === null)
            return null;



        if(typeof value === "string"){


            try{

                return JSON.parse(value);

            }catch{

                return value;

            }

        }



        return value;


    },





    async set(key,value){


        if(!redis)
            return null;



        return await redis.set(

            key,

            JSON.stringify(value)

        );


    },





    async del(key){


        if(!redis)
            return null;



        return await redis.del(key);


    },





    async keys(pattern="*"){


        if(!redis)
            return [];



        return await redis.keys(pattern);


    }

};