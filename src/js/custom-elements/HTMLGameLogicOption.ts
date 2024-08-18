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

    public play() {
        return this.playOption(this);
    }

    /**
     * Adds an option to the text options
     * @param node
     * @protected
     */
    protected playOption(node: HTMLGameLogicOption) {
        const text = (node.text ?? "").trim();
        const index = node.index;
        window.text.option(text, () => {
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
                    window.text.remove_option(text);
                    window.queue.push(after_output_entry);
                }
            };
            window.queue.push(entry);
        }, index);
        return false;
    }
}