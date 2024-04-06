export class Scene {
    public id: string;
    public $root: HTMLElement;
    public allowed_music: Array<string> = [];

    constructor(settings: {
        $root: HTMLElement;
    }) {
        this.$root = settings.$root;
        this.id = this.$root.id;
        this.allowed_music = this.$root.dataset.music?.split(",") ?? [];
    }

    public get_allowed_tracks() {
        return this.allowed_music;
    }
}