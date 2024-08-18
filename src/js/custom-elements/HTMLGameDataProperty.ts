import { HTMLGameDataLike } from './HTMLGameDataLike';
export class HTMLGameDataProperty extends HTMLGameDataLike {

    public set value(value: string | null) {
        this.setAttribute("value", value ?? "");
    }

}