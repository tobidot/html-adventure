export abstract class HTMLGameDataLike extends HTMLElement {

    public constructor() {
        super();
    }

    public get key(): string | null {
        return this.getAttribute("key") ?? null;
    }

    public get value(): string | null {
        return this.getAttribute("value") ?? this.innerText.trim() ?? null;
    }

    public get type(): string | null {
        return this.getAttribute("type") ?? null;
    }
}