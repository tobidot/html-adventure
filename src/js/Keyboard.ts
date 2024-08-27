import { PopupName } from "./enums/PopupName";

export class Keyboard {
    constructor() {
        window.addEventListener("keydown", this.on_keydown);
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
            default:
                console.log("Unknown key:", event.key);
        }
    };
}