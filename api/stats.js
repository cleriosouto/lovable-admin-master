import { kv } from "../services/redis.js";

let memoryStore = global.memoryStore || (global.memoryStore = new Map());

async function getStore() {
    try {
        return {
            type: "kv",

            getAll: async () => {

                const keys = await kv.keys("license:*");

                const vals = [];

                for (const k of keys) {

                    if (k.includes("meta")) continue;

                    const v = await kv.get(k);

                    if (v && v.codigo) {
                        vals.push(v);
                    }
                }

                return vals;
            }
        };

    } catch (error) {

        console.log(
            "KV indisponível, usando memória:",
            error.message
        );

        return {
            type: "memory",

            getAll: async () =>
                Array.from(memoryStore.values())
                    .filter(v => v && v.codigo)
        };
    }
}


export default async function handler(req, res) {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }


    try {

        const store = await getStore();

        const licenses = await store.getAll();


        const last30 = Array.from(
            { length: 30 },
            (_, i) => {

                const d = new Date();

                d.setDate(
                    d.getDate() - i
                );


                const dateStr =
                    d.toISOString()
                    .split("T")[0];


                const dayLicenses =
                    licenses.filter(l => {

                        const cd =
                            new Date(
                                l.data ||
                                l.createdAt ||
                                0
                            )
                            .toISOString()
                            .split("T")[0];

                        return cd === dateStr;

                    });


                return {

                    date: dateStr,

                    count:
                        dayLicenses.length,

                    revenue:
                        dayLicenses.reduce(
                            (s, l) =>
                                s +
                                (
                                    l.preco ||
                                    l.price ||
                                    0
                                ),
                            0
                        )
                };

            }
        ).reverse();



        const byPlan = {};


        licenses.forEach(l => {

            const k =
                `${l.dias || l.days} dias`;


            if (!byPlan[k]) {

                byPlan[k] = {
                    count: 0,
                    revenue: 0
                };

            }


            byPlan[k].count++;

            byPlan[k].revenue +=
                (
                    l.preco ||
                    l.price ||
                    0
                );

        });



        return res.status(200).json({

            last30,

            byPlan,

            licenses,

            storage: store.type,

            success: true

        });


    } catch (e) {

        return res.status(500).json({

            error: e.message

        });

    }
}