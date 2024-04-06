import { get_element_by_query_selector } from "@game.object/ts-game-toolbox";
import { CursorOptionState } from "./Cursor";

declare global {
    interface Window {
        is_playing_audio: boolean;
        after_audio_played: null | (() => void);
    }
}
window.is_playing_audio = false;
window.after_audio_played = null;

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
                this.doOutput(SceneObject.getCommonOutput("$FAIL"));
            }
        };


        // if i am playing audio i will not do anything for now
        if (window.is_playing_audio) {
            // register this call to be executed after the audio is played
            if (!window.after_audio_played) {
                window.after_audio_played = play;
            }
            return;
        }
        play();
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
        switch (type) {
            case "output":
                return this.playOutput(node);
            case "sequence":
                return this.playSequence(node);
            case "condition":
                return this.playCondition(node);
            case "change-scene":
                console.log("change-scene");
                return this.playChangeScene(node);
        }
        return false;
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

    public playCondition(node: HTMLElement): boolean {
        console.log("playCondition", node);
        const condition = node.getAttribute("data-target");
        const operator = node.getAttribute("data-operator") ?? "has";
        const value = node.getAttribute("data-value");
        const $target = get_element_by_query_selector(this.$data, `[data-${condition}="${value}"]`, HTMLElement);
        if ($target) {
            this.traverseScript($target.childNodes);
            return true;
        }
        return false;
    }

    public playSequence(node: HTMLElement): boolean {
        const index = parseInt(node.getAttribute("data-index") ?? "0");
        const child_node = node.children.item(index) ?? null;
        console.log("playSequence", index, child_node);
        if (child_node instanceof HTMLElement) {
            if (this.playScript(child_node)) {
                node.setAttribute("data-index", ((index + 1) % node.children.length).toString());
            }
            return true;
        }
        return false;
    }

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

    public static getCommonOutput(id: string) : string {
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
        window.is_playing_audio = true;
        $audio.volume = window.settings.sfx_volume;
        $audio.play().then(() => {
            $audio.addEventListener("ended", () => {
                console.log("ended");
                window.is_playing_audio = false;
                if (window.after_audio_played) {
                    window.after_audio_played();
                    window.after_audio_played = null;
                }
            }, { once: true });
        }).catch((e) => {
            console.error(e);
            window.is_playing_audio = false;
        });
        return true;
    }


}