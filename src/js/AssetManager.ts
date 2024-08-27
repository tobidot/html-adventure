/// <reference types="vite/client" />
import {Progress} from "./Progress.js";

interface PendingAsset {
    promise: Promise<void>;
    path: string;
    url: string;
    queued_at: number;
    finished_at: number | null;
}

interface Asset<T extends HTMLAudioElement | HTMLImageElement | SVGElement> {
    element: T;
    url: string;
}

export class AssetManager {
    public voices: Map<string, Asset<HTMLAudioElement>>;
    public tracks: Map<string, Asset<HTMLAudioElement>>;
    public sfx: Map<string, Asset<HTMLAudioElement>>;
    public images: Map<string, Asset<HTMLImageElement>>;
    public svgs: Map<string, Asset<SVGElement>>;
    //
    protected pending: Array<PendingAsset> = [];

    public constructor() {
        this.voices = new Map<string, Asset<HTMLAudioElement>>();
        this.tracks = new Map<string, Asset<HTMLAudioElement>>();
        this.sfx = new Map<string, Asset<HTMLAudioElement>>();
        this.images = new Map<string, Asset<HTMLImageElement>>();
        this.svgs = new Map<string, Asset<SVGElement>>();

    }

    public async load(progress: Progress) {
        const sub_progress = progress.make_child_progress(5);
        const image_progress = sub_progress.make_child_progress(1);
        const svg_progress = sub_progress.make_child_progress(1);
        const audio_progress = sub_progress.make_child_progress(1);
        const music_progress = sub_progress.make_child_progress(1);
        const sfx_progress = sub_progress.make_child_progress(1);
        await Promise.all([
            this.load_images(image_progress),
            this.load_svgs(svg_progress),
            this.load_audio(audio_progress),
            this.load_music(music_progress),
            this.load_sfx(sfx_progress),
        ]);
        this.activate_real_assets();
    }

    /**
     * replace the dummy images on the html with the real assets
     */
    public activate_real_assets() {
        for (const [path, image] of this.images.entries()) {
            const element_list = document.querySelectorAll(`img[data-src="${path}"]`);
            element_list.forEach(($item) => {
                if (($item instanceof HTMLImageElement)) {
                    $item.src = image.url;
                }
            });
        }
        for (const [path, svg] of this.svgs.entries()) {
            const element_list = document.querySelectorAll(`object[data-data="${path}"]`);
            element_list.forEach(($item) => {
                if (($item instanceof HTMLObjectElement)) {
                    $item.data = svg.url;
                }
            });
        }
        for (const [path, voice] of this.voices.entries()) {
            const element_list = document.querySelectorAll(`audio[data-src="${path}"]`);
            element_list.forEach(($item) => {
                if (($item instanceof HTMLAudioElement)) {
                    $item.src = voice.url;
                }
            });
        }
        for (const [path, track] of this.tracks.entries()) {
            const element_list = document.querySelectorAll(`audio[data-src="${path}"]`);
            element_list.forEach(($item) => {
                if (($item instanceof HTMLAudioElement)) {
                    $item.src = track.url;
                }
            });
        }
        for (const [path, sfx] of this.sfx.entries()) {
            const element_list = document.querySelectorAll(`audio[data-src="${path}"]`);
            element_list.forEach(($item) => {
                if (($item instanceof HTMLAudioElement)) {
                    $item.src = sfx.url;
                }
            });
        }
    }

    public async load_images(progress: Progress) {
        return this.load_assets(
            import.meta.glob("/public/images/**/*.png", {query: "url", eager: true, import: 'default'}),
            progress,
            async (single_progress, path, url) => {
                return new Promise<void>((resolve, reject) => {
                    const image = new Image();
                    this.images.set(path, {
                        element: image,
                        url: url,
                    });
                    image.addEventListener('load', () => {
                        single_progress.mark_as_done();
                        resolve();
                    });
                    image.addEventListener('error', () => {
                        console.warn("Failed to load image", url);
                        single_progress.mark_as_done();
                        reject();
                    });
                    image.src = url;
                });
            }
        );
    }

    public async load_svgs(progress: Progress) {
        return this.load_assets(
            import.meta.glob("/public/images/**/*.svg", {query: "url", eager: true, import: 'default'}),
            progress,
            async (single_progress, path, url) => {
                return fetch(url)
                    .then((response: Response) => {
                        return response.text();
                    })
                    .then((text: string) => {
                        const helper = document.createElement('div');
                        helper.innerHTML = text;
                        const svg = helper.querySelector('svg');
                        if (!(svg instanceof SVGElement)) {
                            throw new Error("Server returned invalid svg");
                        }
                        this.svgs.set(path, {
                            element: svg,
                            url: url,
                        });
                        single_progress.mark_as_done();
                    })
                    .catch((error: any) => {
                        console.warn("Failed to load svg", url, error);
                        single_progress.mark_as_done();
                    });
            }
        );
    }

    public async load_audio(progress: Progress) {
        return this.load_assets(
            import.meta.glob("/public/audio/**/*.mp3", {query: "url", eager: true, import: 'default'}),
            progress,
            async (single_progress, path, url) => {
                return new Promise<void>((resolve, reject) => {
                    const audio = new Audio(url);
                    this.voices.set(path, {
                        element: audio,
                        url: url,
                    });
                    audio.addEventListener('canplay', () => {
                        single_progress.mark_as_done();
                        resolve();
                    });
                    audio.addEventListener('error', () => {
                        console.warn("Failed to load audio", url);
                        single_progress.mark_as_done();
                        reject();
                    });
                    audio.preload = "auto";
                    audio.load();
                });
            }
        );
    }

    public async load_music(progress: Progress) {
        return this.load_assets(
            import.meta.glob("/public/music/**/*.mp3", {query: "url", eager: true, import: 'default'}),
            progress,
            async (single_progress, path, url) => {
                return new Promise<void>((resolve, reject) => {
                    const audio = new Audio(url);
                    this.tracks.set(path, {
                        element: audio,
                        url: url,
                    });
                    audio.addEventListener('canplay', () => {
                        single_progress.mark_as_done();
                        resolve();
                    });
                    audio.addEventListener('error', () => {
                        console.warn("Failed to load audio", url);
                        single_progress.mark_as_done();
                        reject();
                    });
                    audio.preload = "auto";
                    audio.load();
                });
            }
        );
    }

    public async load_sfx(progress: Progress) {
        return this.load_assets(
            import.meta.glob("/public/effects/**/*.mp3", {query: "url", eager: true, import: 'default'}),
            progress,
            async (single_progress, path, url) => {
                return new Promise<void>((resolve, reject) => {
                    const audio = new Audio(url);
                    this.sfx.set(path, {
                        element: audio,
                        url: url,
                    });
                    audio.addEventListener('canplay', () => {
                        single_progress.mark_as_done();
                        resolve();
                    });
                    audio.addEventListener('error', () => {
                        console.warn("Failed to load audio", url);
                        single_progress.mark_as_done();
                        reject();
                    });
                    audio.preload = "auto";
                    audio.load();
                });
            }
        );
    }

    public async load_assets(
        assets: Record<string, string>,
        progress: Progress,
        callback: (progress: Progress, path: string, url: string) => Promise<void>
    ) {
        const promises = new Array<Promise<void>>();
        const child_progress = progress.make_child_progress(Object.keys(assets).length);
        for (const [path, url] of Object.entries(assets)) {
            const single_progress = child_progress.make_child_progress(1);
            const promise = callback(single_progress, path, url);
            this.pending.push({
                promise,
                path,
                url,
                queued_at: performance.now(),
                finished_at: null,
            });
            const pending_index = this.pending.length - 1;
            promise.then(() => {
                this.pending[pending_index].finished_at = performance.now();
            });
            promises.push(promise);
        }
        return Promise.all(promises);
    }

    public list_pending() {
        return this.pending.filter((asset) => asset.finished_at === null).map((asset) => asset.path);
    }

}