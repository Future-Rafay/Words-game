// DOM Elements
const mainMenu = document.getElementById('main-menu');
const settingsPanel = document.getElementById('settings-panel');
const howToPlayPanel = document.getElementById('how-to-play-panel');
const gameContainer = document.getElementById('game-container');
const quoteBoxes = document.getElementById('quote-boxes');
const keyboard = document.getElementById('keyboard');
const messageArea = document.getElementById('message-area');
const hintButton = document.getElementById('hint-button');
const currentStreakElement = document.getElementById('current-streak');
const bestStreakElement = document.getElementById('best-streak');
const quoteAttribution = document.getElementById('quote-attribution');

// Settings Elements
const soundToggle = document.getElementById('sound-toggle');
const musicToggle = document.getElementById('music-toggle');
const hintsToggle = document.getElementById('hints-toggle');

// Menu Buttons
const startGameBtn = document.getElementById('start-game');
const settingsBtn = document.getElementById('settings-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const backToMenuBtn = document.getElementById('back-to-menu');
const backToMenuFromHelpBtn = document.getElementById('back-to-menu-from-help');
const menuBtn = document.getElementById('menu-btn');
const settingsIconBtn = document.getElementById('settings-icon-btn');

// Add this at the beginning of your script.js file
let currentCategory = null;

// Game state
const gameState = {
    currentQuote: '',
    currentAuthor: '',
    currentMeaning: '',
    guessedLetters: new Set(),
    attempts: 0,
    maxAttempts: 3,
    isGameOver: false,
    letterHints: new Map(),
    hintsRemaining: 3,
    currentStreak: 0,
    bestStreak: 0,
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        showHints: true
    },
    usedQuotes: new Set()
};

// Initialize the game
function initGame() {
    loadSettings();
    loadStreaks();
    setupEventListeners();
    showMainMenu();
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
        gameState.settings = JSON.parse(savedSettings);
        updateSettingsUI();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('gameSettings', JSON.stringify(gameState.settings));
}

// Update settings UI
function updateSettingsUI() {
    soundToggle.checked = gameState.settings.soundEnabled;
    musicToggle.checked = gameState.settings.musicEnabled;
    hintsToggle.checked = gameState.settings.showHints;
}

// Setup event listeners
function setupEventListeners() {
    // Menu navigation
    startGameBtn.addEventListener('click', startGame);
    settingsBtn.addEventListener('click', showSettings);
    howToPlayBtn.addEventListener('click', showHowToPlay);
    backToMenuBtn.addEventListener('click', showMainMenu);
    backToMenuFromHelpBtn.addEventListener('click', showMainMenu);
    menuBtn.addEventListener('click', handleMenuButtonClick);
    settingsIconBtn.addEventListener('click', showSettings);

    // Settings toggles
    soundToggle.addEventListener('change', () => {
        gameState.settings.soundEnabled = soundToggle.checked;
        saveSettings();
    });

    musicToggle.addEventListener('change', () => {
        gameState.settings.musicEnabled = musicToggle.checked;
        saveSettings();
    });

    hintsToggle.addEventListener('change', () => {
        gameState.settings.showHints = hintsToggle.checked;
        saveSettings();
        updateHintNumbers();
    });
}

// New function to handle menu button click
function handleMenuButtonClick() {
    if (gameContainer.classList.contains('hidden')) {
        // If not in game, just go to main menu
        showMainMenu();
    } else {
        // If in game, show confirmation dialog
        Swal.fire({
            title: 'Leave Game?',
            text: 'Your current game progress will be lost. Are you sure you want to return to the main menu?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Leave',
            cancelButtonText: 'No, Continue',
            customClass: {
                popup: 'swal2-dark',
                title: 'swal2-title-custom',
                htmlContainer: 'swal2-html-container-custom'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                showMainMenu();
            }
        });
    }
}

// Show main menu
function showMainMenu() {
    mainMenu.classList.remove('hidden');
    settingsPanel.classList.add('hidden');
    howToPlayPanel.classList.add('hidden');
    gameContainer.classList.add('hidden');
    // Ensure category panel is hidden when returning to main menu
    document.getElementById('category-panel').classList.add('hidden');
}

// Show settings panel
function showSettings() {
    if (gameContainer.classList.contains('hidden')) {
        // If we're in the main menu or category selection, show the full settings panel
        mainMenu.classList.add('hidden');
        document.getElementById('category-panel').classList.add('hidden');
        settingsPanel.classList.remove('hidden');
        howToPlayPanel.classList.add('hidden');
        gameContainer.classList.add('hidden');
    } else {
        // If we're in the game, show the in-game settings overlay
        const inGameSettings = document.createElement('div');
        inGameSettings.className = 'in-game-settings';
        inGameSettings.innerHTML = `
            <div class="settings-content">
                <h2 class="text-center mb-6">Settings</h2>
                <div class="settings-options">
                    <div class="setting-item">
                        <label for="in-game-sound-toggle">Sound Effects</label>
                        <label class="switch">
                            <input type="checkbox" id="in-game-sound-toggle" ${gameState.settings.soundEnabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label for="in-game-music-toggle">Background Music</label>
                        <label class="switch">
                            <input type="checkbox" id="in-game-music-toggle" ${gameState.settings.musicEnabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label for="in-game-hints-toggle">Show Hint Numbers</label>
                        <label class="switch">
                            <input type="checkbox" id="in-game-hints-toggle" ${gameState.settings.showHints ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <button id="close-settings" class="menu-btn mt-6">Close</button>
            </div>
        `;
        document.body.appendChild(inGameSettings);

        // Setup event listeners for in-game settings
        const closeSettingsBtn = document.getElementById('close-settings');
        const soundToggle = document.getElementById('in-game-sound-toggle');
        const musicToggle = document.getElementById('in-game-music-toggle');
        const hintsToggle = document.getElementById('in-game-hints-toggle');

        closeSettingsBtn.addEventListener('click', () => {
            inGameSettings.remove();
        });

        soundToggle.addEventListener('change', () => {
            gameState.settings.soundEnabled = soundToggle.checked;
            saveSettings();
        });

        musicToggle.addEventListener('change', () => {
            gameState.settings.musicEnabled = musicToggle.checked;
            saveSettings();
        });

        hintsToggle.addEventListener('change', () => {
            gameState.settings.showHints = hintsToggle.checked;
            saveSettings();
            updateHintNumbers();
        });
    }
}

// Show how to play panel
function showHowToPlay() {
    mainMenu.classList.add('hidden');
    settingsPanel.classList.add('hidden');
    howToPlayPanel.classList.remove('hidden');
    gameContainer.classList.add('hidden');
}

// Start game
function startGame() {
    mainMenu.classList.add('hidden');
    document.getElementById('category-panel').classList.remove('hidden');
}

// Update hint numbers visibility
function updateHintNumbers() {
    const hintNumbers = document.querySelectorAll('.hint-number');
    hintNumbers.forEach(hint => {
        hint.style.display = gameState.settings.showHints ? 'block' : 'none';
    });
}

// Load streaks from localStorage
function loadStreaks() {
    gameState.currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
    gameState.bestStreak = parseInt(localStorage.getItem('bestStreak')) || 0;
    updateStreakDisplay();
}

// Save streaks to localStorage
function saveStreaks() {
    localStorage.setItem('currentStreak', gameState.currentStreak);
    localStorage.setItem('bestStreak', gameState.bestStreak);
    updateStreakDisplay();
}

// Update streak display
function updateStreakDisplay() {
    currentStreakElement.textContent = gameState.currentStreak;
    bestStreakElement.textContent = gameState.bestStreak;
}

// Setup hint button
function setupHintButton() {
    hintButton.addEventListener('click', useHint);
    updateHintButton();
}

// Update hint button state
function updateHintButton() {
    hintButton.disabled = gameState.hintsRemaining === 0 || gameState.isGameOver;
    hintButton.querySelector('.hint-count').textContent = `(${gameState.hintsRemaining})`;
}

// Use hint
function useHint() {
    if (gameState.hintsRemaining === 0 || gameState.isGameOver) return;

    // Find an unrevealed letter
    const boxes = document.querySelectorAll('.quote-box');
    const unrevealedBoxes = Array.from(boxes).filter(box => !box.textContent || box.textContent.includes('_'));
    
    if (unrevealedBoxes.length > 0) {
        const randomBox = unrevealedBoxes[Math.floor(Math.random() * unrevealedBoxes.length)];
        const letter = randomBox.dataset.letter;
        
        // Reveal the letter
        revealLetter(letter);
        if (gameState.settings.soundEnabled) {
            SoundManager.play('hint');
        }
        
        // Update hint count
        gameState.hintsRemaining--;
        updateHintButton();
        
        // Check win condition
        checkWinCondition();
    }
}

// Reset game state
function resetGame() {
    // Reset game state
    gameState.guessedLetters.clear();
    gameState.attempts = 0;
    gameState.isGameOver = false;
    gameState.letterHints.clear();
    gameState.hintsRemaining = 3;
    
    // Select new random quote
    selectNewQuote();
    
    // Reset UI
    generateLetterHints();
    createQuoteBoxes();
    resetKeyboard();
    updateHintButton();
    updateMessage('New game! Guess the quote!', '');
}

// Select a new quote that hasn't been used recently
function selectNewQuote() {
    let availableQuotes = gameState.quotes.filter(quote => !gameState.usedQuotes.has(quote.text));
    
    // If all quotes have been used, reset the used quotes set
    if (availableQuotes.length === 0) {
        gameState.usedQuotes.clear();
        availableQuotes = gameState.quotes;
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    gameState.currentQuote = availableQuotes[randomIndex].text;
    gameState.currentAuthor = availableQuotes[randomIndex].author;
    gameState.currentMeaning = availableQuotes[randomIndex].meaning;
    gameState.usedQuotes.add(gameState.currentQuote);
}

// Generate unique hint numbers for each unique letter
function generateLetterHints() {
    // Get all unique letters from the quote, sorted alphabetically
    const uniqueLetters = [...new Set(gameState.currentQuote.replace(/[^A-Z]/g, ''))].sort();
    
    // Assign numbers based on letter frequency in the quote
    const letterFrequency = new Map();
    gameState.currentQuote.replace(/[^A-Z]/g, '').split('').forEach(letter => {
        letterFrequency.set(letter, (letterFrequency.get(letter) || 0) + 1);
    });
    
    // Sort letters by frequency (most frequent first) and then alphabetically
    uniqueLetters.sort((a, b) => {
        const freqA = letterFrequency.get(a);
        const freqB = letterFrequency.get(b);
        return freqB - freqA || a.localeCompare(b);
    });
    
    // Assign numbers starting from 1
    uniqueLetters.forEach((letter, index) => {
        gameState.letterHints.set(letter, index + 1);
    });
}

// Create quote boxes
function createQuoteBoxes() {
    quoteBoxes.innerHTML = '';
    
    // Get all letters from the quote (excluding spaces and punctuation)
    const letters = gameState.currentQuote.split('').filter(char => /[A-Z]/.test(char));
    
    // Calculate how many letters to reveal initially (about 20% of total letters)
    const totalLetters = letters.length;
    const lettersToReveal = Math.max(1, Math.floor(totalLetters * 0.2));
    
    // Create a set of random indices to reveal
    const revealIndices = new Set();
    while (revealIndices.size < lettersToReveal) {
        const randomIndex = Math.floor(Math.random() * totalLetters);
        revealIndices.add(randomIndex);
    }
    
    // Keep track of the current letter index
    let letterIndex = 0;
    
    gameState.currentQuote.split('').forEach(char => {
        if (char === ' ') {
            const space = document.createElement('div');
            space.className = 'word-space';
            quoteBoxes.appendChild(space);
        } else if (/[^A-Z]/.test(char)) {
            // Handle punctuation
            const punctuation = document.createElement('span');
            punctuation.className = 'punctuation';
            punctuation.textContent = char;
            quoteBoxes.appendChild(punctuation);
        } else {
            const box = document.createElement('div');
            box.className = 'quote-box';
            box.dataset.letter = char;
            
            // Add hint number
            const hintNumber = document.createElement('span');
            hintNumber.className = 'hint-number';
            hintNumber.textContent = gameState.letterHints.get(char);
            hintNumber.style.display = gameState.settings.showHints ? 'block' : 'none';
            box.appendChild(hintNumber);
            
            // If this letter should be revealed initially
            if (revealIndices.has(letterIndex)) {
                const letterSpan = document.createElement('span');
                letterSpan.textContent = char;
                box.appendChild(letterSpan);
                // Add this letter to guessed letters so it can't be guessed again
                gameState.guessedLetters.add(char);
            } else {
                // Add underscore placeholder
                const underscore = document.createElement('span');
                underscore.textContent = '_';
                box.appendChild(underscore);
            }
            
            quoteBoxes.appendChild(box);
            letterIndex++;
        }
    });

    // Update quote attribution
    quoteAttribution.textContent = `- ${gameState.currentAuthor}`;
}

// Create keyboard
function createKeyboard() {
    keyboard.innerHTML = '';
    
    // QWERTY keyboard layout
    const keyboardLayout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];
    
    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(letter => {
            const button = document.createElement('button');
            button.className = 'key-btn';
            button.textContent = letter;
            button.addEventListener('click', () => handleLetterGuess(letter));
            rowDiv.appendChild(button);
        });
        
        keyboard.appendChild(rowDiv);
    });
}

// Reset keyboard
function resetKeyboard() {
    const buttons = document.querySelectorAll('.key-btn');
    buttons.forEach(button => {
        button.className = 'key-btn';
        button.disabled = false;
    });
}

// Handle letter guess
function handleLetterGuess(letter) {
    if (gameState.guessedLetters.has(letter) || gameState.isGameOver) return;
    
    gameState.guessedLetters.add(letter);
    const button = Array.from(keyboard.querySelectorAll('.key-btn')).find(btn => btn.textContent === letter);
    
    const isCorrect = gameState.currentQuote.includes(letter);
    if (isCorrect) {
        button.classList.add('correct');
        revealLetter(letter);
        if (gameState.settings.soundEnabled) {
            SoundManager.play('correct');
        }
        updateMessage('Good guess! Keep going!', 'success');
        checkWinCondition();
    } else {
        button.classList.add('incorrect');
        gameState.attempts++;
        if (gameState.settings.soundEnabled) {
            SoundManager.play('incorrect');
        }
        updateMessage(`Wrong guess! ${gameState.maxAttempts - gameState.attempts} attempts remaining.`, 'error');
        
        if (gameState.attempts >= gameState.maxAttempts) {
            endGame(false);
        }
    }
}

// Reveal letter in quote boxes
function revealLetter(letter) {
    const boxes = document.querySelectorAll('.quote-box');
    boxes.forEach(box => {
        if (box.dataset.letter === letter) {
            // Remove underscore and show letter
            box.innerHTML = '';
            const hintNumber = document.createElement('span');
            hintNumber.className = 'hint-number';
            hintNumber.textContent = gameState.letterHints.get(letter);
            hintNumber.style.display = gameState.settings.showHints ? 'block' : 'none';
            box.appendChild(hintNumber);
            
            const letterSpan = document.createElement('span');
            letterSpan.textContent = letter;
            box.appendChild(letterSpan);
        }
    });
}

// Check if player has won
function checkWinCondition() {
    const boxes = document.querySelectorAll('.quote-box');
    const allRevealed = Array.from(boxes).every(box => box.textContent && !box.textContent.includes('_'));
    if (allRevealed) {
        endGame(true);
    }
}

// End game
function endGame(isWin) {
    gameState.isGameOver = true;
    
    // Show quote meaning
    const meaningElementHTML = `
        <div class="quote-meaning">
            <h3 class="text-center mb-2">Meaning:</h3>
            <p class="text-center">${gameState.currentMeaning}</p>
        </div>
    `;
    
    if (isWin) {
        gameState.currentStreak++;
        if (gameState.currentStreak > gameState.bestStreak) {
            gameState.bestStreak = gameState.currentStreak;
        }
        saveStreaks();
        
        quoteBoxes.classList.add('win-animation');
        if (gameState.settings.soundEnabled) {
            SoundManager.play('win');
        }
        // Keep the success message on screen briefly
        updateMessage('Congratulations! You won! 🎉', 'success');
        
        // Add a slight delay before showing SweetAlert for win
        setTimeout(() => {
            // Clear the message area before showing SweetAlert
            updateMessage('');
            Swal.fire({
                title: 'You Won!',
                html: `Congratulations! You guessed the quote!<br><br>
                The quote was:<br><br><strong>${gameState.currentQuote}</strong><br>
                ${gameState.currentAuthor ? `<strong>- ${gameState.currentAuthor}</strong>` : ''}
                <br>
                ${meaningElementHTML}<br><br>Would you like to play again?`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, play again!',
                cancelButtonText: 'No, thanks',
                customClass: {
                    popup: 'swal2-dark',
                    title: 'swal2-title-custom',
                    htmlContainer: 'swal2-html-container-custom'
                }
            }).then((result) => {
                quoteBoxes.classList.remove('win-animation');
                if (result.isConfirmed) {
                    startNewGame();
                } else {
                    showMainMenu();
                }
            });
        }, 2000);
    } else {
        gameState.currentStreak = 0;
        saveStreaks();
        
        quoteBoxes.classList.add('lose-animation');
        if (gameState.settings.soundEnabled) {
            SoundManager.play('lose');
        }
        // Keep the error message on screen briefly
        updateMessage('Game Over! Try Again! 😢', 'error');
        revealAllLetters();
        
        // Add a slight delay before showing SweetAlert for loss
        setTimeout(() => {
            // Clear the message area before showing SweetAlert
            updateMessage('');
            Swal.fire({
                title: 'Game Over!',
                html: `You ran out of attempts.<br><br>
                The quote was:<br><br><strong>${gameState.currentQuote}</strong><br>
                ${gameState.currentAuthor ? `<strong>- ${gameState.currentAuthor}</strong>` : ''}
                <br>
                ${meaningElementHTML}<br><br>Would you like to try another quote?`,
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, try again!',
                cancelButtonText: 'No, thanks',
                customClass: {
                    popup: 'swal2-dark',
                    title: 'swal2-title-custom',
                    htmlContainer: 'swal2-html-container-custom'
                }
            }).then((result) => {
                quoteBoxes.classList.remove('lose-animation');
                if (result.isConfirmed) {
                    startNewGame();
                } else {
                    showMainMenu();
                }
            });
        }, 2000);
    }
    
    // Disable all keyboard buttons regardless of win/loss
    const buttons = document.querySelectorAll('.key-btn');
    buttons.forEach(button => {
        button.disabled = true;
        if (!button.classList.contains('correct') && !button.classList.contains('incorrect')) {
            button.classList.add('incorrect'); // Mark unused buttons as incorrect on game over
        }
    });
}

// Reveal all letters
function revealAllLetters() {
    const boxes = document.querySelectorAll('.quote-box');
    boxes.forEach(box => {
        const letter = box.dataset.letter;
        box.innerHTML = '';
        const hintNumber = document.createElement('span');
        hintNumber.className = 'hint-number';
        hintNumber.textContent = gameState.letterHints.get(letter);
        hintNumber.style.display = gameState.settings.showHints ? 'block' : 'none';
        box.appendChild(hintNumber);
        
        const letterSpan = document.createElement('span');
        letterSpan.textContent = letter;
        box.appendChild(letterSpan);
    });
}

// Update message
function updateMessage(message, type = '') {
    messageArea.textContent = message;
    messageArea.className = 'text-center text-xl font-semibold mb-8 min-h-[2rem]';
    if (type === 'success') {
        messageArea.classList.add('message-success');
    } else if (type === 'error') {
        messageArea.classList.add('message-error');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);

// Modify your start game button click handler
document.getElementById('start-game').addEventListener('click', () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('category-panel').classList.remove('hidden');
});

// Add back to main menu handler
document.getElementById('back-to-main').addEventListener('click', () => {
    document.getElementById('category-panel').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
});

// Add category selection handlers
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        currentCategory = button.dataset.category;
        document.getElementById('category-panel').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        startNewGame();
    });
});

// Modify your startNewGame function to use the selected category
function startNewGame() {
    if (!currentCategory) return;
    
    let selectedQuotes;
    if (currentCategory === 'random') {
        // Get all quotes from all categories
        selectedQuotes = Object.values(quotesByCategory).flat();
    } else {
        selectedQuotes = quotesByCategory[currentCategory];
    }
    
    const randomIndex = Math.floor(Math.random() * selectedQuotes.length);
    const selectedQuote = selectedQuotes[randomIndex];
    
    gameState.currentQuote = selectedQuote.quote.toUpperCase();
    gameState.currentAuthor = selectedQuote.author;
    gameState.currentMeaning = selectedQuote.meaning;
    
    // Reset game state
    gameState.guessedLetters.clear();
    gameState.attempts = 0;
    gameState.isGameOver = false;
    gameState.letterHints.clear();
    gameState.hintsRemaining = 3;
    
    // Reset UI
    generateLetterHints();
    createQuoteBoxes();
    createKeyboard(); // Make sure to create the keyboard
    setupHintButton();
    updateHintButton();
    updateMessage('New game! Guess the quote!', '');
} 