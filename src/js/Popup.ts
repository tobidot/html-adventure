import { get_element_by_id } from "@game.object/ts-game-toolbox";
import { PopupName } from "./enums/PopupName";
import { SceneName } from "./enums/SceneName";

export class Popup {
    public id: string;
    public $root: HTMLElement;
    protected $menu_items: NodeListOf<HTMLElement>;

    constructor(settings: {
        $root: HTMLElement;
    }) {
        this.$root = settings.$root;
        this.id = this.$root.id;
        this.$menu_items = this.$root.querySelectorAll('.menu-item');
        this.$menu_items.forEach(($menu_item) => {
            $menu_item.addEventListener('click', this.on_menu_item_click);
            $menu_item.addEventListener('change', this.on_menu_item_change);
        });
    }

    protected on_menu_item_change = (event: Event) => {
        const $menu_item = event.target as HTMLElement;
        const action = $menu_item.getAttribute('data-action');
        switch (action) {
            case 'setting':
                this[action]();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    protected on_menu_item_click = (event: Event) => {
        const $menu_item = event.target as HTMLElement;
        const action = $menu_item.getAttribute('data-action');
        switch (action) {
            case 'start':
            case 'menu':
            case 'inventory':
            case 'map':
                this[action]();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    protected start() {
        window.world.hide_popup(PopupName.MENU);
        window.world.show_scene(SceneName.START);
        window.music.play();
    }

    protected menu() {
        window.world.toggle_popup(PopupName.MENU);
    }

    protected inventory() {
        window.world.toggle_popup(PopupName.INVENTORY);
    }

    protected map() {
        window.world.show_scene(SceneName.MAP);
    }

    protected setting() {
        const $settings = get_element_by_id('settings', HTMLFormElement);
        const data = new FormData($settings);
        data.forEach((value, key) => {
            window.settings.set(key, value);
        });
    }
}