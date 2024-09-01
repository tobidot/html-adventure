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
        this.$data = get_element_by_query_selector(this.$object, "game-data", HTMLGameData);
    }

    public act(action: CursorOptionState) {
        return this.$data.act(action);
    }
}