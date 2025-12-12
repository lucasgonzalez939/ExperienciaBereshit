class MathJumper {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.lives = 3;
        this.currentQuestion = null;
        this.gameRunning = true;
        this.animationId = null;
        
        // Game objects
        this.player = {
            x: 100,
            y: 500,
            width: 60,
            height: 60,
            velocityY: 0,
            velocityX: 0,
            jumping: false,
            onPlatform: false,
            currentPlatform: null,
            targetPlatform: null,
            isJumpingToAnswer: false
        };
        
        this.platforms = [];
        this.gravity = 0.5;
        this.jumpStrength = -15;
        this.moveSpeed = 6;
        this.keys = {};
        
        // Question bank
        this.questions = [
            // Fracciones (6 preguntas)
            {
                question: "2 × 1/4 es igual a:",
                answers: ["1/2", "3/4", "1/4"],
                correct: 0
            },
            {
                question: "3 × 1/3 es igual a:",
                answers: ["1", "2/3", "1/3"],
                correct: 0
            },
            {
                question: "4 × 1/2 es igual a:",
                answers: ["2", "1", "4"],
                correct: 0
            },
            {
                question: "1/2 + 1/4 es igual a:",
                answers: ["3/4", "2/6", "1/6"],
                correct: 0
            },
            {
                question: "5 × 1/5 es igual a:",
                answers: ["1", "5/5", "25"],
                correct: 0
            },
            {
                question: "6 × 1/2 es igual a:",
                answers: ["3", "12", "2"],
                correct: 0
            },
            // Valor posicional (8 preguntas)
            {
                question: "En 136542, ¿qué valor tiene el dígito 2?",
                answers: ["2", "20", "200"],
                correct: 0
            },
            {
                question: "En 136542, ¿qué valor tiene el dígito 5?",
                answers: ["5", "50", "500"],
                correct: 2
            },
            {
                question: "En 136542, ¿qué valor tiene el dígito 6?",
                answers: ["6000", "600", "60"],
                correct: 0
            },
            {
                question: "En 245789, ¿qué valor tiene el dígito 4?",
                answers: ["40", "400", "40000"],
                correct: 2
            },
            {
                question: "En 987654, ¿qué valor tiene el dígito 8?",
                answers: ["80000", "8000", "800"],
                correct: 0
            },
            {
                question: "En 523617, ¿qué valor tiene el dígito 3?",
                answers: ["3000", "300", "30"],
                correct: 0
            },
            {
                question: "En 704826, ¿qué valor tiene el dígito 7?",
                answers: ["700000", "70000", "7000"],
                correct: 0
            },
            {
                question: "En 851294, ¿qué valor tiene el dígito 9?",
                answers: ["90", "900", "9"],
                correct: 0
            },
            // Sumas grandes (5 preguntas)
            {
                question: "200000 + 20000 + 2000 + 200 =",
                answers: ["222200", "242000", "220200"],
                correct: 0
            },
            {
                question: "100000 + 10000 + 1000 + 100 =",
                answers: ["111100", "101100", "110100"],
                correct: 0
            },
            {
                question: "500000 + 5000 + 50 =",
                answers: ["505050", "550050", "500550"],
                correct: 0
            },
            {
                question: "300000 + 30000 + 300 =",
                answers: ["330300", "303300", "333000"],
                correct: 0
            },
            {
                question: "700000 + 7000 + 70 =",
                answers: ["707070", "770070", "700770"],
                correct: 0
            },
            // Evaluación de expresiones (6 preguntas)
            {
                question: "10 × 1000 + 10 × 100 =",
                answers: ["11000", "10100", "11100"],
                correct: 0
            },
            {
                question: "5 × 100 + 3 × 10 =",
                answers: ["530", "350", "503"],
                correct: 0
            },
            {
                question: "20 × 10 + 5 × 2 =",
                answers: ["210", "250", "205"],
                correct: 0
            },
            {
                question: "8 × 100 + 4 × 10 =",
                answers: ["840", "480", "804"],
                correct: 0
            },
            {
                question: "3 × 1000 + 2 × 100 =",
                answers: ["3200", "3020", "2300"],
                correct: 0
            },
            {
                question: "15 × 10 + 5 × 5 =",
                answers: ["175", "200", "155"],
                correct: 0
            },
            // División/problemas (8 preguntas)
            {
                question: "Si tenés 16 chocolates para 4 personas, ¿cuántos tiene cada una?",
                answers: ["4", "8", "2"],
                correct: 0
            },
            {
                question: "Si tenés 24 caramelos para 6 niños, ¿cuántos tiene cada uno?",
                answers: ["4", "6", "3"],
                correct: 0
            },
            {
                question: "Si tenés 35 galletas para 7 amigos, ¿cuántas tiene cada uno?",
                answers: ["5", "7", "6"],
                correct: 0
            },
            {
                question: "Si tenés 48 dulces para 8 chicos, ¿cuántos tiene cada uno?",
                answers: ["6", "8", "4"],
                correct: 0
            },
            {
                question: "Si tenés 45 lápices para 9 estudiantes, ¿cuántos tiene cada uno?",
                answers: ["5", "9", "6"],
                correct: 0
            },
            {
                question: "Si tenés 60 stickers para 10 amigos, ¿cuántos tiene cada uno?",
                answers: ["6", "10", "5"],
                correct: 0
            },
            {
                question: "Si tenés 28 cartas para 4 jugadores, ¿cuántas tiene cada uno?",
                answers: ["7", "4", "6"],
                correct: 0
            },
            {
                question: "Si tenés 36 fichas para 6 grupos, ¿cuántas tiene cada grupo?",
                answers: ["6", "9", "4"],
                correct: 0
            },
            // Multiplicación (8 preguntas)
            {
                question: "¿Cuánto es 8 veces 4?",
                answers: ["32", "28", "36"],
                correct: 0
            },
            {
                question: "¿Cuánto es 7 veces 6?",
                answers: ["42", "48", "36"],
                correct: 0
            },
            {
                question: "¿Cuánto es 9 veces 5?",
                answers: ["45", "40", "54"],
                correct: 0
            },
            {
                question: "¿Cuánto es 12 × 3?",
                answers: ["36", "33", "39"],
                correct: 0
            },
            {
                question: "¿Cuánto es 11 × 4?",
                answers: ["44", "48", "40"],
                correct: 0
            },
            {
                question: "¿Cuánto es 6 × 8?",
                answers: ["48", "56", "42"],
                correct: 0
            },
            {
                question: "¿Cuánto es 9 × 7?",
                answers: ["63", "56", "72"],
                correct: 0
            },
            {
                question: "¿Cuánto es 5 × 12?",
                answers: ["60", "55", "65"],
                correct: 0
            }
        ];
        
        this.init();
    }
    
    init() {
        this.createGameHTML();
        this.setupCanvas();
        this.setupEventListeners();
        this.generateQuestion();
        this.resetPlayer(); // Position player on start platform
        this.gameLoop();
    }
    
    createGameHTML() {
        this.container.innerHTML = `
            <div class="math-jumper-game">
                <!-- HUD Overlay -->
                <div class="jumper-hud-overlay">
                    <div class="jumper-hud-item">
                        <span class="jumper-hud-label">Puntaje:</span>
                        <span class="jumper-hud-value" id="jumperScore">0</span>
                    </div>
                    <div class="jumper-hud-item">
                        <span class="jumper-hud-label">Vidas:</span>
                        <span class="jumper-hud-value" id="jumperLives">❤️❤️❤️</span>
                    </div>
                </div>
                
                <!-- Canvas -->
                <canvas id="jumperCanvas"></canvas>
                
                <!-- Flash overlay for feedback -->
                <div class="jumper-flash-overlay" id="jumperFlash"></div>
                
                <!-- Instructions -->
                <div class="jumper-instructions">
                    <p>Toca la respuesta correcta</p>
                </div>
            </div>
        `;
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('jumperCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        
        // Adjust player position if needed
        if (this.player.y > this.canvas.height - 100) {
            this.player.y = this.canvas.height - 150;
        }
    }
    
    setupEventListeners() {
        // Click/Touch to select answer platform
        const handleClick = (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            let clickX, clickY;
            
            if (e.type === 'touchstart') {
                clickX = (e.touches[0].clientX - rect.left) * scaleX;
                clickY = (e.touches[0].clientY - rect.top) * scaleY;
            } else {
                clickX = (e.clientX - rect.left) * scaleX;
                clickY = (e.clientY - rect.top) * scaleY;
            }
            
            // Check if clicked on an answer platform
            for (let platform of this.platforms) {
                if (platform.isDecorative || platform.isStart || platform.landed) continue;
                
                const platformCenterX = platform.x + platform.radius;
                const platformCenterY = platform.y + platform.radius;
                
                const distance = Math.sqrt(
                    Math.pow(clickX - platformCenterX, 2) + 
                    Math.pow(clickY - platformCenterY, 2)
                );
                
                if (distance < platform.radius) {
                    // Platform clicked! Validate answer IMMEDIATELY
                    console.log('🎯 Clic en plataforma:', platform.answer, '| isCorrect:', platform.isCorrect);
                    platform.landed = true; // Mark as clicked
                    
                    // Check answer immediately based on click
                    this.checkAnswer(platform);
                    
                    // Jump to platform for visual feedback
                    this.jumpToPlatform(platform);
                    break;
                }
            }
        };
        
        this.canvas.addEventListener('click', handleClick);
        this.canvas.addEventListener('touchstart', handleClick);
    }
    
    generateQuestion() {
        // Pick a random question
        const questionData = this.questions[Math.floor(Math.random() * this.questions.length)];
        this.currentQuestion = JSON.parse(JSON.stringify(questionData)); // Deep copy
        
        // Store original correct answer for debugging
        const originalCorrectAnswer = this.currentQuestion.answers[this.currentQuestion.correct];
        
        // Shuffle answers
        const shuffled = this.currentQuestion.answers.map((answer, index) => ({
            text: answer,
            isCorrect: index === this.currentQuestion.correct
        }));
        
        // Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        this.currentQuestion.shuffledAnswers = shuffled;
        
        // Debug log
        console.log('Pregunta:', this.currentQuestion.question);
        console.log('Respuesta correcta:', originalCorrectAnswer);
        console.log('Opciones mezcladas:', shuffled.map(s => `${s.text} (${s.isCorrect ? 'CORRECTA' : 'incorrecta'})`));
        
        // Create platforms for answers
        this.createPlatforms();
    }
    
    createPlatforms() {
        this.platforms = [];
        
        // Create decorative lily pads first (background elements)
        // Avoid the question area (top 100-180px) and answer platforms area
        const numDecorative = 8;
        for (let i = 0; i < numDecorative; i++) {
            const x = Math.random() * (this.canvas.width - 100) + 50;
            // Place decoratives either very high (0-80px) or in gaps between game elements
            let y;
            if (Math.random() < 0.5) {
                y = Math.random() * 80 + 10; // Top area
            } else {
                y = Math.random() * (this.canvas.height - 400) + 200; // Lower scattered
            }
            const radius = 30 + Math.random() * 20;
            
            this.platforms.push({
                x: x - radius,
                y: y - radius,
                width: radius * 2,
                height: radius * 2,
                radius: radius,
                answer: null,
                isCorrect: null,
                landed: false,
                isStart: false,
                isDecorative: true
            });
        }
        
        // Create lily pad platforms in a scattered pattern
        // Bottom platform where player starts (safe platform)
        const startPlatform = {
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height - 120,
            width: 100,
            height: 100,
            radius: 50,
            answer: null,
            isCorrect: null,
            landed: false,
            isStart: true,
            isDecorative: false
        };
        this.platforms.push(startPlatform);
        
        // Three answer platforms in middle-lower area (below question box)
        // Question box is at ~100-180px, so platforms should be below ~200px
        const platformY = Math.max(220, this.canvas.height * 0.4); // Middle area, below question
        const centerX = this.canvas.width / 2;
        const radius = Math.min(70, this.canvas.width / 8); // Responsive radius
        const spacing = Math.min(250, this.canvas.width / 3);
        
        // Position platforms at THE SAME HEIGHT - all in a horizontal line
        const positions = [
            { x: centerX - spacing, y: platformY },
            { x: centerX, y: platformY },              // SAME Y as others!
            { x: centerX + spacing, y: platformY }
        ];
        
        this.currentQuestion.shuffledAnswers.forEach((answer, index) => {
            const pos = positions[index] || positions[0];
            // Keep platforms within bounds
            let x = Math.max(radius, Math.min(this.canvas.width - radius, pos.x));
            this.platforms.push({
                x: x - radius,
                y: pos.y - radius,
                width: radius * 2,
                height: radius * 2,
                radius: radius,
                answer: answer.text,
                isCorrect: answer.isCorrect,
                landed: false,
                isStart: false,
                isDecorative: false
            });
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Apply horizontal movement (for jump animation)
        this.player.x += this.player.velocityX;
        
        // Keep player in bounds
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        
        // Apply gravity only if not standing on a platform
        if (!this.player.onPlatform) {
            this.player.velocityY += this.gravity;
            this.player.y += this.player.velocityY;
        }
        
        // Check if jumping to answer platform (just for visual landing)
        if (this.player.isJumpingToAnswer && this.player.targetPlatform) {
            const platform = this.player.targetPlatform;
            const platformCenterX = platform.x + platform.radius;
            const platformCenterY = platform.y + platform.radius;
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(playerCenterX - platformCenterX, 2) + 
                Math.pow(playerCenterY - platformCenterY, 2)
            );
            
            // Check if close enough to platform (just for visual landing)
            if (distance < platform.radius + 30 && this.player.velocityY > 0) {
                this.player.isJumpingToAnswer = false;
                this.player.velocityX = 0;
                
                if (platform.isCorrect) {
                    // LAND on correct answer (visual only)
                    this.player.y = platform.y - this.player.height + 20;
                    this.player.velocityY = 0;
                    this.player.jumping = false;
                    this.player.onPlatform = true;
                } else {
                    // FALL through wrong answer (visual only)
                    this.player.velocityX = 0;
                    this.player.velocityY = Math.max(this.player.velocityY, 5);
                }
            }
        }
        
        // Check platform collisions (lily pads are circular) - only for start platform
        this.player.onPlatform = false;
        for (let platform of this.platforms) {
            // ONLY check collision with START platform here
            // Answer platforms are handled in the isJumpingToAnswer block above
            if (!platform.isStart) continue;
            if (this.player.isJumpingToAnswer) continue; // Don't interfere when jumping to answer
            
            // Check if player lands on platform (circular collision)
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            const platformCenterX = platform.x + platform.radius;
            const platformCenterY = platform.y + platform.radius;
            
            const distance = Math.sqrt(
                Math.pow(playerCenterX - platformCenterX, 2) + 
                Math.pow(playerCenterY - platformCenterY, 2)
            );
            
            // If player is close enough and falling down
            if (distance < platform.radius + 20 && this.player.velocityY > 0) {
                this.player.y = platform.y - this.player.height + 20;
                this.player.velocityY = 0;
                this.player.jumping = false;
                this.player.onPlatform = true;
                this.player.currentPlatform = platform;
                break;
            }
        }
        
        // Check if player fell off screen
        if (this.player.y > this.canvas.height) {
            this.handleFall();
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkAnswer(platform) {
        console.log('✅ Verificando respuesta:', platform.answer, '| isCorrect:', platform.isCorrect);
        if (platform.isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }
    
    jumpToPlatform(platform) {
        // Mark platform as being jumped to
        platform.landed = true;
        this.player.targetPlatform = platform;
        
        const platformCenterX = platform.x + platform.radius;
        const platformCenterY = platform.y + platform.radius;
        
        // Calculate trajectory
        const targetX = platformCenterX - this.player.width / 2;
        const targetY = platformCenterY - this.player.height / 2;
        
        // Set velocities for arc jump
        const dx = targetX - this.player.x;
        const distance = Math.sqrt(dx * dx);
        const duration = 20; // frames for horizontal movement
        
        this.player.velocityX = dx / duration;
        this.player.velocityY = this.jumpStrength;
        this.player.jumping = true;
        this.player.isJumpingToAnswer = true;
    }
    
    handleCorrectAnswer() {
        this.score += 10;
        this.updateHUD();
        this.triggerFlash('correct');
        
        // Stop the player completely - NO celebration jump
        this.player.velocityY = 0;
        this.player.velocityX = 0;
        this.player.jumping = false;
        this.player.onPlatform = true;
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    }
    
    handleWrongAnswer() {
        this.lives--;
        this.updateHUD();
        this.triggerFlash('wrong');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Wait longer to show the fall animation
            setTimeout(() => {
                this.resetPlayer();
            }, 1500);
        }
    }
    
    handleFall() {
        this.lives--;
        this.updateHUD();
        this.triggerFlash('wrong');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetPlayer();
        }
    }
    
    resetPlayer() {
        // Reset to start platform
        const startPlatform = this.platforms.find(p => p.isStart);
        if (startPlatform) {
            this.player.x = startPlatform.x + startPlatform.radius - this.player.width / 2;
            this.player.y = startPlatform.y - this.player.height;
        } else {
            this.player.x = this.canvas.width / 2 - this.player.width / 2;
            this.player.y = this.canvas.height - 150;
        }
        
        this.player.velocityY = 0;
        this.player.velocityX = 0;
        this.player.jumping = false;
        this.player.onPlatform = false;
        this.player.currentPlatform = null;
        this.player.targetPlatform = null;
        this.player.isJumpingToAnswer = false;
        
        // Reset platform landed states (except start platform and decorative)
        this.platforms.forEach(p => {
            if (!p.isStart && !p.isDecorative) p.landed = false;
        });
    }
    
    nextQuestion() {
        this.resetPlayer();
        this.generateQuestion();
    }
    
    gameOver() {
        this.gameRunning = false;
        this.drawGameOver();
        
        setTimeout(() => {
            this.score = 0;
            this.lives = 3;
            this.gameRunning = true;
            this.resetPlayer();
            this.generateQuestion();
            this.updateHUD();
        }, 3000);
    }
    
    updateHUD() {
        const scoreEl = document.getElementById('jumperScore');
        const livesEl = document.getElementById('jumperLives');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (livesEl) {
            const hearts = '❤️'.repeat(this.lives);
            livesEl.textContent = hearts || '💔';
        }
    }
    
    triggerFlash(type) {
        const flashElement = document.getElementById('jumperFlash');
        if (!flashElement) return;
        
        flashElement.className = 'jumper-flash-overlay';
        
        if (type === 'correct') {
            flashElement.classList.add('jumper-flash-correct');
        } else {
            flashElement.classList.add('jumper-flash-wrong');
        }
        
        setTimeout(() => {
            flashElement.className = 'jumper-flash-overlay';
        }, 600);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw water background with animated waves
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#4dd0e1');
        gradient.addColorStop(1, '#0097a7');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw water patterns (simple circles for effect)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            const x = (Date.now() / 50 + i * 100) % this.canvas.width;
            const y = 50 + i * 60;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw question
        this.drawQuestion();
        
        // Draw platforms (lily pads)
        this.drawPlatforms();
        
        // Draw player (frog)
        this.drawPlayer();
        
        // Draw game over if needed
        if (!this.gameRunning) {
            this.drawGameOver();
        }
    }
    
    drawQuestion() {
        this.ctx.save();
        
        // Draw question background with better visibility
        // Position it below the HUD (around 100px from top)
        const questionTop = 100;
        const questionHeight = 80;
        const padding = 10;
        
        // Semi-transparent white background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(padding, questionTop, this.canvas.width - padding * 2, questionHeight);
        
        // Border
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(padding, questionTop, this.canvas.width - padding * 2, questionHeight);
        
        // Draw question text
        this.ctx.fillStyle = '#2d3748';
        const fontSize = Math.max(18, Math.min(28, this.canvas.width / 30));
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw text
        this.ctx.fillText(this.currentQuestion.question, this.canvas.width / 2, questionTop + questionHeight / 2);
        
        this.ctx.restore();
    }
    
    drawPlatforms() {
        this.platforms.forEach(platform => {
            this.ctx.save();
            
            const centerX = platform.x + platform.radius;
            const centerY = platform.y + platform.radius;
            
            // Draw lily pad (circular platform)
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, platform.radius, 0, Math.PI * 2);
            
            // Color based on state
            if (platform.isDecorative) {
                // Decorative lily pads - more transparent and darker
                this.ctx.fillStyle = 'rgba(56, 142, 60, 0.5)';
            } else if (platform.isStart) {
                // Start platform - darker green
                this.ctx.fillStyle = '#2d5016';
            } else if (platform.landed) {
                this.ctx.fillStyle = platform.isCorrect ? '#388e3c' : '#d32f2f';
            } else {
                this.ctx.fillStyle = '#4caf50';
            }
            this.ctx.fill();
            
            // Lily pad border (lighter for decorative)
            this.ctx.strokeStyle = platform.isDecorative ? 'rgba(27, 94, 32, 0.4)' : '#1b5e20';
            this.ctx.lineWidth = platform.isDecorative ? 2 : 4;
            this.ctx.stroke();
            
            // Add lily pad details (veins) - skip for decorative
            if (!platform.isDecorative) {
                this.ctx.strokeStyle = 'rgba(27, 94, 32, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, centerY);
                this.ctx.lineTo(centerX, centerY - platform.radius);
                this.ctx.stroke();
                
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(centerX, centerY);
                    const endX = centerX + Math.cos(angle) * platform.radius * 0.8;
                    const endY = centerY + Math.sin(angle) * platform.radius * 0.8;
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                }
            }
            
            // Draw answer text (if not start platform)
            if (!platform.isStart && platform.answer) {
                this.ctx.fillStyle = '#fff';
                const fontSize = Math.max(16, Math.min(24, platform.radius / 3));
                this.ctx.font = `bold ${fontSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 3;
                this.ctx.strokeText(platform.answer, centerX, centerY);
                this.ctx.fillText(platform.answer, centerX, centerY);
            }
            
            this.ctx.restore();
        });
    }
    
    drawPlayer() {
        this.ctx.save();
        
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        
        // Draw frog body
        this.ctx.fillStyle = '#4caf50';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.player.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Frog outline
        this.ctx.strokeStyle = '#2e7d32';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw belly (lighter spot)
        this.ctx.fillStyle = '#81c784';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 5, this.player.width / 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes (big white circles)
        const eyeRadius = 10;
        const eyeOffset = 12;
        
        // Left eye
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(centerX - eyeOffset, centerY - 8, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Right eye
        this.ctx.beginPath();
        this.ctx.arc(centerX + eyeOffset, centerY - 8, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Pupils
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(centerX - eyeOffset, centerY - 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(centerX + eyeOffset, centerY - 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Smile
        this.ctx.strokeStyle = '#2e7d32';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 5, 8, 0, Math.PI, false);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawGameOver() {
        this.ctx.save();
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡Juego Terminado!', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '32px Arial';
        this.ctx.fillText(`Puntaje Final: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#cbd5e0';
        this.ctx.fillText('Reiniciando en 3 segundos...', this.canvas.width / 2, this.canvas.height / 2 + 70);
        
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MathJumper('gameArea');
    });
} else {
    new MathJumper('gameArea');
}
