// Runner Game Logic
class RunnerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'waiting'; // waiting, playing, questioning, ended
        
        // Game properties
        this.score = 0;
        this.distance = 0;
        this.lives = 5;
        this.speed = 5.0; // Base speed - player always moves forward
        this.speedMultiplier = 1.0;
        this.size = 1.0;
        this.correctAnswers = 0;
        this.currentQuestion = null; // Current question being displayed
        
        // Player properties - centered on road, moves left/right and jumps
        this.player = {
            x: 400, // Start in center of road
            y: 350,
            width: 30,
            height: 40,
            velocityY: 0,
            onGround: true,
            color: '#00ffff',
            lane: 0 // -1 = left lane, 0 = center, 1 = right lane
        };
        
        // Game world
        this.road = {
            y: 400,
            height: 160,
            width: 600,
            leftX: 150,
            rightX: 650,
            split: false,
            splitProgress: 0,
            splitDirection: 0, // 0 = normal, 1 = splitting, 2 = split, 3 = merging
            questionActive: false,
            selectedLane: null // 'left' or 'right'
        };
        
        // Game objects
        this.obstacles = [];
        this.questions = [];
        this.particles = [];
        this.environment = []; // Background elements
        
        // Controls
        this.keys = {};
        this.lastQuestionDistance = 0;
        this.questionDistance = 0;
        
        // Game constants
        this.GRAVITY = 0.8;
        this.JUMP_POWER = -15;
        this.QUESTION_INTERVAL = 800; // Every 80 units = 8km
        this.MAX_DISTANCE = 100000; // 10000km
        
        this.setupEventListeners();
        this.loadQuestions();
        this.gameLoop();
    }
    
    updateRoadSplit() {
        if (this.road.splitDirection === 1) {
            // Road is splitting
            this.road.splitProgress += 0.02;
            if (this.road.splitProgress >= 1) {
                this.road.splitDirection = 2; // Fully split
                this.road.split = true;
            }
        } else if (this.road.splitDirection === 3) {
            // Road is merging back
            this.road.splitProgress -= 0.02;
            if (this.road.splitProgress <= 0) {
                this.road.splitDirection = 0; // Normal road
                this.road.split = false;
                this.road.questionActive = false;
                this.road.selectedLane = null;
            }
        }
    }
    
    generateEnvironment() {
        // Generate background elements like trees, buildings, etc.
        if (Math.random() < 0.005) {
            const side = Math.random() > 0.5 ? 'left' : 'right';
            const x = side === 'left' ? 20 : this.canvas.width - 60;
            const element = {
                x: x,
                y: this.road.y + Math.random() * 50,
                width: 40,
                height: 60 + Math.random() * 40,
                color: '#004400',
                type: 'tree',
                side: side
            };
            this.environment.push(element);
        }
        
        // Update environment (move with road)
        this.environment = this.environment.filter(element => {
            element.y += this.speed * 0.5;
            return element.y < this.canvas.height + 100;
        });
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle forward movement and jump
            if ((e.code === 'KeyW' || e.code === 'ArrowUp') && this.gameState === 'playing' && !this.road.questionActive) {
                if (this.player.onGround) {
                    this.player.velocityY = this.JUMP_POWER;
                    this.player.onGround = false;
                }
                e.preventDefault();
            }
            
            // Handle jump with Space
            if (e.code === 'Space' && this.gameState === 'playing' && !this.road.questionActive) {
                if (this.player.onGround) {
                    this.player.velocityY = this.JUMP_POWER;
                    this.player.onGround = false;
                }
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Handle lane selection during questions
        document.addEventListener('keydown', (e) => {
            if (this.road.questionActive && this.road.split) {
                if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                    this.answerQuestion(true); // Left lane (correct)
                } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                    this.answerQuestion(false); // Right lane (incorrect)
                }
                e.preventDefault();
            }
        });
        
        // Handle canvas resizing
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.min(1200, container.clientWidth - 40);
        this.canvas.height = Math.min(600, window.innerHeight - 120);
        
        // Update road position based on canvas size
        this.road.y = this.canvas.height - 200;
        this.road.leftX = this.canvas.width * 0.2;
        this.road.rightX = this.canvas.width * 0.8;
        this.road.width = this.canvas.width * 0.6;
        
        // Adjust player position if needed
        if (this.player.x > this.canvas.width - this.player.width) {
            this.player.x = this.canvas.width / 2;
        }
    }
    
    loadQuestions() {
        if (typeof window.runnerQuestions !== 'undefined') {
            this.questions = [...window.runnerQuestions].sort(() => Math.random() - 0.5);
        } else {
            console.error('Questions not loaded');
            this.questions = [];
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.distance = 0;
        this.lives = 5;
        this.speedMultiplier = 1.0;
        this.size = 1.0;
        this.correctAnswers = 0;
        this.lastQuestionDistance = 0;
        
        // Reset player to center lane
        this.player.x = this.canvas.width / 2;
        this.player.y = this.road.y - this.player.height;
        this.player.velocityY = 0;
        this.player.onGround = true;
        this.player.lane = 0;
        
        // Clear game objects
        this.obstacles = [];
        this.particles = [];
        this.environment = [];
        
        // Reset road
        this.road.split = false;
        this.road.splitProgress = 0;
        this.road.splitDirection = 0;
        this.road.questionActive = false;
        this.road.selectedLane = null;
        this.road.questionIndex = -1;
        
        // Reset all hearts
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach(heart => heart.classList.remove('lost'));
        
        // Hide UI elements
        document.getElementById('controlsHint').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        
        // Reset current question
        this.currentQuestion = null;
        
        this.updateHUD();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update distance and score - player automatically moves forward
        this.distance += this.speed * this.speedMultiplier;
        this.score += Math.floor(this.speed * this.speedMultiplier);
        
        // Update road splitting animation
        this.updateRoadSplit();
        
        // Check for questions
        if (this.distance - this.lastQuestionDistance >= this.QUESTION_INTERVAL && this.questions.length > 0 && !this.road.questionActive) {
            this.triggerQuestion();
        }
        
        // Update player
        this.updatePlayer();
        
        // Update obstacles
        this.updateObstacles();
        
        // Update particles
        this.updateParticles();
        
        // Generate obstacles
        this.generateObstacles();
        
        // Generate environment
        this.generateEnvironment();
        
        // Check win condition
        if (this.distance >= this.MAX_DISTANCE) {
            this.endGame('win');
        }
        
        this.updateHUD();
    }
    
    updatePlayer() {
        // Horizontal movement - lane-based system with 3D perspective
        const roadCenterX = this.road.leftX + this.road.width / 2;
        const laneSpacing = this.road.width / 4;
        
        // Handle lane switching
        if ((this.keys['KeyA'] || this.keys['ArrowLeft']) && this.player.lane > -1) {
            this.player.lane--;
            this.keys['KeyA'] = false;
            this.keys['ArrowLeft'] = false;
        }
        if ((this.keys['KeyD'] || this.keys['ArrowRight']) && this.player.lane < 1) {
            this.player.lane++;
            this.keys['KeyD'] = false;
            this.keys['ArrowRight'] = false;
        }
        
        // Calculate target position with 3D perspective
        let targetX;
        if (this.player.lane === -1) {
            targetX = roadCenterX - laneSpacing; // Left lane
        } else if (this.player.lane === 0) {
            targetX = roadCenterX; // Center lane
        } else {
            targetX = roadCenterX + laneSpacing; // Right lane
        }
        
        // During road split, adjust target positions
        if (this.road.split) {
            const splitOffset = 100 * this.road.splitProgress;
            if (this.player.lane <= 0) {
                targetX = roadCenterX - splitOffset; // Left side of split
            } else {
                targetX = roadCenterX + splitOffset; // Right side of split
            }
        }
        
        this.player.x += (targetX - this.player.x) * 0.15;
        
        // Vertical movement (gravity and jumping)
        this.player.velocityY += this.GRAVITY;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        const groundY = this.road.y - this.player.height;
        if (this.player.y >= groundY) {
            this.player.y = groundY;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }
        
        // Check obstacle collisions
        this.checkObstacleCollisions();
    }
    
    updateObstacles() {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.speed * this.speedMultiplier;
            return obstacle.x + obstacle.width > 0;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life--;
            particle.alpha = particle.life / 30;
            return particle.life > 0;
        });
    }
    
    generateObstacles() {
        // Don't generate obstacles during questions
        if (this.road.questionActive) return;
        
        // Generate obstacles randomly on the road lanes
        if (Math.random() < 0.015) {
            const laneWidth = this.road.width / 3;
            const lane = Math.floor(Math.random() * 3); // 0, 1, 2 for left, center, right
            const laneX = this.road.leftX + (lane + 0.5) * laneWidth;
            
            const obstacle = {
                x: this.canvas.width + 50,
                y: this.road.y - 50,
                width: 40,
                height: 50,
                color: '#ff0040',
                type: Math.random() > 0.5 ? 'block' : 'spike',
                lane: lane,
                laneX: laneX
            };
            this.obstacles.push(obstacle);
        }
    }
    
    checkObstacleCollisions() {
        for (let obstacle of this.obstacles) {
            // Check if player is in same lane as obstacle
            const playerLaneX = this.player.x;
            const obstacleLaneX = obstacle.laneX;
            const laneDistance = Math.abs(playerLaneX - obstacleLaneX);
            
            // Only check collision if in same lane
            if (laneDistance < 100 && this.isColliding(this.player, obstacle)) {
                this.loseLife();
                this.createImpactParticles(this.player.x, this.player.y);
                // Remove the obstacle that was hit
                this.obstacles = this.obstacles.filter(obs => obs !== obstacle);
                break;
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    triggerQuestion() {
        if (this.questions.length === 0) return;
        
        // Start road splitting animation
        this.road.questionActive = true;
        this.road.splitDirection = 1; // Start splitting
        this.road.splitProgress = 0;
        
        // Get next question
        const questionIndex = (this.correctAnswers + Math.floor(Math.random() * 3)) % this.questions.length;
        const question = this.questions[questionIndex];
        
        // Randomly decide which side is correct (50/50 chance)
        const correctSide = Math.random() > 0.5 ? 'left' : 'right';
        
        // Store question data for in-game display
        this.currentQuestion = {
            ...question,
            correctSide: correctSide,
            leftText: correctSide === 'left' ? question.correct : question.incorrect,
            rightText: correctSide === 'right' ? question.correct : question.incorrect
        };
        
        this.road.questionIndex = questionIndex;
        this.lastQuestionDistance = this.distance;
    }
    
    answerQuestion(leftLane) {
        if (!this.currentQuestion) return;
        
        const selectedSide = leftLane ? 'left' : 'right';
        const correct = selectedSide === this.currentQuestion.correctSide;
        
        // Set selected lane for visual feedback
        this.road.selectedLane = selectedSide;
        
        // Move player to selected side
        if (leftLane) {
            this.player.lane = -1; // Force to left side
        } else {
            this.player.lane = 1; // Force to right side
        }
        
        if (correct) {
            // Correct answer - give bonuses
            this.correctAnswers++;
            this.score += 100;
            this.speedMultiplier = Math.min(this.speedMultiplier + 0.1, 2.0);
            this.size = Math.min(this.size + 0.05, 1.5);
            this.createBonusParticles(this.player.x, this.player.y, '#00ff41');
        } else {
            // Wrong answer - give penalties
            this.speedMultiplier = Math.max(this.speedMultiplier - 0.1, 0.5);
            this.size = Math.max(this.size - 0.05, 0.7);
            this.score = Math.max(this.score - 50, 0);
            this.createBonusParticles(this.player.x, this.player.y, '#ff0040');
        }
        
        // Clear the question
        this.currentQuestion = null;
        
        // Start merging road back together after a delay
        setTimeout(() => {
            this.road.splitDirection = 3; // Start merging
            this.player.lane = 0; // Return to center
        }, 2000);
    }
    
    loseLife() {
        this.lives--;
        const hearts = document.querySelectorAll('.heart');
        if (hearts[this.lives]) {
            hearts[this.lives].classList.add('lost');
        }
        
        if (this.lives <= 0) {
            this.endGame('lose');
        }
    }
    
    createImpactParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + this.player.width / 2,
                y: y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 5,
                life: 30,
                alpha: 1,
                color: '#ff0040'
            });
        }
    }
    
    createBonusParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + this.player.width / 2,
                y: y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                life: 40,
                alpha: 1,
                color: color
            });
        }
    }
    
    endGame(reason) {
        this.gameState = 'ended';
        
        // Update final stats
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance / 100) + 'km';
        document.getElementById('correctAnswers').textContent = this.correctAnswers;
        
        // Save high scores
        this.saveHighScores();
        
        // Show game over screen
        document.getElementById('gameOver').style.display = 'flex';
    }
    
    saveHighScores() {
        const bestScore = parseInt(localStorage.getItem('cautio-best-runner-score') || '0');
        const totalDistance = parseInt(localStorage.getItem('cautio-total-distance') || '0');
        
        if (this.score > bestScore) {
            localStorage.setItem('cautio-best-runner-score', this.score.toString());
        }
        
        const newTotalDistance = totalDistance + Math.floor(this.distance / 100);
        localStorage.setItem('cautio-total-distance', newTotalDistance.toString());
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('distance').textContent = Math.floor(this.distance / 100) + 'km';
        document.getElementById('speed').textContent = this.speedMultiplier.toFixed(1) + 'x';
        document.getElementById('size').textContent = this.size.toFixed(1) + 'x';
    }
    
    drawEnvironment() {
        this.environment.forEach(element => {
            this.ctx.fillStyle = element.color;
            this.ctx.fillRect(element.x, element.y, element.width, element.height);
        });
    }
    
    drawGameStatus() {
        if (this.road.questionActive && this.currentQuestion) {
            // Draw question billboard in the distance
            if (this.road.splitProgress > 0.3) {
                this.drawQuestionBillboard();
            }
            
            if (this.road.split && this.currentQuestion) {
                // Draw lane choice indicators on the road
                this.ctx.font = '16px Orbitron';
                this.ctx.textAlign = 'center';
                
                // Left lane - color based on if it's correct
                const leftIsCorrect = this.currentQuestion.correctSide === 'left';
                const rightIsCorrect = this.currentQuestion.correctSide === 'right';
                
                this.ctx.fillStyle = this.road.selectedLane === 'left' ? 
                    (leftIsCorrect ? '#00ff41' : '#ff0040') : 
                    (leftIsCorrect ? 'rgba(0, 255, 65, 0.7)' : 'rgba(255, 0, 64, 0.7)');
                this.ctx.fillRect(this.road.leftX - 150, this.road.y + 20, 200, 40);
                this.ctx.fillStyle = '#000000';
                this.ctx.fillText(leftIsCorrect ? 'SAFE' : 'DANGER', this.road.leftX - 50, this.road.y + 45);
                
                // Right lane - color based on if it's correct
                this.ctx.fillStyle = this.road.selectedLane === 'right' ? 
                    (rightIsCorrect ? '#00ff41' : '#ff0040') : 
                    (rightIsCorrect ? 'rgba(0, 255, 65, 0.7)' : 'rgba(255, 0, 64, 0.7)');
                this.ctx.fillRect(this.road.leftX + this.road.width - 50, this.road.y + 20, 200, 40);
                this.ctx.fillStyle = '#000000';
                this.ctx.fillText(rightIsCorrect ? 'SAFE' : 'DANGER', this.road.leftX + this.road.width + 50, this.road.y + 45);
            }
        }
    }
    
    drawQuestionBillboard() {
        if (!this.currentQuestion) return;
        
        // Draw billboard background in the distance
        const billboardY = this.road.y - 150;
        const billboardWidth = 500;
        const billboardHeight = 100;
        const billboardX = this.canvas.width / 2 - billboardWidth / 2;
        
        // Billboard background
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
        this.ctx.fillRect(billboardX, billboardY, billboardWidth, billboardHeight);
        
        // Billboard border
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(billboardX, billboardY, billboardWidth, billboardHeight);
        
        // Question text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'center';
        
        // Wrap text
        const words = this.currentQuestion.question.split(' ');
        const maxWidth = billboardWidth - 20;
        let line = '';
        let y = billboardY + 25;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.ctx.fillText(line, billboardX + billboardWidth/2, y);
                line = words[n] + ' ';
                y += 20;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, billboardX + billboardWidth/2, y);
        
        // Choice indicators - show the actual text options
        this.ctx.font = '10px Orbitron';
        this.ctx.fillStyle = this.currentQuestion.correctSide === 'left' ? '#00ff41' : '#ff0040';
        const leftText = this.currentQuestion.leftText.substring(0, 25) + '...';
        this.ctx.fillText('← LEFT: ' + leftText, billboardX + 60, billboardY + billboardHeight - 15);
        
        this.ctx.fillStyle = this.currentQuestion.correctSide === 'right' ? '#00ff41' : '#ff0040';
        const rightText = this.currentQuestion.rightText.substring(0, 25) + '...';
        this.ctx.fillText('RIGHT: ' + rightText + ' →', billboardX + 320, billboardY + billboardHeight - 15);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a0a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw environment
        this.drawEnvironment();
        
        // Draw road
        this.drawRoad();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw player
        this.drawPlayer();
        
        // Draw particles
        this.drawParticles();
        
        // Draw distance markers
        this.drawDistanceMarkers();
        
        // Draw game status indicators
        this.drawGameStatus();
    }
    
    drawRoad() {
        if (this.road.split || this.road.splitProgress > 0) {
            this.drawSplitRoad();
        } else {
            this.drawNormalRoad();
        }
    }
    
    drawNormalRoad() {
        // Draw road with 3D perspective effect
        const roadTop = this.road.y;
        const roadBottom = this.road.y + this.road.height;
        const roadLeftTop = this.road.leftX + 50;
        const roadRightTop = this.road.leftX + this.road.width - 50;
        const roadLeftBottom = this.road.leftX;
        const roadRightBottom = this.road.leftX + this.road.width;
        
        // Road surface with perspective
        const roadGradient = this.ctx.createLinearGradient(0, roadTop, 0, roadBottom);
        roadGradient.addColorStop(0, '#444444');
        roadGradient.addColorStop(0.5, '#222222');
        roadGradient.addColorStop(1, '#111111');
        
        this.ctx.fillStyle = roadGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(roadLeftTop, roadTop);
        this.ctx.lineTo(roadRightTop, roadTop);
        this.ctx.lineTo(roadRightBottom, roadBottom);
        this.ctx.lineTo(roadLeftBottom, roadBottom);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw center line with perspective
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 10]);
        
        const centerTopX = (roadLeftTop + roadRightTop) / 2;
        const centerBottomX = (roadLeftBottom + roadRightBottom) / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerTopX, roadTop);
        this.ctx.lineTo(centerBottomX, roadBottom);
        this.ctx.stroke();
        
        // Side lines
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(roadLeftTop, roadTop);
        this.ctx.lineTo(roadLeftBottom, roadBottom);
        this.ctx.moveTo(roadRightTop, roadTop);
        this.ctx.lineTo(roadRightBottom, roadBottom);
        this.ctx.stroke();
    }
    
    drawSplitRoad() {
        const progress = this.road.splitProgress;
        const splitDistance = 150 * progress;
        
        // 3D perspective points
        const roadTop = this.road.y;
        const roadBottom = this.road.y + this.road.height;
        const centerX = this.road.leftX + this.road.width / 2;
        
        // Left road section with 3D perspective
        const leftGradient = this.ctx.createLinearGradient(0, roadTop, 0, roadBottom);
        if (this.road.selectedLane === 'left') {
            leftGradient.addColorStop(0, '#004400');
            leftGradient.addColorStop(0.5, '#002200');
            leftGradient.addColorStop(1, '#001100');
        } else {
            leftGradient.addColorStop(0, '#444444');
            leftGradient.addColorStop(0.5, '#222222');
            leftGradient.addColorStop(1, '#111111');
        }
        
        this.ctx.fillStyle = leftGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(this.road.leftX + 25, roadTop); // Top left
        this.ctx.lineTo(centerX - splitDistance/2, roadTop); // Top center-left
        this.ctx.lineTo(centerX - splitDistance, roadBottom); // Bottom center-left
        this.ctx.lineTo(this.road.leftX - splitDistance, roadBottom); // Bottom left
        this.ctx.closePath();
        this.ctx.fill();
        
        // Right road section with 3D perspective
        const rightGradient = this.ctx.createLinearGradient(0, roadTop, 0, roadBottom);
        if (this.road.selectedLane === 'right') {
            rightGradient.addColorStop(0, '#440000');
            rightGradient.addColorStop(0.5, '#220000');
            rightGradient.addColorStop(1, '#110000');
        } else {
            rightGradient.addColorStop(0, '#444444');
            rightGradient.addColorStop(0.5, '#222222');
            rightGradient.addColorStop(1, '#111111');
        }
        
        this.ctx.fillStyle = rightGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + splitDistance/2, roadTop); // Top center-right
        this.ctx.lineTo(this.road.leftX + this.road.width - 25, roadTop); // Top right
        this.ctx.lineTo(this.road.leftX + this.road.width + splitDistance, roadBottom); // Bottom right
        this.ctx.lineTo(centerX + splitDistance, roadBottom); // Bottom center-right
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw road borders with 3D perspective
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        // Left outer edge
        this.ctx.moveTo(this.road.leftX + 25, roadTop);
        this.ctx.lineTo(this.road.leftX - splitDistance, roadBottom);
        // Right outer edge
        this.ctx.moveTo(this.road.leftX + this.road.width - 25, roadTop);
        this.ctx.lineTo(this.road.leftX + this.road.width + splitDistance, roadBottom);
        // Inner split edges
        this.ctx.moveTo(centerX - splitDistance/2, roadTop);
        this.ctx.lineTo(centerX - splitDistance, roadBottom);
        this.ctx.moveTo(centerX + splitDistance/2, roadTop);
        this.ctx.lineTo(centerX + splitDistance, roadBottom);
        this.ctx.stroke();
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.shadowColor = obstacle.color;
            this.ctx.shadowBlur = 10;
            
            if (obstacle.type === 'spike') {
                // Draw triangle spike
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
                this.ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
                this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                // Draw rectangular block
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawPlayer() {
        const playerSize = this.player.width * this.size;
        const x = this.player.x - playerSize/2;
        const y = this.player.y - playerSize;
        
        // Player body - more visible and 3D-like
        this.ctx.fillStyle = this.player.color;
        this.ctx.shadowColor = this.player.color;
        this.ctx.shadowBlur = 20;
        
        // Draw player as a simple character shape
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, playerSize, playerSize, 5);
        this.ctx.fill();
        
        // Add some details to make it look more like a running character
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(x + playerSize/2, y + playerSize/3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // Motion trail effect
        this.ctx.fillStyle = `${this.player.color}44`;
        this.ctx.fillRect(x - 8, y + 8, 8, playerSize - 16);
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(particle.x, particle.y, 4, 4);
        });
    }
    
    drawDistanceMarkers() {
        // Draw distance markers on the side
        const markerInterval = 1000;
        const markerDistance = Math.floor(this.distance / markerInterval) * markerInterval;
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'right';
        
        for (let i = 0; i < 5; i++) {
            const distance = markerDistance + (i * markerInterval);
            const y = this.road.y - 30 - (i * 15);
            if (y > 0) {
                this.ctx.fillText(Math.floor(distance / 100) + 'km', this.canvas.width - 20, y);
            }
        }
        
        this.ctx.textAlign = 'left';
    }
}

// Game control functions
function startGame() {
    if (window.game) {
        window.game.startGame();
    }
}

function restartGame() {
    if (window.game) {
        window.game.startGame();
    }
}

function goToMenu() {
    window.location.href = '/';
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.game = new RunnerGame();
});