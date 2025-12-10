// Calculator Challenge - Math game for third grade
class CalculatorChallenge {
    constructor(container, options = {}) {
        this.container = container;
        this.maxTarget = options.maxTarget || 2500;
        
        // Game state
        this.currentProblem = null;
        this.userInput = '';
        this.selectedOperation = null; // Operation is now fixed in the problem, not selected by user
        this.score = 0;
        this.streak = 0;
        this.problemsSolved = 0;
        
        // Visual feedback
        this.flashEffect = null; // { type: 'correct' | 'wrong', alpha: 1.0 }
        
        this.setupGame();
        this.generateNewProblem();
        this.updateDisplay();
    }

    setupGame() {
        this.container.innerHTML = `
            <div class="calc-fullscreen-container">
                <!-- HUD overlayed on top -->
                <div class="calc-hud-overlay">
                    <div class="calc-stats">
                        <div class="calc-score" id="calcScore">Puntos: 0</div>
                        <div class="calc-streak" id="calcStreak">Racha: 0</div>
                    </div>
                </div>
                
                <!-- Close button -->
                <button class="back-btn-overlay" id="calcCloseBtn" title="Volver">
                    <span class="close-icon">✕</span>
                </button>
                
                <!-- Restart button -->
                <button class="restart-btn-overlay" id="calcRestartBtn" title="Reiniciar juego">
                    <span class="restart-icon">🔄</span>
                </button>
                
                <!-- Flash effect overlay -->
                <div class="calc-flash-overlay" id="calcFlash"></div>
                
                <!-- Main game area -->
                <div class="calc-game-area">
                    <!-- Problem display -->
                    <div class="calc-problem-display">
                        <div class="calc-legend">Ingresa el número que falta para completar la operación</div>
                        <div class="calc-equation">
                            <span class="calc-number" id="calcNum1">0</span>
                            <span class="calc-operator-display" id="calcOperatorDisplay">?</span>
                            <span class="calc-input-display" id="calcInput">???</span>
                            <span class="calc-equals">=</span>
                            <span class="calc-target" id="calcTarget">0</span>
                        </div>
                    </div>
                    
                    <!-- Calculator keypad -->
                    <div class="calc-keypad">
                        <button class="calc-key calc-number-key" data-value="7">7</button>
                        <button class="calc-key calc-number-key" data-value="8">8</button>
                        <button class="calc-key calc-number-key" data-value="9">9</button>
                        <button class="calc-key calc-clear-all-key" data-value="clear-all">AC</button>
                        
                        <button class="calc-key calc-number-key" data-value="4">4</button>
                        <button class="calc-key calc-number-key" data-value="5">5</button>
                        <button class="calc-key calc-number-key" data-value="6">6</button>
                        <button class="calc-key calc-erase-key" data-value="erase">⌫</button>
                        
                        <button class="calc-key calc-number-key" data-value="1">1</button>
                        <button class="calc-key calc-number-key" data-value="2">2</button>
                        <button class="calc-key calc-number-key" data-value="3">3</button>
                        <button class="calc-key calc-disabled-key" data-value="multiply" disabled>×</button>
                        
                        <button class="calc-key calc-disabled-key" data-value="divide" disabled>÷</button>
                        <button class="calc-key calc-number-key" data-value="0">0</button>
                        <button class="calc-key calc-disabled-key" data-value="dummy1" disabled></button>
                        <button class="calc-key calc-disabled-key" data-value="dummy2" disabled></button>
                        
                        <button class="calc-key calc-submit-key" data-value="submit" style="grid-column: span 4;">=</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Number keys
        const numberKeys = this.container.querySelectorAll('.calc-number-key');
        numberKeys.forEach(key => {
            key.addEventListener('click', () => {
                const value = key.getAttribute('data-value');
                this.handleNumberInput(value);
            });
        });
        
        // Operation keys are removed - operation is fixed in the problem
        
        // Clear all key
        const clearAllKey = this.container.querySelector('.calc-clear-all-key');
        if (clearAllKey) {
            clearAllKey.addEventListener('click', () => {
                this.clearInput();
            });
        }
        
        // Erase key (delete last digit)
        const eraseKey = this.container.querySelector('.calc-erase-key');
        if (eraseKey) {
            eraseKey.addEventListener('click', () => {
                this.eraseLastDigit();
            });
        }
        
        // Submit key
        const submitKey = this.container.querySelector('.calc-submit-key');
        if (submitKey) {
            submitKey.addEventListener('click', () => {
                this.checkAnswer();
            });
        }
        
        // Close button
        const closeBtn = document.getElementById('calcCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.cleanup();
                window.location.href = '../index.html';
            });
        }
        
        // Restart button
        const restartBtn = document.getElementById('calcRestartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                this.handleNumberInput(e.key);
            } else if (e.key === 'Enter') {
                this.checkAnswer();
            } else if (e.key === 'Backspace') {
                this.eraseLastDigit();
            } else if (e.key === 'Delete') {
                this.clearInput();
            }
        });
    }

    generateNewProblem() {
        // Generate a starting number (num1) - multiples of 10
        const num1Tens = this.randomBetween(10, 250); // 100 to 2500
        const num1 = num1Tens * 10;
        
        // Choose operation
        const operator = Math.random() < 0.5 ? '+' : '-';
        
        // We need to find an answer that changes only ONE digit
        // Strategy: Pick a digit position and change only that digit
        
        let answer, target;
        let maxAttempts = 50;
        let attempts = 0;
        
        do {
            // Pick which digit to change (units, tens, hundreds, or thousands)
            const digitPosition = this.randomBetween(1, 4); // 1=tens, 2=hundreds, 3=thousands, 4=ten-thousands
            const digitValue = this.randomBetween(1, 9); // How much to change
            
            // Calculate the answer based on which digit we want to change
            answer = digitValue * Math.pow(10, digitPosition);
            
            if (operator === '+') {
                target = num1 + answer;
            } else {
                target = num1 - answer;
            }
            
            attempts++;
            
            // Check if only one digit changed and values are valid
        } while (!this.onlyOneDigitChanged(num1, target) && attempts < maxAttempts);
        
        // If we couldn't find a valid problem, use a simple fallback
        if (attempts >= maxAttempts) {
            // Fallback: simple single digit change
            answer = 100;
            if (operator === '+') {
                target = num1 + answer;
            } else {
                target = num1 - answer;
            }
        }
        
        // Make sure answer is a multiple of 10
        answer = Math.round(answer / 10) * 10;
        
        this.currentProblem = {
            num1: num1,
            operator: operator,
            target: target,
            answer: answer
        };
    }
    
    onlyOneDigitChanged(num1, target) {
        // Convert numbers to strings, pad with zeros to same length
        const str1 = String(num1).padStart(4, '0');
        const str2 = String(target).padStart(4, '0');
        
        let differencesCount = 0;
        for (let i = 0; i < str1.length; i++) {
            if (str1[i] !== str2[i]) {
                differencesCount++;
            }
        }
        
        // Only one digit should be different
        return differencesCount === 1;
    }
    
    selectOperation(op) {
        // This method is no longer used - operation is fixed
        // Keeping it for backward compatibility but it does nothing
        return;
    }

    handleNumberInput(digit) {
        // Prevent input that's too long
        if (this.userInput.length >= 5) return;
        
        this.userInput += digit;
        this.updateDisplay();
    }

    clearInput() {
        this.userInput = '';
        // Don't clear selectedOperation - it's fixed for the problem
        this.updateDisplay();
    }

    eraseLastDigit() {
        if (this.userInput.length > 0) {
            this.userInput = this.userInput.slice(0, -1);
            this.updateDisplay();
        }
    }

    checkAnswer() {
        if (this.userInput === '') return;
        
        const userAnswer = parseInt(this.userInput);
        
        // Check if the number is correct (operation is already fixed)
        if (userAnswer === this.currentProblem.answer) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    handleCorrectAnswer() {
        this.triggerFlash('correct');
        this.score += 10 + this.streak * 2;
        this.streak++;
        this.problemsSolved++;
        
        // Clear input and generate new problem after a short delay
        setTimeout(() => {
            this.userInput = '';
            // Don't clear selectedOperation - will be set by next problem
            this.generateNewProblem();
            this.updateDisplay();
        }, 600);
        
        this.updateDisplay();
    }

    handleWrongAnswer() {
        this.triggerFlash('wrong');
        this.streak = 0;
        
        // Clear input to try again
        setTimeout(() => {
            this.userInput = '';
            // Don't clear selectedOperation - it stays fixed
            this.updateDisplay();
        }, 600);
        
        this.updateDisplay();
    }

    triggerFlash(type) {
        const flashElement = document.getElementById('calcFlash');
        if (!flashElement) return;
        
        flashElement.className = 'calc-flash-overlay';
        flashElement.classList.add('calc-flash-' + type);
        
        // Trigger animation
        setTimeout(() => {
            flashElement.classList.add('calc-flash-active');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            flashElement.classList.remove('calc-flash-active');
            setTimeout(() => {
                flashElement.className = 'calc-flash-overlay';
            }, 300);
        }, 600);
    }

    updateDisplay() {
        // Update problem display
        const num1El = document.getElementById('calcNum1');
        const operatorDisplayEl = document.getElementById('calcOperatorDisplay');
        const inputEl = document.getElementById('calcInput');
        const targetEl = document.getElementById('calcTarget');
        
        if (num1El) num1El.textContent = this.currentProblem.num1;
        if (operatorDisplayEl) {
            // Show the fixed operation
            operatorDisplayEl.textContent = this.currentProblem.operator;
            operatorDisplayEl.classList.add('calc-input-active');
        }
        if (targetEl) targetEl.textContent = this.currentProblem.target;
        if (inputEl) {
            // Show ??? as placeholder, or user's input as they type
            inputEl.textContent = this.userInput || '???';
            inputEl.classList.toggle('calc-input-active', this.userInput !== '');
        }
        
        // Update score and streak
        const scoreEl = document.getElementById('calcScore');
        const streakEl = document.getElementById('calcStreak');
        
        if (scoreEl) scoreEl.textContent = `Puntos: ${this.score}`;
        if (streakEl) streakEl.textContent = `Racha: ${this.streak}`;
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    restart() {
        this.score = 0;
        this.streak = 0;
        this.problemsSolved = 0;
        this.userInput = '';
        // selectedOperation will be set by generateNewProblem
        this.generateNewProblem();
        this.updateDisplay();
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        // Remove event listeners if needed
    }
}
