import { SceneObject } from "../SceneObject";

export class HTMLGameInteractable extends HTMLElement {
    static observedAttributes = ["cx", "cy", "width"];

    public $scene_object: SceneObject | null = null;

    public set cx(value:string) {
        this.style.left = value;
    }

    public set cy(value:string) {
        this.style.top = value ;
    }

    public set width(value:string) {
        this.style.width = value;
    }

    public attributeChangedCallback(name:string, old_value:string, new_value:string) {
        switch (name) {
            case "cx":
                this.cx = new_value;
                break;
            case "cy":
                this.cy = new_value;
                break;
            case "width":
                this.width = new_value;
                break
        }
    }
}

