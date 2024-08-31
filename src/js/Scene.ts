import {HTMLGameLocation} from "./custom-elements/HTMLGameLocation";
import {HTMLGameLogic} from "./custom-elements/HTMLGameLogic.js";
import {get_element_by_query_selector} from "@game.object/ts-game-toolbox";
import {HTMLGameData} from "./custom-elements/HTMLGameData.js";
import {CursorOptionState} from "./Cursor.js";
import {HTMLGameDataAction} from "./custom-elements/HTMLGameDataAction.js";
import {RunFunctionInput} from "./Queue.js";
import {ActionHelper} from "./ActionHelper.js";

export class Scene {
    public id: string;
    public $root: HTMLGameLocation;
    public $data: HTMLGameData | null;
    public allowed_tacks: Array<string> = [];

    constructor(settings: {
        $root: HTMLGameLocation;
    }) {
        this.$root = settings.$root;
        this.id = this.$root.id;
        this.allowed_tacks = this.$root.allowed_tracks;
        try {
            this.$data = get_element_by_query_selector(this.$root, "game-data", HTMLGameData);
        } catch (e) {
            this.$data = null;
        }
    }

    public get_allowed_tracks(): Array<string> {
        return this.allowed_tacks;
    }

    public enter() {
        this.$data?.queue("enter", false);
    }

}