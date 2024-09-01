import {get_element_by_id} from "@game.object/ts-game-toolbox";
import {Popup} from "./Popup";
import {Scene} from "./Scene";
import {Cursor, CursorOptionState} from "./Cursor";
import {HTMLGameLocation} from "./custom-elements/HTMLGameLocation";
import {AssetManager} from "./AssetManager";
import {Progress} from "./Progress.js";
import {Inventory} from "./Inventory.js";
import {InfoText} from "./InfoText.js";
import {Queue} from "./Queue.js";
import {Settings} from "./Settings.js";
import {Music} from "./Music.js";
import {Keyboard} from "./Keyboard.js";
import {LoadingScreen} from "./LoadingScreen.js";
import {SceneName} from "./enums/SceneName.js";

export class World {

    public elements: Elements;
    public logic: Logic;
    public props: Properties;
    public components: Components;
    public listeners: Listeners;
    //
    //


    constructor() {
        this.elements = new Elements(this);
        this.logic = new Logic(this);
        this.props = new Properties(this);
        this.components = new Components(this);
        this.listeners = new Listeners(this);
    }

}

class Elements {
    public $main: HTMLElement;
    public $root: HTMLElement;
    public $loading_screen: HTMLElement;

    public $scene: HTMLElement;
    public $scene_list: HTMLElement;

    public $popup: HTMLElement;
    public $popup_list: HTMLElement;
    public $game_menu: Popup;

    public constructor(
        public parent: World
    ) {
        this.$root = get_element_by_id('game');
        this.$main = get_element_by_id('main');
        this.$loading_screen = get_element_by_id('loading-screen');
        //
        this.$scene = get_element_by_id('scene');
        this.$scene_list = get_element_by_id('scene-list');
        //
        this.$popup = get_element_by_id('popup');
        this.$popup_list = get_element_by_id('popup-list');
        this.$game_menu = new Popup({$root: get_element_by_id('game-menu')});
        //
    }
}

class Logic {
    public constructor(
        public parent: World
    ) {
    }

    public async load() {
        this.load_settings();

        this.parent.components.loading_screen.logic.update_progress(0);
        const progress = new Progress();
        const asset_progress = progress.make_child_progress(1);
        asset_progress.listen((percent, self) => {
            this.parent.components.loading_screen.logic.update_progress(percent);
        });

        await this.parent.components.assets.load(asset_progress);
        this.parent.components.loading_screen.logic.finish();

        this.parent.components.mouse.set_option_state(CursorOptionState.INTERACT);
    }

    public load_settings() {
        const $settings = get_element_by_id('settings', HTMLFormElement);
        for (const key of ['global_volume', 'music_volume', 'sfx_volume'] as const) {
            const $item = $settings.elements.namedItem(key);
            if ($item instanceof HTMLInputElement) {
                $item.value = (window.world.components.settings[key] * 100).toString();
            }
        }
    }

    public show_popup(popup_id: string) {
        const popup = this.parent.props.popups_map.get(popup_id);
        if (!popup) {
            throw new Error(`Popup not found: ${popup_id}`);
        }
        this.parent.elements.$popup.appendChild(popup.$root);
    }

    public hide_popup(popup_id: string) {
        const popup = this.parent.props.popups_map.get(popup_id);
        if (!popup) {
            throw new Error(`Popup not found: ${popup_id}`);
        }
        this.parent.elements.$popup_list.appendChild(popup.$root);
    }

    public toggle_popup(popup_id: string) {
        const popup = this.parent.props.popups_map.get(popup_id);
        if (!popup) {
            throw new Error(`Popup not found: ${popup_id}`);
        }
        if (this.parent.elements.$popup.contains(popup.$root)) {
            this.hide_popup(popup_id);
        } else {
            this.show_popup(popup_id);
        }
    }

    public show_scene(scene_id: string) {
        // if scene did not change return
        if (this.parent.props.active_scene && this.parent.props.active_scene.id === scene_id) {
            return;
        }
        const new_scene = this.parent.props.scenes_map.get(scene_id) ?? null;
        if (!new_scene) {
            throw new Error(`Scene not found: ${scene_id}`);
        }
        if (this.parent.props.active_scene) {
            this.parent.elements.$scene_list.appendChild(this.parent.props.active_scene.$root);
        }
        this.parent.elements.$scene.appendChild(new_scene.$root);
        this.parent.props.previous_scene = this.parent.props.active_scene;
        this.parent.props.active_scene = new_scene;
        this.stop_highlight_objects();
        new_scene.enter();

        window.world.components.music.change_scene();
        this.get_mouse().update_cursor_state();
        // Todo change music
    }

    public has_scene(scene: string): boolean {
        return this.parent.props.scenes_map.has(scene);
    }

    public get_mouse(): Cursor {
        return this.parent.components.mouse;
    }

    public get_active_scene(): Scene | null {
        return this.parent.props.active_scene;
    }

    public get_previous_scene(): Scene | null {
        return this.parent.props.previous_scene;
    }

    public highlight_objects() {
        if (!this.parent.props.active_scene || (this.parent.props.active_scene.id === SceneName.MAP)) {
            return;
        }
        this.parent.elements.$root.dataset.showClickAreas = "true";
        this.parent.elements.$scene.querySelectorAll('.click-area').forEach(($item) => {
            if ($item instanceof HTMLObjectElement) {
                const svg = $item.contentDocument;
                if (svg) {
                    svg.querySelectorAll('*').forEach(($shape) => {
                        $shape.removeAttribute('fill');
                        $shape.removeAttribute('fill-opacity');
                    });
                    svg.querySelectorAll('#shape').forEach(($shape) => {
                        $shape.setAttribute('fill', 'red');
                        $shape.setAttribute('fill-opacity', '0.5');
                    });
                } else {
                    console.error('SVG not found', $item);
                    debugger;
                }
            }

        });
    }

    public stop_highlight_objects() {
        if (!this.parent.props.active_scene || (this.parent.props.active_scene.id === SceneName.MAP)) {
            return;
        }
        delete this.parent.elements.$root.dataset.showClickAreas;
        this.parent.elements.$scene.querySelectorAll('.click-area').forEach(($item) => {
            if (!($item instanceof HTMLObjectElement)) {
                return ;
            }
            const svg = $item.contentDocument;
            if (!svg) {
                return ;
            }
            svg.querySelectorAll('#shape').forEach(($path) => {
                $path.setAttribute('fill', 'transparent');
                console.info('SVG', $path.getAttribute('fill'));
            });
        });
    }

    public can_show_map(): boolean {
        return this.parent.elements.$root.dataset.seesMap !== "false";
    }
}

class Properties {
    public scenes_map: Map<string, Scene> = new Map();
    public scenes_list: Array<Scene> = [];
    public popups_map: Map<string, Popup> = new Map();
    public popups_list: Array<Popup> = [];
    //
    public active_scene: Scene | null = null;
    public previous_scene: Scene | null = null;
    public debug = true;

    public constructor(
        public parent: World
    ) {
        for (const $scene of this.scenes_list) {
            this.scenes_map.set($scene.id, $scene);
        }
        this.popups_list = [];
        for (let i = 0; i < this.parent.elements.$popup_list.children.length; i++) {
            const $item = this.parent.elements.$popup_list.children[i];
            if ($item instanceof HTMLElement) {
                const item = new Popup({$root: $item});
                this.popups_list.push(item);
                this.popups_map.set(item.id, item);
            }
        }
        this.scenes_list = [];
        for (let i = 0; i < this.parent.elements.$scene_list.children.length; i++) {
            const $item = this.parent.elements.$scene_list.children[i];
            if ($item instanceof HTMLGameLocation) {
                const item = new Scene({$root: $item});
                console.log('scene ', item.id);
                this.scenes_list.push(item);
                this.scenes_map.set(item.id, item);
            }
        }
    }
}

class Components {
    public assets: AssetManager;
    public settings: Settings;
    public loading_screen: LoadingScreen;
    //
    public queue: Queue;
    public inventory: Inventory;
    public text: InfoText;
    public music: Music;
    //
    public mouse: Cursor;
    public keyboard: Keyboard;

    public constructor(
        public parent: World
    ) {
        this.settings = new Settings();
        this.assets = new AssetManager();
        this.loading_screen = new LoadingScreen({
            $root: this.parent.elements.$loading_screen,
            $main: this.parent.elements.$main,
        });
        //
        this.queue = new Queue();
        this.inventory = new Inventory();
        this.text = new InfoText();
        this.music = new Music("title");
        //
        this.keyboard = new Keyboard();
        this.mouse = new Cursor();
    }
}

class Listeners {
    public constructor(
        public parent: World
    ) {
        this.parent.elements.$root.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        // make sure all click areas hide on load
        this.parent.elements.$main.querySelectorAll('.click-area').forEach(($item) => {
            const id = $item.closest('.object')?.id;
            console.info('Object Item ', id);
            $item.addEventListener('load', this.on_load_click_area);
        });
    }

    public on_load_click_area = (event: Event) => {
        const $item = event.target;
        if (!($item instanceof HTMLObjectElement)) {
            console.info('No html object element', $item);
            return;
        }
        const svg = $item.contentDocument;
        if (svg === null) {
            console.error('SVG not found');
            return;
        }
        svg.querySelectorAll('#shape').forEach(($path) => {
            $path.setAttribute('fill', 'transparent');
            console.info('SVG', $path.getAttribute('fill'));
        });
    }
}