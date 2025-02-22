import { HTMLGameDataLike } from "./HTMLGameDataLike";
import { HTMLGameLogic } from "./HTMLGameLogic";
import { get_element_by_id } from "@game.object/ts-game-toolbox/dist";
import { ActionHelper } from "../ActionHelper";
import { RunFunctionInput } from "../Queue";

export class HTMLGameLogicAction extends HTMLGameLogic {
    public play() {
        const type = this.type;
        switch (this.getAttribute("type")) {
            case "output":
                return this.playOutput();
            case "add-cursor":
                return this.playAddCursor();
            case "end-interaction":
                return this.playEndInteraction();
            case "add-inventory":
                return this.playAddInventory(this);
            case "set-variable":
                return this.playSetVariable(this);
            case "change-scene":
                return this.playChangeScene(this);
        }
        console.warn(`playNode ${this.type} not implemented`);
        return false;
    }


    /**
     * Outputs some text
     */
    public playOutput(): boolean {
        const entry = {
            run: (self: RunFunctionInput) => {
                const stop = ActionHelper.outputTextAndAudio(this.innerText.trim(), self.finished, self?.about_to_finish);
                self.provide_shortcut(stop);
            }
        };
        window.queue.push(entry);
        console.log("queue", window.queue);
        return true;
    }

    /**
     * Ends the interaction
     * @protected
     */
    protected playEndInteraction() {
        window.text.clear_options();
        return true;
    }

    /**
     * Attaches an item to the cursor
     * @protected
     */
    protected playAddCursor(): boolean {
        const item_selector = this.value;
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
            window.game_state.using = item_selector;
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
     * Adds an item to the inventory
     * @param node
     */
    public playAddInventory(node: HTMLElement): boolean {
        const item_selector = node.getAttribute("value");
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
     * Sets a variable
     * @param node
     */
    public playSetVariable(node: HTMLElement): boolean {
        const variable = node.getAttribute("key");
        if (!variable) {
            return false;
        }
        const setter = this.parseReferenceValueSetter(variable);
        const raw = node.getAttribute("value");
        setter?.(this.parseReferenceValue(raw));
        return true;
    }

    public playChangeScene(node: HTMLElement): boolean {
        let scene = node.getAttribute("value");
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
}