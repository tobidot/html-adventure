import {Progress} from "./Progress.js";
import {get_element_by_class_name} from "@game.object/ts-game-toolbox/dist";
import {CSSToken} from "./enums/CSSToken.js";

interface Settings {
    $root: HTMLElement;
    $main: HTMLElement;
}

export class LoadingScreen {

    public elements: Elements;
    public props: Properties;
    public logic: Logic;
    public listeners: Listeners;

    public constructor(
        public readonly settings: Settings
    ) {
        this.elements = new Elements(this, settings.$root, settings.$main);
        this.props = new Properties(this);
        this.logic = new Logic(this);
        this.listeners = new Listeners(this);
    }

}

class Elements {
    public $root: HTMLElement;
    public $main: HTMLElement;
    public $bar: HTMLElement;
    public $text: HTMLElement;
    public $progress: HTMLElement;

    public constructor(
        public parent: LoadingScreen,
        $root: HTMLElement,
        $main: HTMLElement,
    ) {
        this.$root = $root;
        this.$main = $main;
        this.$bar = get_element_by_class_name($root, 'loading-screen__bar');
        this.$text = get_element_by_class_name($root, 'loading-screen__text');
        this.$progress = get_element_by_class_name($root, 'loading-screen__progress');

    }

}

class Properties {
    public progress: Progress;

    public constructor(
        public parent: LoadingScreen
    ) {
        this.progress = new Progress();
    }

}


class Logic {
    public constructor(
        public parent: LoadingScreen
    ) {
    }

    public update_progress(progress: number) {
        this.parent.props.progress.set_self_progress(progress);
        this.parent.elements.$progress.style.width = `${progress * 100}%`;
        this.parent.elements.$text.innerText = `${(progress * 100).toFixed(2)}%`;
    }

    public finish() {
        this.parent.elements.$root.remove();
        this.parent.elements.$main.classList.remove(CSSToken.LOADING);
        console.log('Done Loading');
    }
}

class Listeners {
    public constructor(
        public parent: LoadingScreen
    ) {
    }

}