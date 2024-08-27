import { HTMLGameDataLike } from "./HTMLGameDataLike";
import { get_element_by_id } from "@game.object/ts-game-toolbox/dist";
import { get_element_by_query_selector } from "@game.object/ts-game-toolbox";
import { HTMLGameDataProperty } from "./HTMLGameDataProperty";

export class HTMLGameLogic extends HTMLGameDataLike {
    public play(): boolean {
        const type = this.type;
        switch (type) {
            case "first":
                return this.playFirst(this);
            case "all":
                return this.playAll(this);
            case "once":
                return this.playOnce(this);
            case "sequence":
                return this.playSequence(this);
        }
        console.warn(`playNode ${type} not implemented`);
        return true;
    }


    protected parseRawValue(raw: string | null): number | string | boolean | null {
        if (raw === null) return null;
        if (raw === "NULL") return null;
        if (raw === "TRUE") return true;
        if (raw === "FALSE") return false;
        if (raw.match(/^\d+$/)) return parseInt(raw);
        if (raw.match(/^\d+\.\d+$/)) return parseFloat(raw);
        return raw;
    }

    protected toRawValue(value: ValueType): string | null {
        if (value === null) return null;
        if (value === true) return "TRUE";
        if (value === false) return "FALSE";
        if (typeof value === "number") return value.toString();
        return value;
    }

    /**
     * Get a setter to the referenced parameter
     * @param target
     * @protected
     */
    protected parseReferenceValueSetter(target: string | null): null | ((value: ValueType) => void) {
        if (target === null) return null;
        if (target.startsWith("$")) {
            return (value: ValueType) => {
                window.game_state[target.substring(1)] = value;
            };
        }
        try {
            if (target.startsWith("@")) {
                const $object = this.closest("game-data") as HTMLElement;
                return this.parsePartialReferenceValueSetter($object, target.substring(1));
            }
            if (target.startsWith("#")) {
                const match = target.match(
                    /^#(?<element>[a-zA-Z0-9_]+)(?<sub>.+)$/
                );
                const element_id = match?.groups?.element ?? "";
                const $element = get_element_by_id(element_id, HTMLElement);
                return this.parsePartialReferenceValueSetter($element, match?.groups?.sub ?? null);
            }
        } catch (e) {
            this.issueError("Could not find reference element: " + target);
            return null;
        }
        return null;
    }

    protected parseReferenceValue(target: string | null): ValueType {
        if (target === null) return null;
        // raw value
        if (target.startsWith("!")) {
            return this.parseRawValue(target.substring(1));
        }
        // global variable reference
        if (target.startsWith("$")) {
            return window.game_state[target.substring(1)] ?? null;
        }
        try {
            // self element reference
            if (target.startsWith("@")) {
                const $object = this.closest("game-data") as HTMLElement;
                return this.parsePartialReferenceValue($object, target.substring(1));
            }
            // element reference
            if (target.startsWith("#")) {
                const match = target.match(
                    /^#(?<element>[a-zA-Z0-9_]+)(?<sub>.+)$/
                );
                const element_id = match?.groups?.element ?? "";
                const $element = get_element_by_id(element_id, HTMLElement);
                return this.parsePartialReferenceValue($element, match?.groups?.sub ?? null);
            }
        } catch (e) {
            this.issueError("Could not find reference element: " + target);
            return null;
        }
        return this.parseRawValue(target);
    }

    protected parsePartialReferenceValueSetter(
        $element: HTMLElement,
        target: string | null
    ): ((value: ValueType) => void) | null {
        if (target === null) return null;
        const match = target.match(
            /^(?<sub>[.?])(?<key>.+)$/
        );
        const sub = match?.groups?.sub;
        const key = match?.groups?.key;
        if (!sub || !key) {
            this.issueError("Invalid reference format");
            return null;
        }
        if (sub === ".") {
            const selector = `game-data > game-data-property[key="${key}"]`;
            const $property = get_element_by_query_selector($element, selector, HTMLGameDataProperty);
            return (value: ValueType) => {
                $property.value = this.toRawValue(value);
            };
        }
        this.issueError("Invalid reference sub format");
        return null;
    }

    protected parsePartialReferenceValue(
        $element: HTMLElement,
        target: string | null
    ): number | string | boolean | null {
        if (target === null) return null;
        const match = target.match(
            /^(?<sub>[.?])(?<key>.+)$/
        );
        const sub = match?.groups?.sub;
        const key = match?.groups?.key;
        if (!sub || !key) {
            this.issueError("Invalid reference format");
            return null;
        }
        if (sub === ".") {
            const selector = `game-data > game-data-property[key="${key}"]`;
            const $property = get_element_by_query_selector($element, selector, HTMLGameDataProperty);
            return this.parseRawValue($property.value ?? null);
        }
        if (sub === "?") {
            return $element.querySelectorAll(key)?.length ?? 0;
        }
        this.issueError("Invalid reference sub format");
        return null;
    }

    protected issueError(message: string) {
        console.error(message);
        if (window.world.props.debug) {
            throw new Error(message);
        }
    }


    /**
     * Plays this node only once (successfully) and then ignores it
     * @param node
     * @protected
     */
    protected playOnce(node: HTMLElement) {
        const played = node.getAttribute("data-played") === "true";
        if (played) {
            return false;
        }
        node.setAttribute("data-played", "true");
        return this.playAll(node);
    }


    /**
     * Plays only the first child node that is successful
     * @param node
     */
    public playFirst(node: HTMLElement): boolean {
        const child_nodes = node.children;
        for (let i = 0; i < child_nodes.length; i++) {
            const child_node = child_nodes.item(i);
            if (child_node instanceof HTMLGameLogic) {
                if (child_node.play()) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Plays all child nodes
     * @param node
     */
    public playAll(node: HTMLElement): boolean {
        const child_nodes = node.children;
        let result = false;
        for (let i = 0; i < child_nodes.length; i++) {
            const child_node = child_nodes.item(i);
            if (child_node instanceof HTMLGameLogic) {
                result = (!child_node.play()) || result;
            }
        }
        return true;
    }

    public playSequence(node: HTMLGameLogic): boolean {
        const index = parseInt(node.getAttribute("sequence_index") ?? "0");
        const child_node = node.children.item(index) ?? null;
        if (child_node instanceof HTMLGameLogic) {
            if (child_node.play()) {
                node.setAttribute("sequence_index", ((index + 1) % node.children.length).toString());
            }
            return true;
        }
        return false;
    }

}

type ValueType = number | string | boolean | null;