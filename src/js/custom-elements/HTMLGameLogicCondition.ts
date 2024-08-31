import { HTMLGameDataLike } from "./HTMLGameDataLike";
import { HTMLGameLogic } from "./HTMLGameLogic";

export class HTMLGameLogicCondition extends HTMLGameLogic {

    public play() {
        return this.playCondition()
    }

    public get operator(): string {
        return this.getAttribute("operator") ?? "equal";
    }

    /**
     * Checks for a condition and only then plays the child nodes
     */
    public async playCondition(): Promise<boolean> {
        // # @ => element  || .<key> => element-key || ? => query selector count
        // $ => variable
        // ! => raw value
        const source = this.key;
        if (!source) {
            return false;
        }
        const source_value = this.parseReferenceValue(source);
        const value = this.parseReferenceValue(this.value ?? "TRUE");

        // not, greater, less, equal
        const operator = this.operator;
        if (!operator) {

        }
        const condition = this.parseComparison(source_value, operator, value);
        if (condition) {
            return this.playAll(this);
        }
        return false;
    }

    protected parseComparison(
        source_value: number | string | null | boolean,
        operator: string,
        value: number | string | null | boolean
    ) {
        switch (operator) {
            case "not":
                return source_value !== value;
            case "greater":
                // @ts-ignore @todo
                return source_value > value;
            case "less":
                // @ts-ignore @todo
                return source_value < value;
            case "equal":
                return source_value === value;
        }
        return false;
    }
}