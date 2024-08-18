// import OpenAI from "openai";
// import { MasterAgent } from "./agents/MasterAgent";
//
// const openai = new OpenAI();
//
// async function main() {
//
//     const master = new MasterAgent(openai);
//
//     const rounds = 1000;
//
//     for (let i = 0; i < rounds; i++) {
//         const completion = await master.query("Hello, how are you?");
//         console.log(completion.choices[0]);
//     }
//
// }
//
// main()
//     .catch((error)=>{
//     console.log(error);
// });