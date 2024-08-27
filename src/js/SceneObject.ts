import { get_element_by_query_selector } from "@game.object/ts-game-toolbox";
import { CursorOptionState } from "./Cursor";
import { get_element_by_id } from "@game.object/ts-game-toolbox/dist";
import { HTMLGameDataProperty } from "./custom-elements/HTMLGameDataProperty";
import { HTMLGameLogicOption } from "./custom-elements/HTMLGameLogicOption";
import { HTMLGameLogic } from "./custom-elements/HTMLGameLogic";
import { RunFunctionInput } from "./Queue";
import { HTMLGameDataAction } from "./custom-elements/HTMLGameDataAction";
import { HTMLGameInteractable } from "./custom-elements/HTMLGameInteractable";
import { HTMLGameData } from "./custom-elements/HTMLGameData";
import { ActionHelper } from "./ActionHelper";

declare global {
    interface Window {
        game_state: {
            [key: string]: number | string | boolean | null;
        };
    }
}
window.game_state = {};

export class SceneObject {
    protected $object: HTMLGameInteractable;
    protected $data: HTMLGameData;

    constructor(
        public settings: {
            $object: HTMLGameInteractable,
        }
    ) {
        this.$object = settings.$object;
        this.$object.$scene_object = this;
        this.$data = get_element_by_query_selector(this.$object, "game-data", HTMLElement);
    }

    public act(action: CursorOptionState) {
        const play = async () => {
            try {
                const $action = get_element_by_query_selector(this.$object, `game-data-action[type="${action}"]`, HTMLElement);
                if ($action instanceof HTMLGameDataAction) {
                    await this.traverseScript($action.childNodes);
                }
            } catch (e) {
                console.error(e);
                const entry = {
                    run: (self: RunFunctionInput) => {
                        ActionHelper.triggerFail(
                            ()=>{self.finished();},
                            ()=>{self.about_to_finish?.();}
                        );
                    }
                };
                window.world.components.queue.push(entry);
            }
        };
        const entry = {
            run: (self: RunFunctionInput) => {
                let finished = false;
                play()
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
        console.log("act", action, entry);
        if (window.world.components.queue.is_ready_to_push) {
            window.world.components.queue.push(entry);
            console.log("queued");
        } else {
            console.log("ignored");
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