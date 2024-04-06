import { InfoText } from "./InfoText";
import { World } from "./World";
import { Popup } from "./Popup";
import { PopupName } from "./enums/PopupName";
import { Audio } from "./Audio";
import { Settings } from "./Settings";
import { Keyboard } from "./Keyboard";
import { SceneName } from "./enums/SceneName";

declare global {
    interface Window {
        settings: Settings;
        world: World;
        text: InfoText;
        audio: Audio;
        keyboard: Keyboard;
    }
}

window.settings = new Settings();
window.world = new World();
window.audio = new Audio();
window.text = new InfoText();
window.keyboard = new Keyboard();
window.world.load_settings();
// window.world.show_popup(PopupName.MENU);
window.world.show_scene(SceneName.MAP);
