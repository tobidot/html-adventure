export class ActionHelper {
    /**
     * Convert elements content to an audio identifier
     * @param content
     */
    public static contentToAudio(content: string): string {
        content = content.trim();
        if (content.startsWith("$")) {
            content = ActionHelper.getTextFromIdentifier(content);
        }
        content = content
            .replace(/\s+/g, " ")
            .replace(/>/g, "&lt;")
            .replace(/</g, "&gt;")
            .replace(/"/g, "'");
        return content;
    }

    /**
     * Give output for a wrong / not supported action
     */
    public static triggerFail(ended: ()=>void, about_to_end?: ()=>void) {
        ActionHelper.outputTextAndAudio("$FAIL", ended, about_to_end);
    }

    /**
     * Handle output
     * @param content
     */
    public static outputText(content: string): void {
        window.world.components.text.write(ActionHelper.getTextFromContent(content));
    }


    /**
     * Outputs audio
     */
    public static outputAudio(content: string, ended: ()=>void, about_to_end ?: ()=>void) : ()=>void {
        try {
            // encode the text to be used as a selector, to html special entities
            const audio_text = ActionHelper.contentToAudio(content);
            const audios = document.querySelectorAll(`audio[data-text="${audio_text}"]`);
            const index = Math.floor(Math.random() * audios.length);
            if (audios[index] instanceof HTMLAudioElement) {
                const $audio = audios[index];
                if ($audio instanceof HTMLAudioElement) {
                    return ActionHelper.triggerAudio($audio, ended, about_to_end);
                }
            }
            console.warn(`No audio found for text: ${content}`)
            // could not play audio => immideatly mark as finished
            ended();
        } catch (e) {
            console.error(e);
            ended();
        }
        return ()=>{};
    }

    /**
     * Triggers an audio element to play its audio
     * @param $audio
     * @param ended
     * @param about_to_end
     */
    public static triggerAudio($audio: HTMLAudioElement, ended: () => void, about_to_end?: ()=>void): ()=>void {
        $audio.volume = window.world.components.settings.sfx_volume;
        $audio.play()
            .then(() => {
                $audio.addEventListener("ended", ended, { once: true });
                $audio.addEventListener("pause", ended, { once: true });
            })
            .catch((e) => {
                console.error(e);
                ended();
            });
        const timeout = Math.max(250,($audio.duration - 1000));
        const handle = about_to_end ? setTimeout(about_to_end, timeout) : null;
        // return function how to stop/skip the current audio
        return ()=>{
            $audio.pause();
            $audio.removeEventListener("ended", ended);
            if (handle) clearTimeout(handle);
            $audio.currentTime = 0;
        };
    }

    /**
     * Convert elements content into text
     * @param content
     */
    public static getTextFromContent(content: string): string {
        content = content.trim();
        if (content.startsWith("$")) {
            content = ActionHelper.getTextFromIdentifier(content);
        }
        return content.split("!#")[0];
    }

    /**
     * Returns the text for some predefined values
     * @param id
     */
    public static getTextFromIdentifier(id: string): string {
        const options = {
            "$FAIL": [
                "I can't do that.",
                "That is impossible.",
                "Now, why should I do that!?",
                "I am not insane, ... yet.",
            ]
        }[id] ?? "";
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Output audio and text
     * @param content
     * @param ended
     * @param about_to_end
     */
    public static outputTextAndAudio(content: string, ended : ()=>void, about_to_end?: ()=>void):  ()=>void {
        this.outputText(content);
        return this.outputAudio(content, ended, about_to_end);
    }
}