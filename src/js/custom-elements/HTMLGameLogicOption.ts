import { HTMLGameDataLike } from "./HTMLGameDataLike";
import { HTMLGameLogic } from "./HTMLGameLogic";
import { RunFunctionInput } from "../Queue";
import { ActionHelper } from "../ActionHelper";

export class HTMLGameLogicOption extends HTMLGameLogic {

    public get text(): string {
        return this.getAttribute("text") || "";
    }

    public get index(): number {
        return parseInt(this.getAttribute("index") || "0");
    }

    public async play() {
        return this.playOption(this);
    }

    /**
     * Adds an option to the text options
     * @param node
     * @protected
     */
    protected async playOption(node: HTMLGameLogicOption) : Promise<boolean> {
        const text = (node.text ?? "").trim();
        const index = node.index;
        window.world.components.text.option(text, () => {
            const after_output_entry = {
                run: (self: RunFunctionInput) => {
                    this.playAll(node);
                    self.finished();
                }
            };
            let finished = false;
            const entry = {
                run: (self: RunFunctionInput) => {
                    const stop = ActionHelper.outputTextAndAudio(
                        text,
                        () => {
                            if (finished) return;
                            finished = true;
                            self.finished();
                        }, () => {
                            if (finished) return;
                            self.about_to_finish?.();
                        }
                    );
                    self.provide_shortcut(() => {
                        if (finished) return;
                        finished = true;
                        self.finished();
                        stop();
                    });
                    // after that play the child nodes
                    window.world.components.text.remove_option(text);
                    window.world.components.queue.push(after_output_entry);
                }
            };
            window.world.components.queue.push(entry);
        }, index);
        return false;
    }
}