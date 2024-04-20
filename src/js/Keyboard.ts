import { PopupName } from "./enums/PopupName";

export class Keyboard {
    constructor() {
        window.addEventListener('keydown', this.on_keydown);
    }

    protected on_keydown = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'Escape':
                if (window.text.has_options()) {
                    window.text.clear_options();
                } else {
                    window.world.toggle_popup(PopupName.MENU);
                }
                break;
            default:
                console.log('Unknown key:', event.key);
        }
    }
}