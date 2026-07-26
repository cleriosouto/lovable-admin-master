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
            "[WARNING] Variáveis Redis ausentes"
        );


    }



}catch(e){


    console.log(
        "Redis config error:",
        e.message
    );


}




export const kv = {



    async get(key){


        if(!redis){

            return null;

        }



        try{


            const value =
                await redis.get(key);



            if(value === null){

                return null;

            }



            if(typeof value === "string"){


                try{

                    return JSON.parse(value);

                }catch{


                    return value;

                }


            }



            return value;



        }catch(e){


            console.log(
                "Redis GET error:",
                e.message
            );


            return null;


        }


    },






    async set(key,value){


        if(!redis){

            return null;

        }



        try{


            return await redis.set(

                key,

                value

            );



        }catch(e){


            console.log(

                "Redis SET error:",

                e.message

            );


            return null;


        }


    },






    async del(key){


        if(!redis){

            return null;

        }



        try{


            return await redis.del(key);



        }catch(e){


            console.log(

                "Redis DEL error:",

                e.message

            );


            return null;


        }


    },






    async keys(pattern="*"){


        if(!redis){

            return [];

        }



        try{


            return await redis.keys(
                pattern
            );



        }catch(e){


            console.log(

                "Redis KEYS error:",

                e.message

            );


            return [];


        }


    },






    async exists(key){


        if(!redis){

            return false;

        }



        try{


            const result =
                await redis.exists(key);



            return result === 1;



        }catch{


            return false;


        }


    }

};