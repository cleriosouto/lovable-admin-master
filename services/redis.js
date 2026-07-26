import { Redis } from "@upstash/redis";


let redis;


try {

    redis = new Redis({

        url:
            process.env.KV_REST_API_URL,

        token:
            process.env.KV_REST_API_TOKEN

    });


} catch (e) {

    console.log(
        "Redis config error:",
        e.message
    );

}


export const kv = redis;