// MASTER API - Licenses List - Souto Digital

import { kv } from "../services/redis.js";


let memoryStore =
    global.memoryStore ||
    (global.memoryStore = new Map());



async function getStore(){

    try{

        return {

            type:"kv",

            getAll: async ()=>{


                const keys =
                    await kv.keys(
                        "license:*"
                    );


                const vals = [];


                for(const k of keys){


                    if(
                        k.includes("meta") ||
                        k.includes("test")
                    )
                        continue;



                    const v =
                        await kv.get(k);



                    if(v && v.codigo)

                        vals.push(v);

                }



                return vals.sort(
                    (a,b)=>
                        (
                            b.data ||
                            b.createdAt ||
                            0
                        )
                        -
                        (
                            a.data ||
                            a.createdAt ||
                            0
                        )
                );


            }

        };


    }catch(e){


        console.log(
            "KV indisponível:",
            e.message
        );


        return {

            type:"memory",


            getAll:()=>


                Array.from(
                    memoryStore.values()
                )
                .filter(
                    v=>v && v.codigo
                )
                .sort(
                    (a,b)=>
                    (b.data||0)
                    -
                    (a.data||0)
                )

        };

    }

}



export default async function handler(req,res){


    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );


    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );



    if(req.method==="OPTIONS")

        return res.status(200).end();



    try{


        const store =
            await getStore();



        const licenses =
            await store.getAll();



        const now =
            Date.now();



        const stats = {


            total:
                licenses.length,



            active:
                licenses.filter(
                    l =>
                    l.status !== "blocked" &&
                    now <
                    (
                        l.expiracao ||
                        l.expiry ||
                        0
                    )
                )
                .length,



            expired:
                licenses.filter(
                    l =>
                    now >
                    (
                        l.expiracao ||
                        l.expiry ||
                        0
                    )
                )
                .length,



            blocked:
                licenses.filter(
                    l =>
                    l.status==="blocked"
                )
                .length,



            revenue:
                licenses.reduce(
                    (s,l)=>
                    s +
                    (
                        l.preco ||
                        l.price ||
                        0
                    ),
                    0
                ),



            today:
                licenses.filter(
                    l =>
                    new Date(
                        l.data ||
                        l.createdAt ||
                        0
                    )
                    .toDateString()
                    ===
                    new Date()
                    .toDateString()
                )
                .length

        };



        return res.status(200).json({

            licenses,

            total:
                licenses.length,

            stats,

            storage:
                store.type,

            success:true

        });



    }catch(e){


        return res.status(500).json({

            error:e.message,

            licenses:[],

            total:0,

            success:false

        });

    }

}