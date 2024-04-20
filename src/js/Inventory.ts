import { get_element_by_id } from "@game.object/ts-game-toolbox/dist";

export class Inventory {
    public $root: HTMLElement;
    public $items: HTMLElement;

    constructor() {
        this.$root = get_element_by_id('inventory');
        this.$items = get_element_by_id('inventory-items');
    }

    public add_item($item: HTMLElement) {
        console.log('add_item', $item);
        $item.setAttribute('style', '');
        this.$items.appendChild($item);
    }

    public is_open() {
        return this.$root.parentElement?.id === 'popup';
    }
}