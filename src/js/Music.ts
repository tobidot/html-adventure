import { get_element_by_id } from "@game.object/ts-game-toolbox";
import { throw_expression } from "@game.object/ts-game-toolbox/dist";

export class Music {
    public $music_list: HTMLElement;
    public music_list: Array<HTMLAudioElement> = [];
    public named_tracks: Map<string, HTMLAudioElement> = new Map<string, HTMLAudioElement>();
    public current_track: string ;
    public $current_track: HTMLAudioElement;
    public music_transition_seconds: number = 0;
    public max_music_transition_seconds: number = 0.5;
    public next_track : string ;

    constructor(
        track:string
    ) {
        this.current_track = this.next_track= track;
        this.$music_list = get_element_by_id("music-list");
        this.music_list = [];
        this.$music_list.querySelectorAll("audio").forEach(($audio) => {
            this.music_list.push($audio);

            $audio.addEventListener("ended", this.on_track_ended);

            if ($audio.dataset.track) {
                this.named_tracks.set($audio.dataset.track, $audio);
            }
        });
        this.$current_track = this.named_tracks.get(this.current_track) ?? throw_expression("Track not found");
        requestAnimationFrame(this.handle_volume);
    }

    public play() {
        console.log("Play :", this.current_track);
        const $track = this.named_tracks.get(this.current_track);
        if (!$track) {
            console.error("Track not found", this.current_track);
            return;
        }
        this.$current_track.volume = window.world.components.settings.music_volume;
        this.$current_track.pause();
        this.$current_track = $track;
        $track.play()
            .catch((error) => {
                console.error("Audio play error", error);
            });
    }

    public change_track_now(track: string) {
        this.current_track = track;
        this.next_track = track;
        this.play();
    }

    public change_scene() {
        const scene = window.world.logic.get_active_scene();
        if (!scene) {
            return;
        }

        const allowed_tracks = scene.get_allowed_tracks();
        if (!allowed_tracks.includes(this.current_track) && !allowed_tracks.includes("*")) {
            this.music_transition_seconds = this.max_music_transition_seconds;
            // Track is not allowed here => switch
            this.next_track = allowed_tracks[Math.floor(Math.random() * allowed_tracks.length)];
        }
        this.play();
    }

    protected on_track_ended = () => {
        this.change_scene();
    };

    protected handle_volume = ()=>{
        const delta_time = 1 / 60;
        if (this.music_transition_seconds < 0) {
            requestAnimationFrame(this.handle_volume);
            return ;
        }
        this.music_transition_seconds -= delta_time;
        // quadratic easing
        const percent = this.music_transition_seconds / this.max_music_transition_seconds;
        if (percent < 0.5 && this.next_track !== this.current_track) {
            this.change_track_now(this.next_track);
        }
        const t = (percent - 0.5) * 2;
        const t2 = t * t;
        this.$current_track.volume = window.world.components.settings.music_volume * t2;
        requestAnimationFrame(this.handle_volume);
    };
}