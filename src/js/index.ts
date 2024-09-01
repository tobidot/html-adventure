import { World } from "./World";
import { SceneName } from "./enums/SceneName";

declare global {
    interface Window {
        world: World;
    }
}

window.world = new World();
window.addEventListener("click", () => {
    (async ()=>{
        await window.world.logic.load();
        // window.world.show_popup(PopupName.INVENTORY);
        window.world.logic.show_scene(SceneName.TUTORIAL);
        window.world.logic.highlight_objects();
        window.world.logic.stop_highlight_objects();
    })();
}, {once: true});

// const bread = get_element_by_id('bread');
// window.world.components.inventory.add_item(bread);
// window.world.get_mouse().set_combine_option(bread);

// window.world.components.text.write("Hello World!");
// window.world.components.text.option("Option 1", () => {
//     window.world.components.text.write("Not a chance!");
// });
// window.world.components.text.option("Option 2", () => {
//     window.world.components.text.write("Okee!");
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