// import OpenAI from "openai";
// import { ChatCompletionMessageParam } from "openai/src/resources/chat/completions";
// import { APIPromise } from "openai/core";
// import { Agent } from "./Agent";
//
// export abstract class Assistant extends Agent {
//     public assistant_id: string;
//     public assistant: OpenAI.Beta.Assistant | null = null;
//     public thread: OpenAI.Beta.Threads.Thread | null = null;
//     public run: OpenAI.Beta.Threads.Run | null = null;
//
//     public constructor(
//         readonly openai: OpenAI,
//         assistant: string
//     ) {
//         super(openai);
//         this.assistant_id = assistant;
//     }
//
//     public async init() {
//         this.thread = await this.openai.beta.threads.create();
//         this.assistant = await this.openai.beta.assistants.retrieve(this.assistant_id);
//     }
//
//     public async pushMessage(
//         content: string,
//         role: string = "assistant"
//     ) {
//         if (!this.thread) {
//             throw new Error("Thread not initialized.");
//         }
//         if (role !== "assistant" && role !== "user") {
//             throw new Error("Role must be 'assistant' or 'user'.");
//         }
//         const message = await this.openai.beta.threads.messages.create(
//             this.thread.id,
//             {
//                 role,
//                 content
//             }
//         );
//     }
//
//     public async query(message?: string): Promise<void> {
//         if (!this.assistant || !this.thread) {
//             throw new Error("Assistant or thread not initialized.");
//         }
//         if (message) {
//             await this.pushMessage(message);
//         }
//         this.run = await this.openai.beta.threads.runs.createAndPoll(
//             this.thread.id,
//             {
//                 assistant_id: this.assistant.id,
//                 instructions: "Please address the user as Jane Doe. The user has a premium account."
//             }
//         );
//         await this.waitForRun(this.run);
//     }
//
//     public async waitForRun(run: OpenAI.Beta.Threads.Run) : Promise<void> {
//         return new Promise((resolve, reject)=>{
//             let busy = false;
//             const handle = window.setInterval(() => {
//                 switch (run.status) {
//                     case "cancelled":
//                     case "cancelling":
//                     case "expired":
//                         return reject(new Error("Run cancelled."));
//                     case "failed":
//                         return reject(new Error("Run failed."));
//                     case "in_progress":
//                     case "queued":
//                         return;
//                     case "requires_action":
//                         busy = true;
//                         return this.handleAction(run).then(() => busy = false).catch(reject);
//                     case "completed":
//                         return resolve();
//                     default:
//                         return reject(new Error("Unknown run status."));
//                 }
//             }, 1000);
//             return;
//         });
//     }
//
//     public async handleAction(run: OpenAI.Beta.Threads.Run) {
//
//     }
// }
