import { PopupName } from "./enums/PopupName";

export class Keyboard {
    constructor() {
        window.addEventListener("keydown", this.on_keydown);
        window.addEventListener("keyup", this.on_keyup);
    }

    protected on_keydown = (event: KeyboardEvent) => {
        switch (event.key) {
            case "Escape":
                if (window.world.components.text.has_options()) {
                    window.world.components.text.clear_options();
                } else {
                    window.world.logic.toggle_popup(PopupName.MENU);
                }
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