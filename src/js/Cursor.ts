import {get_element_by_id, get_element_by_query_selector} from "@game.object/ts-game-toolbox";
import {SceneObject} from "./SceneObject";
import {get_element_by_class_name} from "@game.object/ts-game-toolbox/dist";
import {CSSToken} from "./enums/CSSToken";
import {HTMLGameInteractable} from "./custom-elements/HTMLGameInteractable";

import cursorOptionInteractUrl from "/assets/images/icons/cursor-option-interact.png";
import cursorOptionInspectUrl from "/assets/images/icons/cursor-option-inspect.png";
import cursorOptionTalkUrl from "/assets/images/icons/cursor-option-talk.png";
import cursorOptionPickUpUrl from "/assets/images/icons/cursor-option-pick-up.png";
import cursorOptionWalkUrl from "/assets/images/icons/cursor-option-walk.png";
import cursorPointingLeftUrl from "/assets/images/icons/cursor-pointing-left.png";
import cursorPointingRightUrl from "/assets/images/icons/cursor-pointing-right.png";
import cursorPointingUpUrl from "/assets/images/icons/cursor-pointing-up.png";
import cursorPointingDownUrl from "/assets/images/icons/cursor-pointing-down.png";
import cursorPointingForwardUrl from "/assets/images/icons/cursor-pointing-forward.png";
import cursorPointingBackwardUrl from "/assets/images/icons/cursor-pointing-backward.png";

export enum CursorState {
    DEFAULT = "default",
    HOVER = "hover",
    CLICK = "click",
    OPTIONS = "options",
}

export enum CursorOptionState {
    NONE = "none",
    INTERACT = "interact",
    INSPECT = "inspect",
    TALK = "talk",
    PICK_UP = "pick-up",
    COMBINE = "combine",
}

export class Cursor {
    // elements
    protected $game: HTMLElement;
    protected $mouse: HTMLElement;
    protected $options: HTMLElement;
    protected $active_option_image: HTMLImageElement;
    protected $special_option: HTMLImageElement ;
    // update handle
    protected update_handle: number = 0;
    protected last_event: MouseEvent | null = null;
    // mouse state
    protected mouse_x: number = 0;
    protected mouse_y: number = 0;
    protected mouse_left_down: boolean = false;
    protected mouse_right_down: boolean = false;
    // the current state of the cursor: hover, click, options
    protected state: CursorState = CursorState.DEFAULT;
    // the current option that the user wants to perform
    protected option_state: CursorOptionState = CursorOptionState.NONE;
    // the element the mouse is currently hovering over
    protected $hovering: HTMLElement | null = null;
    // if the user is carrying an item
    protected $attached: HTMLElement | null = null;

    constructor() {
        this.$game = get_element_by_id("game");
        this.$mouse = get_element_by_id("cursor");
        this.$options = get_element_by_query_selector(this.$mouse, "[data-state=\"options\"]");
        this.$active_option_image = get_element_by_query_selector(this.$mouse, ".active-option", HTMLImageElement);
        this.$special_option = get_element_by_query_selector(this.$mouse, ".special-option", HTMLImageElement);
        this.$game.addEventListener("mousemove", this.on_mouse_move, {passive: true});
        this.$game.addEventListener("mousedown", this.on_mouse_down, {passive: true});
        this.$game.addEventListener("mouseup", this.on_mouse_up, {passive: true});
        this.$game.addEventListener("mouseleave", this.on_mouse_leave, {passive: true});
        this.$game.addEventListener("wheel", this.on_mouse_wheel, {passive: true});
    }

    public on_mouse_wheel = (event: WheelEvent) => {
        const order = [
            CursorOptionState.INTERACT,
            CursorOptionState.INSPECT,
            CursorOptionState.PICK_UP,
            CursorOptionState.TALK
        ] as const;
        const index = order.indexOf(this.$options.dataset.option as typeof order[number]);
        const new_index = (index + (event.deltaY > 0 ? 1 : -1) + order.length) % order.length;
        this.set_option_state(order[new_index]);
    };

    public on_mouse_leave = (event: MouseEvent) => {
        this.state = CursorState.DEFAULT;
        this.$mouse.dataset.state = CursorState.DEFAULT;
        this.mouse_left_down = false;
        this.mouse_right_down = false;
    };

    public on_mouse_down = (event: MouseEvent) => {
        if (window.world.components.text.has_options()) {
            return;
        }
        switch (event.button) {
            case 0:
                this.mouse_left_down = true;
                this.state = CursorState.CLICK;
                this.$mouse.dataset.state = CursorState.CLICK;
                break;
            case 2:
                this.mouse_right_down = true;
                this.state = CursorState.OPTIONS;
                this.$mouse.dataset.state = CursorState.OPTIONS;
                break;
        }
    };

    public on_mouse_up = (event: MouseEvent) => {
        if (window.world.components.text.has_options()) {
            return;
        }
        switch (event.button) {
            case 0:
                this.mouse_left_down = false;
                break;
            case 2:
                this.mouse_right_down = false;
                break;
        }
        this.handle_action();
        this.update_cursor_state();
    };

    public on_mouse_move = (event: MouseEvent) => {
        this.last_event = event;
        if (this.update_handle) {
            // already updating
            return;
        }
        this.update_handle = requestAnimationFrame(() => {
            this.update_handle = 0;
            this.update_cursor_state();
        });
    };

    public handle_action() {
        // if I have a queue that can be shortcut, do that instead of the action
        if (window.world.components.queue.shortcut()) {
            return;
        }
        if (this.$hovering && this.option_state !== CursorOptionState.NONE && this.$hovering instanceof HTMLGameInteractable) {
            const object = new SceneObject({$object: this.$hovering});
            object.act(this.option_state);
        }
    }

    public update_cursor_state() {
        if (!this.last_event) {
            return;
        }
        if (!this.mouse_right_down) {
            this.move(this.last_event.clientX - this.$game.offsetLeft, this.last_event.clientY - this.$game.offsetTop);
        }
        if (this.last_event.target instanceof HTMLElement && this.last_event.target.closest("#interaction-options")) {
            this.$mouse.classList.add(CSSToken.CURSOR_HOVER_TEXT);
            return;
        } else {
            this.$mouse.classList.remove(CSSToken.CURSOR_HOVER_TEXT);
        }
        if (this.mouse_left_down) {
            this.state = CursorState.CLICK;
            this.$mouse.dataset.state = CursorState.CLICK;
            return;
        }
        if (this.mouse_right_down) {
            this.state = CursorState.OPTIONS;
            this.$mouse.dataset.state = CursorState.OPTIONS;
            const px = this.last_event.clientX - this.$game.offsetLeft;
            const py = this.last_event.clientY - this.$game.offsetTop;
            const option = [
                [CursorOptionState.INTERACT, CursorOptionState.INSPECT],
                [CursorOptionState.PICK_UP, CursorOptionState.TALK]
            ][py > this.mouse_y ? 1 : 0][px > this.mouse_x ? 1 : 0];
            this.set_option_state(option);
            return;
        }
        if (this.is_hovering()) {
            this.state = CursorState.HOVER;
            this.$mouse.dataset.state = CursorState.HOVER;
            const special_hover = this.$hovering?.dataset.hover;
            if (special_hover && this.option_state === CursorOptionState.INTERACT) {
                this.$special_option.src = this.resolveSpecialHoverImage(special_hover);
                this.$mouse.classList.add(CSSToken.CURSOR_HOVER_SPECIAL);
            } else {
                this.$special_option.src = '';
                this.$mouse.classList.remove(CSSToken.CURSOR_HOVER_SPECIAL);
            }
            return;
            // }
        } else {
            this.state = CursorState.DEFAULT;
            this.$mouse.dataset.state = CursorState.DEFAULT;
            this.$mouse.classList.remove(CSSToken.CURSOR_HOVER_SPECIAL);
            this.$special_option.src = '';
            return;
        }
    }

    protected resolveSpecialHoverImage(special_hover: string): string {
        switch (special_hover) {
            case "interact":
                return cursorOptionInteractUrl;
            case "inspect":
                return cursorOptionInspectUrl;
            case "talk":
                return cursorOptionTalkUrl;
            case "pick-up":
                return cursorOptionPickUpUrl;
            case "walk":
                return cursorOptionWalkUrl;
            case "left":
                return cursorPointingLeftUrl;
            case "right":
                return cursorPointingRightUrl;
            case "up":
            case "upward":
            case "upwards":
                return cursorPointingUpUrl;
            case "down":
            case "downward":
            case "downwards":
                return cursorPointingDownUrl;
            case "front":
            case "forward":
            case "forwards":
                return cursorPointingForwardUrl;
            case "back":
            case "backward":
            case "backwards":
                return cursorPointingBackwardUrl;
            default:
                return special_hover;
        }
    }

    public is_hovering(): boolean {
        const $objects = window.world.components.inventory.is_open()
            ? window.world.components.inventory.$items.querySelectorAll(".object")
            : window.world.logic.get_active_scene()?.$root.querySelectorAll(".object");
        if (!$objects) {
            return false;
        }
        for (let i = 0; i < $objects.length; i++) {
            const $object = $objects[i];
            if ($object instanceof HTMLElement && this.is_hovering_object($object)) {
                this.$hovering = $object;
                return true;
            }
        }
        this.$hovering = null;
        return false;
    }

    public is_hovering_object($object: HTMLElement): boolean {
        if (!this.last_event) {
            return false;
        }
        const rect = $object.getBoundingClientRect();
        if (this.last_event.clientX < rect.left) {
            return false;
        }
        if (this.last_event.clientX > rect.right) {
            return false;
        }
        if (this.last_event.clientY < rect.top) {
            return false;
        }
        if (this.last_event.clientY > rect.bottom) {
            return false;
        }

        if ($object.dataset.visible === "false") {
            return false;
        }

        const $click_area = get_element_by_class_name($object, "click-area", HTMLObjectElement);

        const svg_document = $click_area.getSVGDocument();

        if (!svg_document) {
            return false;
        }

        const cursor = {
            x: (this.last_event.clientX - rect.left),
            y: (this.last_event.clientY - rect.top)
        };

        let $elements = svg_document.elementsFromPoint(cursor.x, cursor.y);
        return $elements.reduce((result, $element) => {
            return result || (!!$element.closest("#shape"));
        }, false);
    }

    /**
     * This function moves the cursor to the given x and y coordinates.
     * It is throttled to 60fps
     * @param x
     * @param y
     */
    public move(x: number, y: number) {
        this.$mouse.style.left = `${x}px`;
        this.$mouse.style.top = `${y}px`;
        this.mouse_x = x;
        this.mouse_y = y;
    }


    public set_option_state(option: CursorOptionState) {
        this.option_state = option;
        this.$options.dataset.option = option;
        const $image = get_element_by_query_selector(
            this.$options,
            `[data-action="${option}"]`,
            HTMLImageElement
        );
        this.$active_option_image.src = $image.src;
        this.$mouse.classList.add(CSSToken.CURSOR_ACTIVE_OPTION);

    }

    public set_combine_option(item: HTMLElement) {
        if (this.$attached) {
            // drop the item back into inventory
            window.world.components.inventory.add_item(this.$attached);
        }
        this.option_state = CursorOptionState.COMBINE;
        this.$attached = item;
        const $image = get_element_by_class_name(item, "image", HTMLImageElement);
        this.$active_option_image.src = $image.src;
        this.$mouse.classList.add(CSSToken.CURSOR_ACTIVE_OPTION);
    }
}