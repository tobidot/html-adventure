export class InfoText {
    protected $text: HTMLElement;

    constructor() {
        const $text = document.getElementById('text');
        if (!$text) {
            throw new Error('Element #text not found');
        }
        this.$text = $text;
    }

    public write(content: string) {
        this.$text.innerText = content;
    }

}