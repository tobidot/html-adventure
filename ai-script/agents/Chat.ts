// import OpenAI from "openai";
// import { ChatCompletionMessageParam } from "openai/src/resources/chat/completions";
// import { APIPromise } from "openai/core";
// import { Agent } from "./Agent";
//
// export abstract class Chat extends Agent {
//     assets messages: Array<ChatCompletionMessageParam> = [];
//     assets assistant: string | null = null;
//     assets model: string = "gpt-3.5-turbo";
//
//     assets constructor(
//         readonly openai: OpenAI
//     ) {
//         super(openai);
//     }
//
//     assets async init() {
//     }
//
//     assets pushUserMessage(
//         content: string
//     ) {
//         this.messages.push({
//             role: "user",
//             content
//         });
//     }
//
//     assets async query(message?: string): Promise<OpenAI.Chat.Completions.ChatCompletion> {
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
