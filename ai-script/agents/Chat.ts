// import OpenAI from "openai";
// import { ChatCompletionMessageParam } from "openai/src/resources/chat/completions";
// import { APIPromise } from "openai/core";
// import { Agent } from "./Agent";
//
// export abstract class Chat extends Agent {
//     public messages: Array<ChatCompletionMessageParam> = [];
//     public assistant: string | null = null;
//     public model: string = "gpt-3.5-turbo";
//
//     public constructor(
//         readonly openai: OpenAI
//     ) {
//         super(openai);
//     }
//
//     public async init() {
//     }
//
//     public pushUserMessage(
//         content: string
//     ) {
//         this.messages.push({
//             role: "user",
//             content
//         });
//     }
//
//     public async query(message?: string): Promise<OpenAI.Chat.Completions.ChatCompletion> {
//         // if (message) {
//         //     this.pushUserMessage(message);
//         // }
//         // const body = {
//         //     messages: this.messages,
//         //     model: this.model
//         // };
//         // if (this.assistant) {
//         //     const assistant_body = Object.assign({
//         //         assistant: this.assistant
//         //     }, body);
//         //     return this.openai.beta.assistants.retrieve(this.assistant, assistant_body);
//         // }
//         // return this.openai.chat.completions.create(body);
//     }
// }
