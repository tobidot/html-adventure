/**
 * Settings class to store the global settings of the application
 */



export class Settings {

    protected _global_volume: number = 0;
    protected _music_volume: number = 0;
    protected _sfx_volume: number = 0;

    public constructor() {
        this.load_settings();
        window.addEventListener("beforeunload", () => this.save_settings());
    }

    private load_settings(): void {
        const local_storage = window.localStorage;
        this.reset();
        this._global_volume = parseFloat(local_storage.getItem("global_volume") ?? this._global_volume.toString());
        this._music_volume = parseFloat(local_storage.getItem("music_volume") ?? this._music_volume.toString());
        this._sfx_volume = parseFloat(local_storage.getItem("sfx_volume") ?? this._sfx_volume.toString());
    }

    public save_settings(): void {
        window.localStorage.setItem("global_volume", this._global_volume.toString());
        window.localStorage.setItem("music_volume", this._music_volume.toString());
        window.localStorage.setItem("sfx_volume", this._sfx_volume.toString());
    }

    public reset(): void {
        this._global_volume = 0.5;
        this._music_volume = 0.1;
        this._sfx_volume = 1.0;
    }

    public get global_volume(): number {
        return this._global_volume;
    }

    public set global_volume(value: number) {
        this._global_volume = value;
        window.localStorage.setItem("global_volume", value.toString());
        window.world.components.music.$current_track.volume = this.music_volume;
    }

    public get music_volume(): number {
        return this._music_volume * this.global_volume;
    }

    public set music_volume(value: number) {
        this._music_volume = value;
        window.localStorage.setItem("music_volume", value.toString());
        window.world.components.music.$current_track.volume = this.music_volume;
    }

    public get sfx_volume(): number {
        return this._sfx_volume * this.global_volume;
    }

    public set sfx_volume(value: number) {
        this._sfx_volume = value;
        window.localStorage.setItem("sfx_volume", value.toString());
    }


    public set(key: string, value: FormDataEntryValue) {
        switch (key) {
            case "global_volume":
                this.global_volume = parseFloat(value.toString()) / 100.0;
                break;
            case "music_volume":
                this.music_volume = parseFloat(value.toString()) / 100.0;
                break;
            case "sfx_volume":
                this.sfx_volume = parseFloat(value.toString()) / 100.0;
                break;
            default:
                console.log("Unknown setting:", key);
        }
    }

}