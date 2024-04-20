import { get_element_by_id } from "@game.object/ts-game-toolbox/dist";

export class InfoText {
    protected $options: HTMLElement;
    protected $output: HTMLElement;

    constructor() {
        this.$output = get_element_by_id("interaction-output");
        this.$options = get_element_by_id("interaction-options");
    }

    public write(content: string) {
        const $div = document.createElement("div");
        $div.className = "output-entry";
        $div.innerText = content;
        this.$output.innerHTML = "";
        this.$output.append($div);
    }

    public option(content: string, callback: () => void, index?: number) {
        const $div = document.createElement("div");
        $div.className = "options-entry";
        $div.innerText = content;
        $div.addEventListener("click", () => {
            callback();
        });
        $div.style.order = index?.toString() ?? "";
        this.$options.append($div);
    }

    public remove_option(text: string) {
        const $options = this.$options.getElementsByClassName("options-entry");
        for (let i = 0; i < $options.length; i++) {
            const $option = $options[i] as HTMLElement;
            if ($option.innerText === text) {
                $option.remove();
                return;
            }
        }
    }

    public clear_options() {
        this.$options.innerHTML = "";
    }

    public clear() {
        this.$output.innerHTML = "";
        this.$options.innerHTML = "";
    }

    public has_options() {
        return this.$options.getElementsByClassName("options-entry").length > 0;
    }
}