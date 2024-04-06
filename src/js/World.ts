import { get_element_by_id } from "@game.object/ts-game-toolbox";
import { CSSToken } from "./enums/CSSToken";
import { Popup } from "./Popup";
import { Scene } from "./Scene";
import { Cursor } from "./Cursor";

export class World {
    //
    protected $active_scene: Scene | null = null;
    protected $scene: HTMLElement;
    protected $scene_list: HTMLElement;
    protected scenes_map: Map<string, Scene> = new Map();
    protected scenes_list: Array<Scene> = [];
    //
    protected $popup: HTMLElement;
    protected $popup_list: HTMLElement;
    protected popups_map: Map<string, Popup> = new Map();
    protected popups_list: Array<Popup> = [];
    protected game_menu: Popup;
    //
    protected $game: HTMLElement;
    //
    protected mouse: Cursor = new Cursor();


    constructor() {
        this.$scene = get_element_by_id('scene');
        this.$scene_list = get_element_by_id('scene-list');
        this.scenes_list = [];
        for (let i = 0; i < this.$scene_list.children.length; i++) {
            const $item = this.$scene_list.children[i];
            if ($item instanceof HTMLElement) {
                const item = new Scene({ $root: $item });
                console.log('scene ', item.id);
                this.scenes_list.push(item);
                this.scenes_map.set(item.id, item);
            }
        }
        for (const $scene of this.scenes_list) {
            this.scenes_map.set($scene.id, $scene);
        }
        //
        this.$popup = get_element_by_id('popup');
        this.$popup_list = get_element_by_id('popup-list');
        this.popups_list = [];
        for (let i = 0; i < this.$popup_list.children.length; i++) {
            const $item = this.$popup_list.children[i];
            if ($item instanceof HTMLElement) {
                const item = new Popup({ $root: $item });
                this.popups_list.push(item);
                this.popups_map.set(item.id, item);
            }
        }
        //
        this.$game = get_element_by_id('game');
        this.$game.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        this.game_menu = new Popup({ $root: get_element_by_id('game-menu') });
    }

    public show_popup(popup_id: string) {
        const popup = this.popups_map.get(popup_id);
        if (!popup) {
            throw new Error(`Popup not found: ${popup_id}`);
        }
        this.$popup.appendChild(popup.$root);
    }

    public hide_popup(popup_id: string) {
        const popup = this.popups_map.get(popup_id);
        if (!popup) {
            throw new Error(`Popup not found: ${popup_id}`);
        }
        this.$popup_list.appendChild(popup.$root);
    }

    public toggle_popup(popup_id: string) {
        const popup = this.popups_map.get(popup_id);
        if (!popup) {
            throw new Error(`Popup not found: ${popup_id}`);
        }
        if (this.$popup.contains(popup.$root)) {
            this.hide_popup(popup_id);
        } else {
            this.show_popup(popup_id);
        }
    }

    public show_scene(scene_id: string) {
        const new_scene = this.scenes_map.get(scene_id) ?? null;
        if (!new_scene) {
            throw new Error(`Scene not found: ${scene_id}`);
        }
        if (this.$active_scene) {
            this.$scene_list.appendChild(this.$active_scene.$root);
        }
        this.$scene.appendChild(new_scene.$root);
        this.$active_scene = new_scene;

        window.music.change_scene();
        // Todo change music
    }

    public has_scene(scene: string): boolean {
        return this.scenes_map.has(scene);
    }

    public load_settings() {
        const $settings = get_element_by_id('settings', HTMLFormElement);
        for (const key of ['global_volume', 'music_volume', 'sfx_volume'] as const) {
            const $item = $settings.elements.namedItem(key);
            if ($item instanceof HTMLInputElement) {
                $item.value = (window.settings[key] * 100).toString();
            }
        }
    }

    public get_active_scene( ): Scene|null {
        return this.$active_scene;
    }
}