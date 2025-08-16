class WordleHKU {
    // CAMBIO: El constructor ahora recibe la palabra y la pista como argumentos.
    constructor(word, hint) {
        this.currentWord = word.toUpperCase();
        this.currentHint = hint; // Nueva propiedad para guardar la pista.
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.hintUsed = false;

        // Sistema de puntuación
        this.currentPoints = 1000;
        this.startTime = Date.now();
        this.gameTimer = null;
        this.lastMinuteDeduction = 0;

        // CAMBIO: Las listas de palabras y categorías se han eliminado de aquí.

        // El resto de la inicialización se mantiene.
        this.loadStats();
        this.createBoard();
        this.createKeyboard();
        this.setupEventListeners();
        this.startTimer();
        
        console.log('Palabra del día:', this.currentWord); // Para testing
    }

    // CAMBIO: El método initGame() ya no es necesario y se ha eliminado.
    // La palabra se determina antes de crear la instancia de la clase.

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
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'word-row';
            for (let j = 0; j < 5; j++) {
                const box = document.createElement('div');
                box.className = 'letter-box';
                box.id = `box-${i}-${j}`;
                row.appendChild(box);
            }
            board.appendChild(row);
        }
    }

    createKeyboard() {
        const keyboard = document.getElementById('keyboard');
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BORRAR']
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
                if (key === 'ENTER' || key === 'BORRAR') {
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
                this.handleKeyPress('BORRAR');
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
        } else if (key === 'BORRAR') {
            this.deleteLetter();
        } else if (this.currentCol < 5) {
            this.addLetter(key);
        }
    }

    addLetter(letter) {
        if (this.currentCol < 5) {
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

    submitGuess() {
        if (this.currentCol !== 5) {
            this.showMessage('¡Completa la palabra!');
            return;
        }
        const guess = this.getCurrentGuess();
        this.checkGuess(guess);
        if (guess === this.currentWord) {
            this.gameOver = true;
            this.showMessage('¡Felicitaciones! 🎉');
            this.updateStats(true);
        } else if (this.currentRow === 5) {
            this.gameOver = true;
            this.showMessage(`La palabra era: ${this.currentWord}`);
            this.updateStats(false);
        } else {
            this.currentRow++;
            this.currentCol = 0;
        }
    }

    getCurrentGuess() {
        let guess = '';
        for (let i = 0; i < 5; i++) {
            guess += document.getElementById(`box-${this.currentRow}-${i}`).textContent;
        }
        return guess;
    }

    checkGuess(guess) {
        const wordArray = this.currentWord.split('');
        const guessArray = guess.split('');
        const result = new Array(5).fill('absent');
        for (let i = 0; i < 5; i++) {
            if (guessArray[i] === wordArray[i]) {
                result[i] = 'correct';
                wordArray[i] = null;
            }
        }
        for (let i = 0; i < 5; i++) {
            if (result[i] !== 'correct' && wordArray.includes(guessArray[i])) {
                result[i] = 'present';
                wordArray[wordArray.indexOf(guessArray[i])] = null;
            }
        }
        for (let i = 0; i < 5; i++) {
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
        // CAMBIO: Usa la propiedad this.currentHint directamente.
        hintDisplay.textContent = `💡 Pista: ${this.currentHint}`;
        hintDisplay.style.display = 'block';
        hintBtn.disabled = true;
        hintBtn.textContent = 'Pista usada';
        this.hintUsed = true;
        this.currentPoints = Math.max(100, this.currentPoints - 100);
        this.updateScore();
    }

    showMessage(text) {
        const message = document.getElementById('message');
        message.textContent = text;
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 2000);
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
            throw new Error('No se pudo cargar el archivo de palabras (palabras.json).');
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
            document.querySelector('.game-container').innerHTML = '<h1>No hay palabra programada para hoy.</h1>';
            console.error('No se encontró una palabra para la fecha:', todayString);
        }
    } catch (error) {
        console.error('Error al inicializar el juego:', error);
        document.querySelector('.game-container').innerHTML = '<h1>Error al cargar el juego.</h1>';
    }
}

// CAMBIO: El listener ahora llama a la nueva función de inicialización.
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
