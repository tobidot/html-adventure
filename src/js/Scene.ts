import { HTMLGameLocation } from "./custom-elements/HTMLGameLocation";

export class Scene {
    public id: string;
    public $root: HTMLGameLocation;
    public allowed_tacks: Array<string> = [];

    constructor(settings: {
        $root: HTMLGameLocation;
    }) {
        this.$root = settings.$root;
        this.id = this.$root.id;
        this.allowed_tacks = this.$root.allowed_tracks;
    }

    public get_allowed_tracks(): Array<string> {
        return this.allowed_tacks;
    }
}