export class Scene {
    public id: string;
    public $root: HTMLElement;

    constructor(settings: {
        $root: HTMLElement;
    }) {
        this.$root = settings.$root;
        this.id = this.$root.id;
    }
}