import {RunFunctionInput} from "../Queue.js";
import {get_element_by_query_selector} from "@game.object/ts-game-toolbox";
import {HTMLGameDataAction} from "./HTMLGameDataAction.js";
import {ActionHelper} from "../ActionHelper.js";
import {HTMLGameLogic} from "./HTMLGameLogic.js";

export class HTMLGameData extends HTMLElement {

    /**
     * the user interacted to trigger the specific action
     * @param action
     * @param notify_errors
     */
    public act(
        action:string,
        notify_errors: boolean = true
    ) {
        if (!window.world.components.queue.is_ready_to_push) {
            return;
        }
        this.queue(action, notify_errors);
    }

    /**
     * Enqueue the action to be performed at the end of the queue
     * @param action
     * @param notify_errors
     */
    public queue(
        action:string,
        notify_errors: boolean = true
    ) {
        const entry = this.make_queue_entry(action, notify_errors);
        window.world.components.queue.push(entry);
    }

    /**
     * Add this action to the queue
     * @param action
     * @param notify_errors
     */
    public make_queue_entry(
        action: string,
        notify_errors: boolean = true
    ) {
        return {
            run: (self: RunFunctionInput) => {
                let finished = false;
                this.play(action, notify_errors)
                    .then(() => {
                        if (finished) return;
                        finished = true;
                        self.finished();
                    })
                    .catch((reason) => {
                        if (finished) return;
                        finished = true;
                        self.failed(reason);
                    });
            }
        };
    }

    /**
     * Play the action logic now
     */
    public async play(
        action: string,
        notify_errors: boolean = true
    ) {
        try {
            const $action = get_element_by_query_selector(this, `game-data-action[type="${action}"]`, HTMLElement);
            if ($action instanceof HTMLGameDataAction) {
                await this.traverseScript($action.childNodes);
            }
        } catch (e) {
            if (notify_errors) {
                const entry = {
                    run: (self: RunFunctionInput) => {
                        ActionHelper.triggerFail(
                            () => {
                                self.finished();
                            },
                            () => {
                                self.about_to_finish?.();
                            }
                        );
                    }
                };
                window.world.components.queue.push(entry);
            }
        }
    }

    /**
     * Run the first successful script element in the action node
     * @param nodes
     */
    public async traverseScript(nodes: NodeList) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (!(node instanceof HTMLGameLogic)) {
                continue;
            }
            node.play();
        }
    }
}