import { InfoText } from "./InfoText";
import { World } from "./World";
import { Music } from "./Music";
import { Settings } from "./Settings";
import { Keyboard } from "./Keyboard";
import { SceneName } from "./enums/SceneName";
import { PopupName } from "./enums/PopupName";
import { Inventory } from "./Inventory";
import { get_element_by_id } from "@game.object/ts-game-toolbox/dist";
import { Queue } from "./Queue";

declare global {
    interface Window {
        settings: Settings;
        queue: Queue,
        world: World;
        text: InfoText;
        music: Music;
        keyboard: Keyboard;
        inventory: Inventory;
        debug: boolean;
    }
}

window.debug = true;
window.queue = new Queue();
window.settings = new Settings();
window.world = new World();
window.music = new Music("title");
window.text = new InfoText();
window.keyboard = new Keyboard();
window.inventory = new Inventory();

(async ()=>{
    window.world.load_settings();
    await window.world.load_assets();
    // window.world.show_popup(PopupName.INVENTORY);
    // window.world.show_scene(SceneName.HOME);
})();

// const bread = get_element_by_id('bread');
// window.inventory.add_item(bread);
// window.world.get_mouse().set_combine_option(bread);

// window.text.write("Hello World!");
// window.text.option("Option 1", () => {
//     window.text.write("Not a chance!");
// });
// window.text.option("Option 2", () => {
//     window.text.write("Okee!");
// });










// queue.push({
//     run: (self) => {
//         console.log("running");
//         let finished = false;
//         self.provide_shortcut(()=>{
//             return ()=>{
//                 if (finished) return;
//                 console.log("shortcut");
//                 finished = true;
//                 self.finished();
//             }
//         });
//         setTimeout(() => {
//             if (finished) return;
//             console.log("about to finish");
//             self.about_to_finish?.();
//         }, 500);
//         setTimeout(() => {
//             if (finished) return;
//             console.log("finished");
//             finished = true;
//             self.finished();
//         }, 1000);
//     }
// });