import { PopupName } from "./enums/PopupName";
import {SceneName} from "./enums/SceneName.js";

export class Keyboard {
    constructor() {
        window.addEventListener("keydown", this.on_keydown);
        window.addEventListener("keyup", this.on_keyup);
    }

    protected on_keydown = (event: KeyboardEvent) => {
        switch (event.key) {
            case "Escape":
                event.preventDefault();
                if (window.world.components.text.has_options()) {
                    window.world.components.text.clear_options();
                } else {
                    window.world.logic.toggle_popup(PopupName.MENU);
                }
                break;
            case "i":
            case "I":
            case "Control":
                event.preventDefault();
                if (!event.repeat) {
                    window.world.logic.toggle_popup(PopupName.INVENTORY);
                }
                break;
            case "m":
            case "M":
            case "Alt":
                event.preventDefault();
                if (!event.repeat) {
                    if (window.world.logic.can_show_map()) {
                        if (window.world.logic.get_active_scene()?.id === SceneName.MAP) {
                            window.world.logic.show_scene(window.world.logic.get_previous_scene()?.id ?? SceneName.LOST_FOREST);
                        } else {
                            window.world.logic.show_scene(SceneName.MAP);
                        }
                    }
                }
                break;
            case "Tab":
                event.preventDefault();
                break;
            case " ":
                window.world.components.queue.shortcut();
                break;
            case "Shift":
                window.world.logic.highlight_objects();
                break;

            default:
                console.log("Unknown key:", event.key);
        }
    };

    protected on_keyup = (event: KeyboardEvent) => {
        switch (event.key) {
            case "Shift":
                window.world.logic.stop_highlight_objects();
                break;
        }
    }
}