// Galaxy Math Defender - Standalone version for Experiencia Bereshit
class GalaxyMathDefender {
    constructor(container, options = {}) {
        this.container = container;
        this.difficulty = options.difficulty || 'easy';
        this.maxNumber = options.maxNumber || 10;
        this.operations = options.operations || ['+', '-'];
        this.grade = options.grade || 1;
        
        // Game properties - will be set dynamically based on viewport
        this.width = 800;
        this.height = 600;
        this.player = { x: 400, y: 560, lane: 2, targetX: 400, vx: 0 };
        this.lanes = 5;
        this.playerSpeed = 400;
        this.enemies = [];
        this.bullets = [];
        this.enemySpeed = this.grade === 1 ? 12 : 30; // Slower for grade 1 (12), faster for grade 2 (30)
        this.bulletSpeed = 200;
        this.lastTime = null;
        this.animationId = null;
        this.currentProblem = null;
        this.nextProblem = null;
        this.lives = 3;
        this.wave = 1;
        this.score = 0;
        this.keys = {};
        this.waveTransitioning = false;
        this.transitionDelay = 0;
        this.lastSpawnTime = 0;
        this.spawnInterval = 1; // Respawn after 1 second
        this.maxEnemiesPerWave = this.grade === 1 ? 4 : 5; // How many enemies spawn per wave
        this.hasCorrectAnswer = false; // Track if correct answer is on screen
        this.problemStartTime = 0; // Track when current problem started
        this.problemTimeout = this.grade === 1 ? 30 : 25; // Auto-advance after 30s (grade 1) or 25s (grade 2)
        this.waitingForNextWave = false; // Track if we're waiting to spawn next wave
        this.waveRespawnCount = 0; // Track how many times wave has respawned for current problem
        this.maxRespawns = this.grade === 2 ? 3 : 999; // Grade 2: 3 respawns max, Grade 1: unlimited
        
        // Visual feedback for hits/misses
        this.flashEffect = null; // { type: 'correct' | 'wrong', alpha: 1.0, duration: 0 }
        
        this.setupGame();
        this.setupCanvas();
        this.startWave();
        this.updateHud();
        this.startLoop();
        
        // Handle window resize
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    setupGame() {
        this.container.innerHTML = `
            <div class="gmd-fullscreen-container">
                <canvas id="gmdCanvas"></canvas>
                
                <!-- HUD overlayed on canvas -->
                <div class="gmd-hud-overlay">
                    <div class="gmd-stats">
                        <div class="gmd-score" id="gmdScore">Puntos: 0</div>
                        <div class="gmd-lives" id="gmdLives">❤️❤️❤️</div>
                    </div>
                </div>
                
                <!-- Restart button -->
                <button class="restart-btn-overlay" id="restartBtn" title="Reiniciar juego">
                    <span class="restart-icon">🔄</span>
                </button>
                
                <!-- Controls overlayed on canvas -->
                <div class="gmd-controls-overlay">
                    <button class="control-btn control-left" id="gmdLeftBtn">
                        <span class="arrow">◀</span>
                    </button>
                    <button class="control-btn control-fire" id="gmdFireBtn">
                        <span class="fire-icon">▲</span>
                    </button>
                    <button class="control-btn control-right" id="gmdRightBtn">
                        <span class="arrow">▶</span>
                    </button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('gmdCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.setupEventListeners();
    }
    
    setupCanvas() {
        // Set canvas to fill viewport while maintaining aspect ratio
        const updateCanvasSize = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            
            // Account for some padding/margins
            const maxWidth = vw;
            const maxHeight = vh;
            
            // Set canvas size
            this.width = maxWidth;
            this.height = maxHeight;
            
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            
            // Update player position to be higher up (not inline with controls)
            // Position at about 70% down the screen
            this.player.y = this.height * 0.7;
            this.player.x = this.width / 2;
            this.player.targetX = this.width / 2;
        };
        
        updateCanvasSize();
    }
    
    handleResize() {
        this.setupCanvas();
    }

    setupEventListeners() {
        const leftBtn = document.getElementById('gmdLeftBtn');
        const rightBtn = document.getElementById('gmdRightBtn');
        const fireBtn = document.getElementById('gmdFireBtn');
        const restartBtn = document.getElementById('restartBtn');

        leftBtn.addEventListener('click', () => this.movePlayer(-1));
        rightBtn.addEventListener('click', () => this.movePlayer(1));
        fireBtn.addEventListener('click', () => this.fire());
        restartBtn.addEventListener('click', () => this.restart());

        this._keydownHandler = (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            if (e.key === 'ArrowLeft') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight') {
                this.keys.right = true;
            }
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                this.fire();
            }
        };
        
        this._keyupHandler = (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowRight') this.keys.right = false;
        };
        
        document.addEventListener('keydown', this._keydownHandler);
        document.addEventListener('keyup', this._keyupHandler);
    }

    cleanup() {
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        if (this._keyupHandler) {
            document.removeEventListener('keyup', this._keyupHandler);
            this._keyupHandler = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.handleResize) {
            window.removeEventListener('resize', this.handleResize);
        }
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    generateNumberForGrade() {
        // Generate numbers based on grade level
        if (this.grade === 1) {
            // First grade: numbers 0-20 only (simple addition and subtraction)
            return this.randomBetween(0, 20);
        } else if (this.grade === 2) {
            // Second grade: numbers in increments of 5 and 10, up to 100
            // Valid numbers: 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
            const multiples = [];
            for (let i = 0; i <= 100; i += 5) {
                multiples.push(i);
            }
            return multiples[this.randomBetween(0, multiples.length - 1)];
        } else {
            // Default fallback for other grades
            return this.randomBetween(0, this.maxNumber);
        }
    }

    generateProblem() {
        let a, b, op, text, answer;
        
        // Select random operation from allowed operations
        op = this.operations[Math.floor(Math.random() * this.operations.length)];
        
        if (op === '+') {
            if (this.grade === 1) {
                // Grade 1: Ensure sum doesn't exceed 20
                a = this.randomBetween(0, 20);
                b = this.randomBetween(0, 20 - a); // b is limited so a + b <= 20
                answer = a + b;
                text = `${a} + ${b}`;
            } else if (this.grade === 2) {
                // Grade 2: Both numbers are multiples of 5, sum can go up to 200 but keep it reasonable
                a = this.generateNumberForGrade();
                b = this.generateNumberForGrade();
                // If sum exceeds 100, regenerate with smaller numbers
                if (a + b > 100) {
                    a = this.randomBetween(0, 10) * 5; // 0-50
                    b = this.randomBetween(0, 10) * 5; // 0-50
                }
                answer = a + b;
                text = `${a} + ${b}`;
            } else {
                a = this.generateNumberForGrade();
                b = this.generateNumberForGrade();
                answer = a + b;
                text = `${a} + ${b}`;
            }
        } else if (op === '-') {
            a = this.generateNumberForGrade();
            b = this.generateNumberForGrade();
            // Ensure no negative results
            if (b > a) [a, b] = [b, a];
            answer = a - b;
            text = `${a} - ${b}`;
        } else if (op === '*') {
            // Multiplication: use simpler numbers (2-10)
            a = this.randomBetween(2, 10);
            b = this.randomBetween(2, 10);
            answer = a * b;
            text = `${a} × ${b}`;
        } else if (op === '/') {
            // Division: use simpler numbers
            b = this.randomBetween(2, 10);
            const result = this.randomBetween(2, 10);
            a = b * result;
            answer = result;
            text = `${a} ÷ ${b}`;
        }
        
        return { text, answer };
    }

    startWave() {
        this.currentProblem = this.generateProblem();
        // Reset flag — no correct answer spawned yet for the new problem
        this.hasCorrectAnswer = false;
        this.problemStartTime = 0; // Will be set in first update()
        this.waitingForNextWave = false;
        this.waveRespawnCount = 0; // Reset respawn counter for new problem
        this.spawnCompleteWave(this.currentProblem);
    }

    spawnCompleteWave(problem) {
        // Spawn a complete wave with the correct answer and multiple distractors
        const baseY = -40;
        const laneWidth = this.width / this.lanes;
        const usedLanes = new Set();
        
        // Always spawn the correct answer first
        const correctLane = this.randomBetween(0, this.lanes - 1);
        usedLanes.add(correctLane);
        this.enemies.push({
            x: (correctLane + 0.5) * laneWidth,
            y: baseY - this.randomBetween(0, 100),
            value: problem.answer,
            isCorrect: true
        });
        this.hasCorrectAnswer = true;
        
        // Spawn distractors (3-4 distractors for grade 1, 4 for grade 2)
        const distractorCount = this.maxEnemiesPerWave - 1;
        const usedValues = new Set([problem.answer]);
        
        for (let i = 0; i < distractorCount; i++) {
            // Try to get a unique lane
            let lane;
            let attempts = 0;
            do {
                lane = this.randomBetween(0, this.lanes - 1);
                attempts++;
            } while (usedLanes.has(lane) && attempts < 10);
            
            usedLanes.add(lane);
            
            // Generate distractor value
            let val;
            let valueAttempts = 0;
            
            if (this.grade === 1) {
                // Grade 1: distractors should be 0-20
                do {
                    valueAttempts++;
                    const delta = this.randomBetween(-8, 8) || 1;
                    val = problem.answer + delta;
                    if (val < 0) val = 0;
                    if (val > 20) val = 20;
                } while (usedValues.has(val) && valueAttempts < 20);
            } else if (this.grade === 2) {
                // Grade 2: distractors must be multiples of 5, between 0-200
                do {
                    valueAttempts++;
                    const deltaMultiples = this.randomBetween(-6, 6);
                    const delta = deltaMultiples * 5;
                    val = problem.answer + delta;
                    if (val < 0) val = 0;
                    if (val > 200) val = 200;
                    val = Math.round(val / 5) * 5;
                } while (usedValues.has(val) && valueAttempts < 20);
            } else {
                do {
                    valueAttempts++;
                    const delta = this.randomBetween(-8, 8) || 1;
                    val = problem.answer + delta;
                    if (val < 0) val = Math.abs(problem.answer + delta);
                } while (usedValues.has(val) && valueAttempts < 20);
            }
            
            usedValues.add(val);
            
            this.enemies.push({
                x: (lane + 0.5) * laneWidth,
                y: baseY - this.randomBetween(0, 100),
                value: val,
                isCorrect: false
            });
        }
        
        this.waitingForNextWave = false;
    }    movePlayer(dir) {
        const laneWidth = this.width / this.lanes;
        const currentLane = Math.round(this.player.x / laneWidth - 0.5);
        let newLane = currentLane + dir;
        if (newLane < 0) newLane = 0;
        if (newLane > this.lanes - 1) newLane = this.lanes - 1;
        this.player.targetX = (newLane + 0.5) * laneWidth;
    }

    fire() {
        this.bullets.push({ x: this.player.x, y: this.player.y - 20 });
        this.playSound('pop');
    }

    playSound(type) {
        // Simple sound feedback - can be enhanced later
        if (type === 'correct') {
            console.log('✓ Correct!');
        } else if (type === 'wrong') {
            console.log('✗ Wrong!');
        }
    }
    
    triggerFlash(type) {
        // Trigger a full-screen flash effect
        this.flashEffect = {
            type: type, // 'correct' or 'wrong'
            alpha: 0.6,
            duration: 0.5 // seconds
        };
    }

    updateHud() {
        const q = document.getElementById('gmdQuestion');
        const s = document.getElementById('gmdScore');
        const l = document.getElementById('gmdLives');
        const scoreDisplay = document.getElementById('score');
        
        if (q && this.currentProblem) q.textContent = `${this.currentProblem.text} = ?`;
        if (s) s.textContent = `Puntos: ${this.score}`;
        if (l) {
            // Hide lives for grades 1-2 (unlimited attempts)
            if (this.grade <= 2) {
                l.style.display = 'none';
            } else {
                l.style.display = 'block';
                const hearts = '❤️'.repeat(this.lives);
                const emptyHearts = '🖤'.repeat(Math.max(0, 3 - this.lives));
                l.textContent = hearts + emptyHearts;
            }
        }
        if (scoreDisplay) scoreDisplay.textContent = this.score;
    }

    startLoop() {
        const step = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const dt = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;
            this.update(dt);
            this.render();
            this.animationId = requestAnimationFrame(step);
        };
        this.animationId = requestAnimationFrame(step);
    }

    update(dt) {
        const laneWidth = this.width / this.lanes;

        // Initialize problem start time on first update
        if (this.problemStartTime === 0 && !this.waveTransitioning) {
            this.problemStartTime = performance.now() / 1000;
        }

        // Update flash effect
        if (this.flashEffect) {
            this.flashEffect.duration -= dt;
            this.flashEffect.alpha = Math.max(0, this.flashEffect.alpha - dt * 1.2);
            if (this.flashEffect.duration <= 0 || this.flashEffect.alpha <= 0) {
                this.flashEffect = null;
            }
        }

        // Check if problem has timed out (not solved within timeout period)
        if (!this.waveTransitioning && this.problemStartTime > 0) {
            const elapsedTime = (performance.now() / 1000) - this.problemStartTime;
            if (elapsedTime > this.problemTimeout) {
                // Auto-advance to next problem
                this.moveToNextProblem();
            }
        }

        // Check if all enemies are gone and we need to respawn the wave
        if (!this.waveTransitioning && !this.waitingForNextWave) {
            const activeEnemies = this.enemies.filter(e => !e.dead && !e.deadMissed).length;
            
            // If no active enemies remain
            if (activeEnemies === 0) {
                // Check if we've hit the respawn limit
                if (this.waveRespawnCount >= this.maxRespawns) {
                    // Auto-advance to next problem after max respawns
                    this.moveToNextProblem();
                } else {
                    // Wait and respawn the same problem
                    this.waitingForNextWave = true;
                    this.lastSpawnTime = 0;
                }
            }
        }
        
        // Respawn the wave after delay if waiting
        if (this.waitingForNextWave && !this.waveTransitioning) {
            this.lastSpawnTime += dt;
            if (this.lastSpawnTime >= this.spawnInterval) {
                this.waveRespawnCount++; // Increment respawn counter
                this.spawnCompleteWave(this.currentProblem);
            }
        }

        // Handle wave transitioning delay
        if (this.waveTransitioning) {
            this.transitionDelay -= dt;
            if (this.transitionDelay <= 0) {
                this.waveTransitioning = false;
                if (this.nextProblem) {
                    this.currentProblem = this.nextProblem;
                    this.nextProblem = null;
                    this.lastSpawnTime = 0;
                    this.problemStartTime = 0; // Reset timer for new problem
                    this.waitingForNextWave = false;
                    this.waveRespawnCount = 0; // Reset respawn counter for new problem
                    this.spawnCompleteWave(this.currentProblem);
                    this.updateHud();
                }
            }
        }

        // Smooth player movement with sliding
        if (this.keys.left) {
            this.player.targetX = Math.max(laneWidth * 0.5, this.player.targetX - this.playerSpeed * dt);
        }
        if (this.keys.right) {
            this.player.targetX = Math.min(this.width - laneWidth * 0.5, this.player.targetX + this.playerSpeed * dt);
        }
        
        // Interpolate player position towards target
        const dx = this.player.targetX - this.player.x;
        if (Math.abs(dx) > 1) {
            this.player.x += dx * 8 * dt;
        } else {
            this.player.x = this.player.targetX;
        }

        // Move enemies
        // Speed increases gradually: grade 1 slower (starts at 12, +1 per wave), grade 2 faster (starts at 30, +2 per wave)
        const speedIncrease = this.grade === 1 ? 1 : 2;
        const enemySpeed = this.enemySpeed + (this.wave - 1) * speedIncrease;
        this.enemies.forEach(e => {
            e.y += enemySpeed * dt;
        });

        // Move bullets
        this.bullets.forEach(b => {
            b.y -= this.bulletSpeed * dt;
        });

        // Collision detection
        this.bullets.forEach(b => {
            this.enemies.forEach(e => {
                if (!e.dead && Math.abs(b.x - e.x) < laneWidth * 0.3 && Math.abs(b.y - e.y) < 25) {
                    e.dead = true;
                    b.hit = true;
                    if (e.isCorrect) {
                        this.handleCorrectHit();
                    } else {
                        this.handleWrongHit();
                    }
                }
            });
        });

        // Remove dead enemies, bullets that went off screen
        this.enemies = this.enemies.filter(e => !e.dead && e.y < this.height + 50 && !e.deadMissed);
        this.bullets = this.bullets.filter(b => b.y > -20 && !b.hit);

        // Check enemies reaching bottom
        this.enemies.forEach(e => {
            if (!e.dead && e.y >= this.height - 40) {
                e.deadMissed = true;
                if (e.isCorrect) {
                    this.handleMissedCorrect();
                }
            }
        });
    }

    handleCorrectHit() {
        this.playSound('correct');
        this.triggerFlash('correct');
        this.score += 10;
        this.wave++;
        
        // Make ALL enemies explode/disappear (correct and distractors)
        this.enemies.forEach(e => {
            if (!e.dead && !e.deadMissed) {
                e.dead = true;
                e.exploding = true; // Mark for visual effect
            }
        });
        
        // Stop spawning new enemies for this problem
        this.waveTransitioning = true;
        this.transitionDelay = 1.5;
        
        // Prepare next problem
        // Reset flag so the next problem will guarantee a correct spawn
        this.hasCorrectAnswer = false;
        this.nextProblem = this.generateProblem();
        
        this.updateHud();
    }

    handleWrongHit() {
        this.playSound('wrong');
        this.triggerFlash('wrong');
        // Only lose lives in grade 3+, grades 1-2 have unlimited attempts
        if (this.grade > 2) {
            this.lives = Math.max(0, this.lives - 1);
            if (this.lives === 0) {
                this.gameOver();
            }
        }
        this.updateHud();
    }

    handleMissedCorrect() {
        this.triggerFlash('wrong');
        // Only lose lives in grade 3+, grades 1-2 have unlimited attempts
        if (this.grade > 2) {
            this.lives = Math.max(0, this.lives - 1);
            if (this.lives === 0) {
                this.gameOver();
                return;
            }
        }
        
        // Move to next wave/problem without calling startWave
        this.wave++;
        this.waveTransitioning = true;
        this.transitionDelay = 1.5;
        // Reset flag so the next problem will guarantee a correct spawn
        this.hasCorrectAnswer = false;
        this.nextProblem = this.generateProblem();
        
        this.updateHud();
    }

    moveToNextProblem() {
        // Move to next problem without penalty (timeout scenario)
        this.wave++;
        this.waveTransitioning = true;
        this.transitionDelay = 1.5;
        // Reset flag so the next problem will guarantee a correct spawn
        this.hasCorrectAnswer = false;
        this.nextProblem = this.generateProblem();
        this.updateHud();
    }

    gameOver() {
        this.playSound('wrong');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Show game over message on canvas
        this.showGameOverMessage();
        
        // Auto-restart after showing the message
        setTimeout(() => {
            this.restart();
        }, 3000);
    }
    
    showGameOverMessage() {
        // Clear canvas and show game over message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Title
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('¡Juego Terminado!', this.width / 2, this.height / 2 - 60);
        
        // Score
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '32px Arial';
        this.ctx.fillText(`Puntos: ${this.score}`, this.width / 2, this.height / 2);
        
        // Waves
        this.ctx.fillText(`Oleadas: ${this.wave - 1}`, this.width / 2, this.height / 2 + 40);
        
        // Restart message
        this.ctx.fillStyle = '#44ff44';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Reiniciando...', this.width / 2, this.height / 2 + 100);
    }

    restart() {
        this.cleanup();
        this.lives = 3;
        this.wave = 1;
        this.score = 0;
        this.enemies = [];
        this.bullets = [];
        this.lastTime = null;
        this.keys = {};
        this.waveTransitioning = false;
        this.transitionDelay = 0;
        this.flashEffect = null;
        this.lastSpawnTime = 0;
        this.hasCorrectAnswer = false;
        this.problemStartTime = 0;
        this.waitingForNextWave = false;
        this.waveRespawnCount = 0;
        
        this.setupGame();
        this.setupCanvas();
        this.startWave();
        this.updateHud();
        this.startLoop();
    }

    render() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Background
        const grd = ctx.createRadialGradient(this.width / 2, 0, 50, this.width / 2, this.height, this.height);
        grd.addColorStop(0, '#3949ab');
        grd.addColorStop(1, '#000');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 53) % this.width;
            const y = (i * 97) % this.height;
            ctx.fillRect(x, y, 2, 2);
        }

        // Draw target problem at top center
        if (this.currentProblem) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 3;
            const boxWidth = 200;
            const boxHeight = 50;
            const boxX = this.width / 2 - boxWidth / 2;
            const boxY = 10;
            
            // Draw rounded rectangle background
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
            ctx.fill();
            ctx.stroke();
            
            // Draw problem text
            ctx.fillStyle = '#000';
            ctx.font = 'bold 24px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.currentProblem.text + ' = ?', this.width / 2, boxY + boxHeight / 2);
            ctx.restore();
        }

        // Player ship
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(16, 12);
        ctx.lineTo(-16, 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Enemies
        this.enemies.forEach(e => {
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.fillStyle = '#ff5722';
            ctx.beginPath();
            ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(e.value, 0, 0);
            ctx.restore();
        });

        // Bullets
        ctx.fillStyle = '#ffeb3b';
        this.bullets.forEach(b => {
            ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
        });
        
        // Draw flash effect overlay
        if (this.flashEffect) {
            ctx.save();
            if (this.flashEffect.type === 'correct') {
                ctx.fillStyle = `rgba(76, 175, 80, ${this.flashEffect.alpha})`;
            } else {
                ctx.fillStyle = `rgba(244, 67, 54, ${this.flashEffect.alpha})`;
            }
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.restore();
        }
    }
}
