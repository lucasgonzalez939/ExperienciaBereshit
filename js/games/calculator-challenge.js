// Calculator Challenge - Math game for third grade
class CalculatorChallenge {
    constructor(container, options = {}) {
        this.container = container;
        this.maxTarget = options.maxTarget || 2500;
        
        // Game state
        this.currentProblem = null;
        this.userInput = '';
        this.selectedOperation = null; // '+' or '-'
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
                        <div class="calc-equation">
                            <span class="calc-number" id="calcNum1">0</span>
                            <span class="calc-operator-display" id="calcOperatorDisplay">?</span>
                            <span class="calc-input-display" id="calcInput">?</span>
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
                        <button class="calc-key calc-operator-key calc-active-op" data-value="+">+</button>
                        
                        <button class="calc-key calc-disabled-key" data-value="multiply" disabled>×</button>
                        <button class="calc-key calc-number-key" data-value="0">0</button>
                        <button class="calc-key calc-disabled-key" data-value="divide" disabled>÷</button>
                        <button class="calc-key calc-operator-key calc-active-op" data-value="-">−</button>
                        
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
        
        // Operation keys (+ and -)
        const operationKeys = this.container.querySelectorAll('.calc-operator-key');
        operationKeys.forEach(key => {
            key.addEventListener('click', () => {
                const value = key.getAttribute('data-value');
                this.selectOperation(value);
            });
        });
        
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
            } else if (e.key === '+' || e.key === '-') {
                this.selectOperation(e.key === '+' ? '+' : '-');
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
        // Generate target number (not bigger than 2500)
        const target = this.randomBetween(10, this.maxTarget);
        
        // Choose operation
        const operator = Math.random() < 0.5 ? '+' : '-';
        
        let num1, answer;
        
        if (operator === '+') {
            // For addition: num1 + answer = target
            // answer should be reasonable (not too small)
            const minAnswer = Math.max(1, Math.floor(target * 0.1));
            const maxAnswer = Math.floor(target * 0.9);
            answer = this.randomBetween(minAnswer, maxAnswer);
            num1 = target - answer;
        } else {
            // For subtraction: num1 - answer = target
            // num1 should be bigger than target
            const minAnswer = Math.max(1, Math.floor(target * 0.1));
            const maxNum1 = Math.min(this.maxTarget, target + Math.floor(target * 0.9));
            answer = this.randomBetween(minAnswer, Math.floor(target * 0.5));
            num1 = target + answer;
        }
        
        this.currentProblem = {
            num1: num1,
            operator: operator,
            target: target,
            answer: answer
        };
    }
    
    selectOperation(op) {
        this.selectedOperation = op;
        this.updateDisplay();
    }

    handleNumberInput(digit) {
        // Prevent input that's too long
        if (this.userInput.length >= 5) return;
        
        this.userInput += digit;
        this.updateDisplay();
    }

    clearInput() {
        this.userInput = '';
        this.selectedOperation = null;
        this.updateDisplay();
    }

    eraseLastDigit() {
        if (this.userInput.length > 0) {
            this.userInput = this.userInput.slice(0, -1);
            this.updateDisplay();
        }
    }

    checkAnswer() {
        if (this.userInput === '' || this.selectedOperation === null) return;
        
        const userAnswer = parseInt(this.userInput);
        
        // Check if both the operation and number are correct
        if (userAnswer === this.currentProblem.answer && this.selectedOperation === this.currentProblem.operator) {
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
            this.selectedOperation = null;
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
            this.selectedOperation = null;
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
            operatorDisplayEl.textContent = this.selectedOperation || '?';
            operatorDisplayEl.classList.toggle('calc-input-active', this.selectedOperation !== null);
        }
        if (targetEl) targetEl.textContent = this.currentProblem.target;
        if (inputEl) {
            inputEl.textContent = this.userInput || '?';
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
        this.selectedOperation = null;
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
