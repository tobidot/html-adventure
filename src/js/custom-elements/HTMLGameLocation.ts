export class HTMLGameLocation extends HTMLElement {

    public constructor() {
        super();
    }

    public get allowed_tracks() : Array<string> {
        // console.log(this.getAttributeNames());
        // console.log(this.getAttribute('music')?.split(','));
        return this.getAttribute('music')?.split(',') ?? [];
    }
}