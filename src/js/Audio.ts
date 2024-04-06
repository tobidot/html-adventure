import { get_element_by_id } from "@game.object/ts-game-toolbox";

export class Audio {
    public $root: HTMLAudioElement;

    constructor() {
        console.log('Audio module');
        this.$root = get_element_by_id('audio', HTMLAudioElement);
    }

    public play() {
        console.log('Play');
        this.$root.volume = window.settings.music_volume;
        this.$root.play();
    }
}