// MASTER API - Generate License - Souto Digital
// Redis Direct Version

import { kv } from "../services/redis.js";


function gen8(){

    return Math.floor(
        10000000 +
        Math.random() * 90000000
    ).toString();

}



const PLANS = {

    7:500,
    15:900,
    30:1500,
    60:2000

};



async function getStore(){

    return {

        type:"redis",


        get: async (key)=>{

            return await kv.get(key);

        },


        set: async (key,value)=>{

            return await kv.set(
                key,
                value
            );

        },


        del: async (key)=>{

            return await kv.del(key);

        },


        keys: async (pattern)=>{

            return await kv.keys(pattern);

        },


        getAll: async ()=>{


            const keys =
                await kv.keys(
                    "license:*"
                );


            const vals=[];


            for(const key of keys){


                if(
                    key.includes("meta")
                )
                    continue;



                const value =
                    await kv.get(key);



                if(
                    value &&
                    value.codigo
                ){

                    vals.push(value);

                }

            }


            return vals;


        }

    };

}





export default async function handler(req,res){


    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );


    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );


    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );



    if(req.method==="OPTIONS"){

        return res.status(200).end();

    }



    if(req.method!=="POST"){

        return res.status(405).json({

            success:false,

            error:"Method not allowed"

        });

    }



    try{


        const {

            client,

            phone,

            email,

            plan,

            customKey,

            price,

            cliente,

            telefone


        } = req.body || {};





        const clientName =
            client ||
            cliente;



        const clientPhone =
            phone ||
            telefone;





        if(!clientName){


            return res.status(400).json({

                success:false,

                error:"Cliente obrigatorio"

            });

        }





        if(!clientPhone){


            return res.status(400).json({

                success:false,

                error:"Telefone obrigatorio"

            });

        }





        const store =
            await getStore();





        let days = 30;





        if(plan){


            const match =
                String(plan)
                .match(/\d+/);



            if(match){

                days =
                    parseInt(match[0]);

            }

        }





        if(days < 1){

            days = 1;

        }





        if(days > 3650){

            days = 3650;

        }







        const code =

            customKey &&
            /^\d{8}$/.test(
                String(customKey)
            )

            ?

            String(customKey)

            :

            gen8();







        const existing =

            await store.get(
                `license:${code}`
            );







        if(existing){


            return res.status(409).json({

                success:false,

                error:"Codigo ja existe",

                code

            });

        }








        const now =
            Date.now();




        const expiry =

            now +
            days *
            86400000;







        const license = {


            codigo:code,


            code,



            cliente:clientName,


            client:clientName,



            telefone:clientPhone,


            phone:clientPhone,



            email:
                email || "",



            dias:days,


            days,



            preco:

                price ||

                PLANS[days] ||

                days * 100,



            price:

                price ||

                PLANS[days] ||

                days * 100,



            data:now,


            createdAt:now,



            expiracao:expiry,


            expiry,



            expiracaoDate:

                new Date(expiry)
                .toLocaleDateString(
                    "pt-BR"
                ),



            status:"active",



            ativa:true,



            plano:`${days}D`,



            plan:`${days}D`,



            observacoes:"",



            hwid:null,



            ativacoes:0,



            version:"3.1"


        };







        await store.set(

            `license:${code}`,

            license

        );


const testeRedis =
    await kv.get(
        `license:${code}`
    );


console.log(
    "LICENCA GRAVADA:",
    testeRedis
);




        await store.set(

            "license:meta:last",

            {

                lastCode:code,

                lastClient:clientName,

                time:now

            }

        );







        return res.status(200).json({


            success:true,


            license,


            code,



            message:

                "Licenca gerada com sucesso"


        });






    }catch(error){



        console.error(

            "GENERATE ERROR:",

            error

        );



        return res.status(500).json({


            success:false,


            error:error.message


        });


    }


}