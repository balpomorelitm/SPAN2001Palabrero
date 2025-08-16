class WordleHKU {
    constructor(word, hint, isArchiveMode = false, dateString = null) {
        this.currentWord = word.toUpperCase();
        this.currentHint = hint;
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.hintUsed = false;
        this.isArchiveMode = isArchiveMode;

        // Determinar fecha y si ya se completó
        if (dateString) {
            this.dateString = dateString;
            this.alreadyCompleted = localStorage.getItem(`wordle-completed-${dateString}`) === 'true';
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            this.dateString = `${year}-${month}-${day}`;
            this.alreadyCompleted = localStorage.getItem(`wordle-completed-${this.dateString}`) === 'true';
        }

        // Sistema de puntuación
        this.currentPoints = 1000;
        this.startTime = Date.now();
        this.gameTimer = null;
        this.lastMinuteDeduction = 0;

        if (this.isArchiveMode) {
            this.showMessage('Archive mode - No points earned');
        }

        // Mostrar mensaje si ya se completó hoy
        if (this.alreadyCompleted && !this.isArchiveMode) {
            this.showMessage('Already completed today - No points will be earned', true);
        }

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

    }

    startTimer() {
        if (this.isArchiveMode || this.alreadyCompleted) {
            this.gameTimer = setInterval(() => {
                this.updateTimer();
            }, 1000);
        } else {
            this.gameTimer = setInterval(() => {
                this.updateTimer();
                this.updateScore();
            }, 1000);
        }
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
        if (this.gameOver || this.isArchiveMode || this.alreadyCompleted) return;
        
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

   async isValidSpanishWord(word) {
    const wordLower = word.toLowerCase();
    
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
                
                return isValidTranslation;
            }
        }
        
        return false;
        
    } catch (error) {
        // Si hay error de red, permitir la palabra para no bloquear el juego
        return true;
    }
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
        // Solo deducir puntos si no es modo archivo y no se completó previamente
        if (!this.isArchiveMode && !this.alreadyCompleted) {
            this.currentPoints = Math.max(100, this.currentPoints - 100);
            this.updateScore();
        }
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

        if (this.isArchiveMode) return; // No actualizar stats en modo archivo

        // Verificar si ya se completó esta fecha
        const alreadyCompleted = localStorage.getItem(`wordle-completed-${this.dateString}`);

        // Si ya se completó y se vuelve a ganar, mostrar mensaje y salir
        if (alreadyCompleted && won) {
            this.showMessage('Well done, but no points this time!');
            return;
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
            // Marcar como completado
            localStorage.setItem(`wordle-completed-${this.dateString}`, 'true');
            this.alreadyCompleted = true;
        } else {
            stats.currentStreak = 0;
        }

        localStorage.setItem('wordleHKU-stats', JSON.stringify(stats));
        this.loadStats();
    }
}

let currentGame = null;
let wordsData = null;
let currentCalendarDate = new Date();

class Calendar {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const calendarBtn = document.getElementById('calendar-btn');
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => this.openCalendar());
        }

        const closeBtn = document.getElementById('calendar-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCalendar());
        }

        const prevBtn = document.getElementById('prev-month');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changeMonth(-1));
        }

        const nextBtn = document.getElementById('next-month');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changeMonth(1));
        }
    }

    openCalendar() {
        const modal = document.getElementById('calendar-modal');
        if (modal) {
            modal.style.display = 'block';
            this.renderCalendar();
        }
    }

    closeCalendar() {
        const modal = document.getElementById('calendar-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    changeMonth(direction) {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
        this.renderCalendar();
    }

    renderCalendar() {
        const daysContainer = document.getElementById('calendar-grid');
        const header = document.getElementById('calendar-month-year');
        if (!daysContainer || !header || !wordsData) return;

        daysContainer.innerHTML = '';

        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const firstDayIndex = firstDay.getDay();
        const currentDate = new Date(firstDay);
        currentDate.setDate(currentDate.getDate() - firstDayIndex);

        const today = new Date();
        const gameStartDate = new Date('2025-08-15');

        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';

            const dateString = this.formatDate(currentDate);
            dayElement.textContent = currentDate.getDate();

            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = this.isSameDay(currentDate, today);
            const isFuture = currentDate > today;
            const isBeforeGameStart = currentDate < gameStartDate;
            const hasWord = wordsData.words.some(w => w.date === dateString);
            const completed = localStorage.getItem(`wordle-completed-${dateString}`) === 'true';

            if (!isCurrentMonth) {
                dayElement.style.opacity = '0.3';
            }

            if (isToday) {
                dayElement.classList.add('today');
            }

            if (isFuture || isBeforeGameStart) {
                dayElement.classList.add(isFuture ? 'future' : 'unavailable');
            } else if (hasWord) {
                dayElement.classList.add(completed ? 'completed' : 'available');

                if (!isFuture && !isBeforeGameStart) {
                    dayElement.addEventListener('click', () => {
                        this.selectDate(dateString);
                    });
                }
            } else {
                dayElement.classList.add('unavailable');
            }

            daysContainer.appendChild(dayElement);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        header.textContent = `${monthNames[month]} ${year}`;
    }

    async selectDate(dateString) {
        this.closeCalendar();

        const wordData = wordsData.words.find(w => w.date === dateString);
        if (wordData) {
            const today = new Date();
            const selectedDate = new Date(dateString);
            const isToday = this.isSameDay(selectedDate, today);

            if (currentGame && currentGame.gameTimer) {
                clearInterval(currentGame.gameTimer);
            }

            currentGame = new WordleHKU(wordData.word, wordData.hint, !isToday, dateString);
        }
    }

    formatDate(date) {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }
}

async function initializeGame() {
    try {
        const response = await fetch('palabras.json');
        if (!response.ok) {
            throw new Error('Could not load words file (palabras.json).');
        }
        
        wordsData = await response.json();
        
        // Obtener la fecha de hoy en formato AAAA-MM-DD
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        
        // Buscar la palabra correspondiente a la fecha de hoy
        const wordData = wordsData.words.find(w => w.date === todayString);
        
        if (wordData && wordData.word) {
            // Si se encuentra la palabra para hoy, se crea una nueva instancia del juego
            currentGame = new WordleHKU(wordData.word, wordData.hint, false, todayString);
        } else {
            // Mensaje si no hay palabra asignada para el día
            document.querySelector('.game-container').innerHTML = '<h1>No word scheduled for today.</h1>';
            console.error('No word found for date:', todayString);
        }
        
        // Inicializar calendario
        new Calendar();
        
    } catch (error) {
        console.error('Error initializing game:', error);
        document.querySelector('.game-container').innerHTML = '<h1>Error loading game.</h1>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
