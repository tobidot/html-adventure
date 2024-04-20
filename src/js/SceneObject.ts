import { get_element_by_query_selector } from "@game.object/ts-game-toolbox";
import { CursorOptionState } from "./Cursor";
import { get_element_by_id } from "@game.object/ts-game-toolbox/dist";

declare global {
    interface Window {
        animation_until: number | null;
        $current_audio: HTMLAudioElement | null;
        after_audio_played: null | (() => void);
        audio_ended_handler: null | (() => void);
        game_state: {
            [key: string]: number | string | boolean | null;
        };
        // text_options: Array<HTMLElement>;
    }
}
window.animation_until = null;
window.$current_audio = null;
window.after_audio_played = null;
window.audio_ended_handler = null;
window.game_state = {};

// window.text_options = [];

export class SceneObject {
    protected $object: HTMLElement;
    protected $data: HTMLElement;


    constructor(
        public settings: {
            $object: HTMLElement,
        }
    ) {
        this.$object = settings.$object;
        this.$data = get_element_by_query_selector(this.$object, ".data", HTMLElement);
    }

    public act(action: CursorOptionState) {
        console.log(action, this.$object);
        const play = () => {
            try {
                const $action = get_element_by_query_selector(this.$object, `[data-action=${action}]`, HTMLElement);
                if ($action) {
                    this.traverseScript($action.childNodes);
                }
            } catch (e) {
                console.error(e);
                this.doOutput(SceneObject.getCommonOutput("$FAIL"));
            }
        };
        this.queue(play, 1250);
    }

    /**
     * Queues an action to run next or now.
     * Can aly
     * @param callback
     * @param timeout
     */
    public queue (callback:()=>void, timeout:number = 1250): boolean {
        // console.log("started_animation_at", (window.animation_until ?? 0) - 1250, performance.now() );
        // allow queuing the next action if the current audio will stop in a second
        if (window.animation_until !== null) {
            // register this call to be executed after the audio is played
            if (!window.after_audio_played && (window.animation_until - timeout < performance.now()) || timeout <= 0) {
                window.after_audio_played = callback;
                return true;
            }
            return false;
        }
        callback();
        return true;
    }

    public traverseScript(nodes: NodeList) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (!(node instanceof HTMLElement)) {
                continue;
            }
            if (this.playScript(node)) {
                return;
            }
        }
        this.doOutput(SceneObject.getCommonOutput("$FAIL"));
    }

    public playScript(node: HTMLElement): boolean {
        const type = node.getAttribute("data-type");
        console.log("playScript", type);
        switch (type) {
            case "output":
                return this.playOutput(node);
            case "option":
                return this.playOption(node);
            case "end-interaction":
                return this.playEndInteraction(node);
            case "sequence":
                return this.playSequence(node);
            case "first":
                return this.playFirst(node);
            case "once":
                return this.playOnce(node);
            case "all":
                return this.playAll(node);
            case "condition":
                return this.playCondition(node);
            case "set-variable":
                return this.playSetVariable(node);
            case "add-inventory":
                return this.playAddInventory(node);
            case "add-cursor":
                return this.playAddCursor(node);
            case "change-scene":
                console.log("change-scene");
                return this.playChangeScene(node);
        }
        return false;
    }

    public playSetVariable(node: HTMLElement): boolean {
        const variable = node.getAttribute("data-key");
        if (!variable) {
            return false;
        }
        const raw = node.getAttribute("data-value");
        // try to parse the to the correct type

        window.game_state[variable] = this.parseRawValue(raw);
        return true;
    }

    public playChangeScene(node: HTMLElement): boolean {
        let scene = node.getAttribute("data-value");
        if (!scene) {
            return false;
        }
        if (!scene.startsWith("scene-")) {
            scene = "scene-" + scene;
        }
        if (!window.world.has_scene(scene)) {
            return false;
        }
        window.world.show_scene(scene);
        return true;
    }

    /**
     * Checks for a condition and only then plays the child nodes
     * @param node
     */
    public playCondition(node: HTMLElement): boolean {
        console.log("playCondition", node);
        // # @ => element  || .<key> => element-key || ? => query selector count
        // $ => variable
        // ! => raw value
        const source = node.getAttribute("data-key");
        if (!source) {
            return false;
        }
        const source_value = this.parseReferenceValue(source);
        const value = this.parseReferenceValue(node.getAttribute("data-value") ?? "TRUE");

        // not, greater, less, equal
        const operator = node.getAttribute("data-operator") ?? "equal";
        const condition = this.parseComparison(source_value, operator, value);
        if (condition) {
            return this.playAll(node);
        }
        return false;
    }

    /**
     * Plays only the first child node that is successful
     * @param node
     */
    public playFirst(node: HTMLElement): boolean {
        const child_nodes = node.children;
        for (let i = 0; i < child_nodes.length; i++) {
            const child_node = child_nodes.item(i);
            if (child_node instanceof HTMLElement) {
                if (this.playScript(child_node)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Plays all child nodes
     * @param node
     */
    public playAll(node: HTMLElement): boolean {
        const child_nodes = node.children;
        let result = false;
        for (let i = 0; i < child_nodes.length; i++) {
            const child_node = child_nodes.item(i);
            if (child_node instanceof HTMLElement) {
                result = (!this.playScript(child_node)) || result;
            }
        }
        return true;
    }

    public playSequence(node: HTMLElement): boolean {
        const index = parseInt(node.getAttribute("data-index") ?? "0");
        const child_node = node.children.item(index) ?? null;
        if (child_node instanceof HTMLElement) {
            if (this.playScript(child_node)) {
                node.setAttribute("data-index", ((index + 1) % node.children.length).toString());
            }
            return true;
        }
        return false;
    }

    /**
     * Adds an item to the inventory
     * @param node
     */
    public playAddInventory(node: HTMLElement): boolean {
        const item_selector = node.getAttribute("data-value");
        if (!item_selector) {
            return false;
        }
        try {
            const $item = get_element_by_id(
                item_selector,
                HTMLElement
            );
            if (!$item) {
                return false;
            }
            window.inventory.add_item($item);
        } catch (e) {
            console.error(e);
            if (window.debug) {
                throw e;
            }
        }
        return false;
    }

    /**
     * Attaches an item to the cursor
     * @param node
     */
    public playAddCursor(node: HTMLElement): boolean {
        const item_selector = node.getAttribute("data-value");
        if (!item_selector) {
            return false;
        }
        try {
            const $item = get_element_by_id(
                item_selector,
                HTMLElement
            );
            if (!$item) {
                return false;
            }
            window.world.get_mouse().set_combine_option($item);
        } catch (e) {
            console.error(e);
            if (window.debug) {
                throw e;
            }
        }
        return true;
    }

    /**
     * Outputs some text
     * @param node
     */
    public playOutput(node: HTMLElement): boolean {
        return this.doOutput(node.innerText.trim());
    }

    public static contentToText(content: string): string {
        content = content.trim();
        if (content.startsWith("$")) {
            content = SceneObject.getCommonOutput(content);
        }
        return content.split("!#")[0];
    }

    public static contentToAudio(content: string): string {
        content = content.trim();
        if (content.startsWith("$")) {
            content = SceneObject.getCommonOutput(content);
        }
        content = content
            .replace(/\s+/g, " ")
            .replace(/>/g, "&lt;")
            .replace(/</g, "&gt;")
            .replace(/"/g, "'");
        return content;
    }

    /**
     * Handle output
     * @param content
     */
    public doOutput(content: string): boolean {
        window.text.write(SceneObject.contentToText(content));
        try {
            // encode the text to be used as a selector, to html special entities
            const audio_text = SceneObject.contentToAudio(content);
            const audios = document.querySelectorAll(`audio[data-text="${audio_text}"]`);
            const index = Math.floor(Math.random() * audios.length);
            if (audios[index] instanceof HTMLAudioElement) {
                const $audio = audios[index];
                if ($audio instanceof HTMLAudioElement) {
                    this.doAudio($audio);
                }
            }
        } catch (e) {
            console.error(e);
        }
        return true;
    }

    public static getCommonOutput(id: string): string {
        const options = {
            "$FAIL": [
                "I can't do that.",
                "That is impossible.",
                "Now, why should i do that!?"
            ]
        }[id] ?? "";
        return options[Math.floor(Math.random() * options.length)];
    }

    public doAudio($audio: HTMLAudioElement) {
        window.animation_until = performance.now() + ($audio.duration || 1) * 1000;
        window.$current_audio = $audio;
        $audio.volume = window.settings.sfx_volume;
        $audio.play().then(() => {
            if (window.$current_audio) {
                window.$current_audio.removeEventListener("ended", this.on_audio_ended);
            }
            $audio.addEventListener("ended", this.on_audio_ended, { once: true });
        }).catch((e) => {
            console.error(e);
            window.animation_until = null;
        });
        return true;
    }

    protected on_audio_ended = () => {
        console.log("audio ended");
        window.animation_until = null;
        if (window.after_audio_played) {
            const callback =  window.after_audio_played;
            window.after_audio_played = null;
            callback();
        }
    };

    /**
     * Plays this node only once (successfully) and then ignores it
     * @param node
     * @protected
     */
    protected playOnce(node: HTMLElement) {
        const played = node.getAttribute("data-played") === "true";
        if (played) {
            return false;
        }
        node.setAttribute("data-played", "true");
        return this.playAll(node);
    }


    protected parseRawValue(raw: string | null): number | string | boolean | null {
        if (raw === null) return null;
        if (raw === "TRUE") return true;
        if (raw === "FALSE") return false;
        if (raw.match(/^\d+$/)) return parseInt(raw);
        if (raw.match(/^\d+\.\d+$/)) return parseFloat(raw);
        return raw;
    }

    protected parseReferenceValue(target: string | null): number | string | boolean | null {
        if (target === null) return null;
        // raw value
        if (target.startsWith("!")) {
            return this.parseRawValue(target.substring(1));
        }
        // global variable reference
        if (target.startsWith("$")) {
            return window.game_state[target.substring(1)] ?? null;
        }
        try {
            // self element reference
            if (target.startsWith("@")) {
                return this.parsePartialReferenceValue(this.$object, target.substring(1));
            }
            // element reference
            if (target.startsWith("#")) {
                const match = target.match(
                    /^#(?<element>[a-zA-Z0-9_]+)(?<sub>.+)$/
                );
                const element_id = match?.groups?.element ?? "";
                const $element = get_element_by_id(element_id, HTMLElement);
                return this.parsePartialReferenceValue($element, match?.groups?.sub ?? null);
            }
        } catch (e) {
            this.issueError("Could not find reference element: " + target);
            return null;
        }
        return this.parseRawValue(target);
    }

    protected parsePartialReferenceValue(
        $element: HTMLElement,
        target: string | null
    ): number | string | boolean | null {
        if (target === null) return null;
        const match = target.match(
            /^(?<sub>[.?])(?<key>.+)$/
        );
        const sub = match?.groups?.sub;
        const key = match?.groups?.key;
        if (!sub || !key) {
            this.issueError("Invalid reference format");
            return null;
        }
        if (sub === ".") {
            const selector = `.data[data-key="${key}"]`;
            const $property = get_element_by_query_selector($element, selector, HTMLElement);
            return this.parseRawValue($property?.dataset?.value ?? null);
        }
        if (sub === "?") {
            return $element.querySelectorAll(key)?.length ?? 0;
        }
        this.issueError("Invalid reference sub format");
        return null;
    }

    protected issueError(message: string) {
        console.error(message);
        if (window.debug) {
            throw new Error(message);
        }
    }

    protected parseComparison(
        source_value: number | string | null | boolean,
        operator: string,
        value: number | string | null | boolean
    ) {
        switch (operator) {
            case "not":
                return source_value !== value;
            case "greater":
                // @ts-ignore @todo
                return source_value > value;
            case "less":
                // @ts-ignore @todo
                return source_value < value;
            case "equal":
                return source_value === value;
        }
        return false;
    }

    /**
     * Adds an option to the text options
     * @param node
     * @protected
     */
    protected playOption(node: HTMLElement) {
        const text = (node.dataset.text ?? "").trim();
        const index = parseInt(node.dataset.index ?? "0");
        window.text.option(text, () => {
            // when option is selected read the text
            this.queue(() => {
                this.doOutput(text);
                this.queue(() => {
                    // after that play the child nodes
                    window.text.remove_option(text);
                    this.playAll(node);
                }, 0);
            }, 1250);
        }, index);
        return false;
    }

    /**
     * Ends the interaction
     * @param node
     * @protected
     */
    protected playEndInteraction(node: HTMLElement) {
        window.text.clear_options();
        return true;
    }
}