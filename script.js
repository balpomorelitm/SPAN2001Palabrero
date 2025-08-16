class WordleHKU {
    constructor(word, hint) {
        this.currentWord = word.toUpperCase();
        this.currentHint = hint;
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.hintUsed = false;

        // Sistema de puntuación
        this.currentPoints = 1000;
        this.startTime = Date.now();
        this.gameTimer = null;
        this.lastMinuteDeduction = 0;
        
        // Determinar número de intentos según longitud
        const wordLength = this.currentWord.length;
        if (wordLength === 3) {
            this.maxAttempts = 8;
        } else if (wordLength === 4) {
            this.maxAttempts = 7;
        } else {
            this.maxAttempts = 6; // 5, 6, 7, 8 letras
        }

        this.loadStats();
        this.createBoard();
        this.createKeyboard();
        this.setupEventListeners();
        this.startTimer();
        
        console.log(`Today's word: ${this.currentWord} (${wordLength} letters, ${this.maxAttempts} attempts)`);
    }

    startTimer() {
        this.gameTimer = setInterval(() => {
            this.updateTimer();
            this.updateScore();
        }, 1000);
    }

    updateTimer() {
        if (this.gameOver) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('game-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateScore() {
        if (this.gameOver) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        
        if (minutes > this.lastMinuteDeduction) {
            const minutesToDeduct = minutes - this.lastMinuteDeduction;
            this.currentPoints = Math.max(100, this.currentPoints - (minutesToDeduct * 100));
            this.lastMinuteDeduction = minutes;
        }
        
        const timePoints = Math.max(0, 400 - Math.floor(elapsed / 10) * 10);
        const basePoints = this.hintUsed ? 500 : 600;
        this.currentPoints = Math.max(100, basePoints + timePoints);
        
        document.getElementById('current-points').textContent = this.currentPoints;
    }

    createBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        const wordLength = this.currentWord.length;
        
        // Crear filas según el número de intentos
        for (let i = 0; i < this.maxAttempts; i++) {
            const row = document.createElement('div');
            row.className = 'word-row';
            row.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;
            
            // Crear columnas según la longitud de la palabra
            for (let j = 0; j < wordLength; j++) {
                const box = document.createElement('div');
                box.className = 'letter-box';
                box.id = `box-${i}-${j}`;
                row.appendChild(box);
            }
            
            board.appendChild(row);
        }
        
        // Actualizar CSS del grid para adaptarse
        board.style.gridTemplateRows = `repeat(${this.maxAttempts}, 1fr)`;
    }

    createKeyboard() {
        const keyboard = document.getElementById('keyboard');
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
        ];

        keyboard.innerHTML = '';
        rows.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyElement = document.createElement('button');
                keyElement.className = 'key';
                keyElement.textContent = key;
                keyElement.id = `key-${key}`;
                
                if (key === 'ENTER' || key === 'DELETE') {
                    keyElement.classList.add('wide');
                }
                
                keyElement.addEventListener('click', () => this.handleKeyPress(key));
                rowElement.appendChild(keyElement);
            });
            
            keyboard.appendChild(rowElement);
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            if (key === 'ENTER') {
                this.handleKeyPress('ENTER');
            } else if (key === 'BACKSPACE') {
                this.handleKeyPress('DELETE');
            } else if (/^[A-ZÑ]$/.test(key)) {
                this.handleKeyPress(key);
            }
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
    }

    handleKeyPress(key) {
        if (this.gameOver) return;

        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'DELETE') {
            this.deleteLetter();
        } else if (this.currentCol < this.currentWord.length) {
            this.addLetter(key);
        }
    }

    addLetter(letter) {
        const wordLength = this.currentWord.length;
        if (this.currentCol < wordLength) {
            const box = document.getElementById(`box-${this.currentRow}-${this.currentCol}`);
            box.textContent = letter;
            box.classList.add('filled');
            this.currentCol++;
        }
    }

    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            const box = document.getElementById(`box-${this.currentRow}-${this.currentCol}`);
            box.textContent = '';
            box.classList.remove('filled');
        }
    }

    // FUNCIÓN SUBMITGUESS CORREGIDA Y COMPLETA
    async submitGuess() {
        const wordLength = this.currentWord.length;
        if (this.currentCol !== wordLength) {
            this.showMessage('Complete the word!');
            return;
        }

        const guess = this.getCurrentGuess();

        // Mostrar mensaje de verificación
        this.showMessage('Checking word...', false);
        
        const isValid = await this.isValidSpanishWord(guess);
        
        // Ocultar mensaje de verificación
        document.getElementById('message').style.display = 'none';
        
        if (!isValid) {
            this.showMessage('Word not found in dictionary');
            // Añadir animación de "temblor" a la fila actual
            const currentRowElement = document.querySelector(`#game-board .word-row:nth-child(${this.currentRow + 1})`);
            if (currentRowElement) {
                currentRowElement.classList.add('shake');
                setTimeout(() => {
                    currentRowElement.classList.remove('shake');
                }, 500);
            }
            return; // No cuenta como intento
        }

        // El resto de la función sigue igual
        this.checkGuess(guess);
        
        if (guess === this.currentWord) {
            this.gameOver = true;
            this.showMessage('Congratulations! 🎉');
            this.updateStats(true);
        } else if (this.currentRow === this.maxAttempts - 1) {
            this.gameOver = true;
            this.showMessage(`The word was: ${this.currentWord}`);
            this.updateStats(false);
        } else {
            this.currentRow++;
            this.currentCol = 0;
        }
    }

    // FUNCIÓN DE VALIDACIÓN WIKTIONARY + MYMEMORY
    async isValidSpanishWord(word) {
        const wordLower = word.toLowerCase();
        
        console.log(`🔍 Checking word: "${word}"`);
        
        // OPCIÓN 1: Intentar con Wiktionary
        try {
            const wiktionaryUrl = `https://es.wiktionary.org/api/rest_v1/page/summary/${encodeURIComponent(wordLower)}`;
            const wiktionaryResponse = await fetch(wiktionaryUrl);
            
            if (wiktionaryResponse.ok) {
                const wiktionaryData = await wiktionaryResponse.json();
                
                if (wiktionaryData.type === 'standard' && 
                    !wiktionaryData.title.toLowerCase().includes('no existe') &&
                    !wiktionaryData.title.toLowerCase().includes('not found')) {
                    console.log(`✅ Wiktionary: "${word}" found`);
                    return true;
                }
            }
            
            console.log(`⚠️ Wiktionary: "${word}" not found, trying MyMemory...`);
            
        } catch (error) {
            console.log(`❌ Wiktionary error: ${error.message}`);
        }
        
        // OPCIÓN 2: Respaldo con MyMemory Translation
        try {
            const mymemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(wordLower)}&langpair=es|en`;
            const mymemoryResponse = await fetch(mymemoryUrl);
            
            if (mymemoryResponse.ok) {
                const mymemoryData = await mymemoryResponse.json();
                
                if (mymemoryData.responseStatus === 200) {
                    const translation = mymemoryData.responseData.translatedText.toLowerCase();
                    
                    const isValidTranslation = translation !== wordLower && 
                                             translation.length > 0 &&
                                             !translation.includes('no found') &&
                                             !translation.includes('not found') &&
                                             !translation.includes('error') &&
                                             !translation.includes('invalid');
                    
                    if (isValidTranslation) {
                        console.log(`✅ MyMemory: "${word}" validated (translation: "${translation}")`);
                        return true;
                    } else {
                        console.log(`❌ MyMemory: "${word}" not valid`);
                        return false;
                    }
                }
            }
        } catch (error) {
            console.log(`❌ MyMemory error: ${error.message}`);
        }
        
        // FALLBACK: Si ambas APIs fallan, permitir la palabra
        console.log(`⚠️ Both APIs failed for "${word}", allowing by default`);
        return true;
    }

    getCurrentGuess() {
        let guess = '';
        const wordLength = this.currentWord.length;
        for (let i = 0; i < wordLength; i++) {
            const box = document.getElementById(`box-${this.currentRow}-${i}`);
            guess += box.textContent;
        }
        return guess;
    }

    checkGuess(guess) {
        const wordArray = this.currentWord.split('');
        const guessArray = guess.split('');
        const wordLength = this.currentWord.length;
        const result = new Array(wordLength).fill('absent');

        // Primera pasada: letras correctas
        for (let i = 0; i < wordLength; i++) {
            if (guessArray[i] === wordArray[i]) {
                result[i] = 'correct';
                wordArray[i] = null;
            }
        }

        // Segunda pasada: letras presentes pero en posición incorrecta
        for (let i = 0; i < wordLength; i++) {
            if (result[i] !== 'correct' && wordArray.includes(guessArray[i])) {
                result[i] = 'present';
                wordArray[wordArray.indexOf(guessArray[i])] = null;
            }
        }

        // Aplicar estilos
        for (let i = 0; i < wordLength; i++) {
            const box = document.getElementById(`box-${this.currentRow}-${i}`);
            const key = document.getElementById(`key-${guessArray[i]}`);
            
            setTimeout(() => {
                box.classList.add(result[i]);
                this.updateKeyboardKey(key, result[i]);
            }, i * 100);
        }
    }

    updateKeyboardKey(key, status) {
        if (!key) return;
        
        if (status === 'correct') {
            key.className = 'key correct';
        } else if (status === 'present' && !key.classList.contains('correct')) {
            key.className = 'key present';
        } else if (status === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
            key.className = 'key absent';
        }
    }

    showHint() {
        if (this.hintUsed) return;
        
        const hintDisplay = document.getElementById('hint-display');
        const hintBtn = document.getElementById('hint-btn');
        
        hintDisplay.textContent = `💡 Hint: ${this.currentHint}`;
        hintDisplay.style.display = 'block';
        hintBtn.disabled = true;
        hintBtn.textContent = 'Hint used';
        this.hintUsed = true;
        
        this.currentPoints = Math.max(100, this.currentPoints - 100);
        this.updateScore();
    }

    showMessage(text, autoHide = true) {
        const message = document.getElementById('message');
        message.textContent = text;
        message.style.display = 'block';
        
        if (autoHide) {
            setTimeout(() => {
                message.style.display = 'none';
            }, 2000);
        }
    }

    loadStats() {
        const stats = JSON.parse(localStorage.getItem('wordleHKU-stats')) || {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            totalPoints: 0
        };

        document.getElementById('games-played').textContent = stats.gamesPlayed;
        document.getElementById('win-percentage').textContent = 
            stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) + '%' : '0%';
        document.getElementById('current-streak').textContent = stats.currentStreak;
        document.getElementById('total-points').textContent = (stats.totalPoints || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    updateStats(won) {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        const stats = JSON.parse(localStorage.getItem('wordleHKU-stats')) || {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            totalPoints: 0
        };

        stats.gamesPlayed++;
        if (won) {
            stats.gamesWon++;
            stats.currentStreak++;
            stats.totalPoints += this.currentPoints;
        } else {
            stats.currentStreak = 0;
        }

        localStorage.setItem('wordleHKU-stats', JSON.stringify(stats));
        this.loadStats();
    }
}

async function initializeGame() {
    try {
        const response = await fetch('palabras.json');
        if (!response.ok) {
            throw new Error('Could not load words file (palabras.json).');
        }
        const data = await response.json();

        // Obtener la fecha de hoy en formato AAAA-MM-DD
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        // Buscar la palabra correspondiente a la fecha de hoy
        const wordData = data.words.find(w => w.date === todayString);

        if (wordData && wordData.word) {
            // Si se encuentra la palabra para hoy, se crea una nueva instancia del juego
            new WordleHKU(wordData.word, wordData.hint);
        } else {
            // Mensaje si no hay palabra asignada para el día
            document.querySelector('.game-container').innerHTML = '<h1>No word scheduled for today.</h1>';
            console.error('No word found for date:', todayString);
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        document.querySelector('.game-container').innerHTML = '<h1>Error loading game.</h1>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
