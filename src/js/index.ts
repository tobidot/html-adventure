import { InfoText } from "./InfoText";
import { World } from "./World";
import { Music } from "./Music";
import { Settings } from "./Settings";
import { Keyboard } from "./Keyboard";
import { SceneName } from "./enums/SceneName";
import { PopupName } from "./enums/PopupName";
// import map_church from "./src/images/map/map-church.svg";

declare global {
    interface Window {
        settings: Settings;
        world: World;
        text: InfoText;
        music: Music;
        keyboard: Keyboard;
    }
}

window.settings = new Settings();
window.world = new World();
window.music = new Music();
window.text = new InfoText();
window.keyboard = new Keyboard();
window.world.load_settings();
window.world.show_popup(PopupName.MENU);
// window.world.show_scene(SceneName.MAP);
