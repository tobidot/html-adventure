function on_first_user_interact() {
    console.info("Checking Validity of Audio Files and Text Outputs...");

    // check if all audio files can be played
    const audio = document.querySelectorAll('#audio-list audio');
    for(let i = 0; i < audio.length; i++) {
        const $audio = audio[i];
        if (!($audio instanceof HTMLAudioElement)) {
            continue;
        }
        // check if source is valid
        $audio.volume = 0;
        $audio.play().then(() => {
            $audio.pause();
        });
    }

    // check if all text outputs have a corresponding audio file
    const text = document.querySelectorAll('[data-type="output"]');
    const missing_audios = [];
    for(let i = 0; i < text.length; i++) {
        const $output = text.item(i);
        if (!($output instanceof HTMLElement)) {
            continue;
        }
        const inner_text = $output.innerText.trim();
        const encoded_text = inner_text
            .replaceAll(/\s/g, " ")
            .replaceAll(/>/g, "&lt;")
            .replaceAll(/</g, "&gt;")
            .replaceAll(/"/g, "'");
        const audios = document.querySelectorAll(`audio[data-text="${encoded_text}"]`);
        if (audios.length <= 0) {
            missing_audios.push(inner_text);
            // console.error(`No audio file found for text: ${inner_text}`);
        }
    }
    if (missing_audios.length > 0) {
        console.error(`No audio files found for the following texts: `, missing_audios);
    }

}

document.addEventListener('click', on_first_user_interact, { once: true });