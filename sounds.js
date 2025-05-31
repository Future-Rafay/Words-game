// Sound effects manager
const SoundManager = {
    sounds: {
        correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
        incorrect: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
        win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
        lose: new Audio('https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3'),
        hint: new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3')
    },

    play(soundName) {
        if (this.sounds[soundName]) {
            // Reset the sound to start
            this.sounds[soundName].currentTime = 0;
            // Play the sound
            this.sounds[soundName].play().catch(error => {
                console.log('Sound playback failed:', error);
            });
        }
    }
}; 