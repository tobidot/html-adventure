import {HTMLGameDataLike} from "./HTMLGameDataLike";
import {HTMLGameLogic} from "./HTMLGameLogic";
import {get_element_by_id} from "@game.object/ts-game-toolbox/dist";
import {ActionHelper} from "../ActionHelper";
import {RunFunctionInput} from "../Queue";

export class HTMLGameLogicAction extends HTMLGameLogic {
    public async play(): Promise<boolean> {
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
            case "set-attribute":
                return this.playSetAttribute(this);
            case "change-scene":
                return this.playChangeScene(this);
        }
        console.warn(`playNode ${this.type} not implemented`);
        return false;
    }


    /**
     * Outputs some text
     */
    public async playOutput(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const entry = {
                run: (self: RunFunctionInput) => {
                    const old_finished = self.finished;
                    self.finished = () => {
                        old_finished();
                        resolve(true);
                    };
                    const stop = ActionHelper.outputTextAndAudio(this.innerText.trim(), self.finished, self?.about_to_finish);
                    self.provide_shortcut(stop);
                }
            };
            return window.world.components.queue.push(entry).catch(reject);
        });
    }

    /**
     * Ends the interaction
     * @protected
     */
    protected playEndInteraction() {
        window.world.components.text.clear_options();
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
            window.world.logic.get_mouse().set_combine_option($item);
        } catch (e) {
            console.error(e);
            if (window.world.props.debug) {
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
            window.world.components.inventory.add_item($item);
        } catch (e) {
            console.error(e);
            if (window.world.props.debug) {
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

    /**
     * Sets a ab elements attribute
     * @param node
     */
    public playSetAttribute(node: HTMLElement): boolean {
        const key = node.getAttribute("key");
        if (!key) {
            return false;
        }
        const [selector, attributeRaw] = key.split("@");
        const attribute = attributeRaw.replaceAll(/-[a-z]/g, (match) => {
            return match[1].toUpperCase();
        });
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) {
            throw new Error(`Element not found: ${selector}`);
        }
        const raw = node.getAttribute("value");
        const resolved_value = this.toRawValue(this.parseReferenceValue(raw));
        if (resolved_value === null) {
            element.removeAttribute(attribute);
        } else {
            element.dataset[attribute] = resolved_value;
        }
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
        console.log("change to", scene);
        if (!window.world.logic.has_scene(scene)) {
            console.log("not found");
            return false;
        }
        window.world.logic.show_scene(scene);
        return true;
    }
}