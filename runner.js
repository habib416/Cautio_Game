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
    this.speed = 1.0;
    this.size = 1.0;
    this.correctAnswers = 0;

    // Player properties
    this.player = {
      x: 100,
      y: 0, // set in startGame
      width: 30,
      height: 40,
      lane: 1, // 0 = top, 1 = middle, 2 = bottom
      velocityY: 0,
      onGround: true,
      color: '#00ffff'
    };

    // Road
    this.road = {
      y: 440,
      height: 160,
      lanes: []
    };

    // Game objects
    this.obstacles = [];
    this.questions = [];
    this.particles = [];
    this.activeQuestion = null;

    // Controls
    this.keys = {};
    this.lastQuestionDistance = 0;

    // Game constants
    this.GRAVITY = 0.8;
    this.JUMP_POWER = -15;
    this.QUESTION_INTERVAL = 200;
    this.MAX_DISTANCE = 10000;

    this.setupEventListeners();
    this.loadQuestions();
    this.gameLoop();
  }

  // ---------- Event Listeners ----------
  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (this.gameState === 'playing') {
        if (e.code === 'Space') {
          if (this.player.onGround) {
            this.player.velocityY = this.JUMP_POWER;
            this.player.onGround = false;
          }
        }
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
          this.player.lane = Math.max(0, this.player.lane - 1);
          this.snapToLane();
        }
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          this.player.lane = Math.min(2, this.player.lane + 1);
          this.snapToLane();
        }
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          this.player.x = Math.max(20, this.player.x - 20);
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          this.player.x = Math.min(this.canvas.width - this.player.width - 20, this.player.x + 20);
        }
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = Math.min(1200, container.clientWidth - 40);
    this.canvas.height = Math.min(600, window.innerHeight - 200);
    this.road.y = this.canvas.height - this.road.height - 20;

    const laneHeight = this.road.height / 3;
    this.road.lanes = [
      this.road.y,
      this.road.y + laneHeight,
      this.road.y + 2 * laneHeight
    ];
  }

  snapToLane() {
    const laneHeight = this.road.height / 3;
    this.player.y = this.road.lanes[this.player.lane] + laneHeight / 2 - this.player.height / 2;
  }

  // ---------- Game Logic ----------
  loadQuestions() {
    if (typeof window.runnerQuestions !== 'undefined') {
      this.questions = [...window.runnerQuestions].sort(() => Math.random() - 0.5);
    } else {
      this.questions = [];
    }
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.distance = 0;
    this.lives = 5;
    this.speed = 1.0;
    this.size = 1.0;
    this.correctAnswers = 0;
    this.lastQuestionDistance = 0;

    this.player.x = 50;
    this.player.lane = 1;
    this.snapToLane();
    this.player.velocityY = 0;
    this.player.onGround = true;

    this.obstacles = [];
    this.particles = [];
    this.activeQuestion = null;

    document.getElementById('controlsHint').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.querySelectorAll('.heart').forEach(h => h.classList.remove('lost'));
    this.updateHUD();
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (this.gameState !== 'playing') return;

    this.distance += this.speed;
    this.score += Math.floor(this.speed);

    if (this.distance - this.lastQuestionDistance >= this.QUESTION_INTERVAL && this.questions.length > 0 && !this.activeQuestion) {
      this.spawnQuestion();
    }

    this.updatePlayer();
    this.updateObstacles();
    this.updateParticles();

    if (!this.activeQuestion) {
      this.generateObstacles();
    } else {
      this.checkQuestionCollision();
    }

    if (this.distance >= this.MAX_DISTANCE) {
      this.endGame('win');
    }

    this.updateHUD();
  }

  updatePlayer() {
    this.player.velocityY += this.GRAVITY;
    this.player.y += this.player.velocityY;

    const groundY = this.road.lanes[this.player.lane] + this.road.height / 6 - this.player.height / 2;
    if (this.player.y >= groundY) {
      this.player.y = groundY;
      this.player.velocityY = 0;
      this.player.onGround = true;
    }

    this.checkObstacleCollisions();
  }

  spawnQuestion() {
    const question = this.questions.pop();
    this.activeQuestion = {
      text: question.question,
      correct: question.correct,
      incorrect: question.incorrect,
      x: this.canvas.width - 400
    };
    this.correctLane = Math.random() < 0.5 ? 0 : 2; // randomize
    this.lastQuestionDistance = this.distance;
  }

  checkQuestionCollision() {
    if (!this.activeQuestion) return;
    if (this.player.x + this.player.width >= this.activeQuestion.x) {
      if (this.player.lane === this.correctLane) {
        this.correctAnswers++;
        this.score += 100;
        this.speed = Math.min(this.speed + 0.2, 3.0);
      } else {
        this.score = Math.max(this.score - 50, 0);
        this.loseLife();
      }
      this.player.x = 50;
      this.player.lane = 1;
      this.snapToLane();
      this.activeQuestion = null;
    }
  }

  generateObstacles() {
    if (Math.random() < 0.02 * this.speed) {
      const lane = Math.floor(Math.random() * 3);
      const laneY = this.road.lanes[lane] + this.road.height / 6 - 20;
      const obstacle = {
        x: this.canvas.width,
        y: laneY,
        width: 30 + Math.random() * 20,
        height: 40,
        color: '#ff0040'
      };
      this.obstacles.push(obstacle);
    }
  }

  updateObstacles() {
    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.x -= this.speed * 8;
      return obstacle.x + obstacle.width > 0;
    });
  }

  checkObstacleCollisions() {
    for (let obstacle of this.obstacles) {
      if (this.isColliding(this.player, obstacle)) {
        this.loseLife();
        this.createImpactParticles(this.player.x, this.player.y);
        this.obstacles = this.obstacles.filter(obs => obs !== obstacle);
        break;
      }
    }
  }

  isColliding(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
  }

  // ---------- Lives & Particles ----------
  loseLife() {
    this.lives--;
    const hearts = document.querySelectorAll('.heart');
    if (hearts[this.lives]) hearts[this.lives].classList.add('lost');
    if (this.lives <= 0) this.endGame('lose');
  }

  createImpactParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 30
      });
    }
  }

  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      return p.life > 0;
    });
  }

  drawParticles() {
    this.ctx.save();
    this.ctx.fillStyle = '#ff0040';
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / 30));
      this.ctx.globalAlpha = alpha;
      this.ctx.fillRect(p.x, p.y, 4, 4);
    }
    this.ctx.restore();
  }

  // ---------- End Game ----------
  endGame() {
    this.gameState = 'ended';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalDistance').textContent = Math.floor(this.distance / 10) + 'km';
    document.getElementById('correctAnswers').textContent = this.correctAnswers;
    this.saveHighScores();
    document.getElementById('gameOver').style.display = 'flex';
  }

  saveHighScores() {
    const best = parseInt(localStorage.getItem('cautio-best-runner-score') || '0');
    const total = parseInt(localStorage.getItem('cautio-total-distance') || '0');
    if (this.score > best) localStorage.setItem('cautio-best-runner-score', this.score.toString());
    localStorage.setItem('cautio-total-distance', total + Math.floor(this.distance / 10));
  }

  updateHUD() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('distance').textContent = Math.floor(this.distance / 10) + 'km';
    document.getElementById('speed').textContent = this.speed.toFixed(1) + 'x';
    document.getElementById('size').textContent = this.size.toFixed(1) + 'x';
  }

  // ---------- Render ----------
  render() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const g = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    g.addColorStop(0, '#1a1a2e');
    g.addColorStop(1, '#0a0a0a');
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawRoad();
    this.drawObstacles();
    this.drawPlayer();
    this.drawParticles();
    this.drawQuestion();
  }

  drawRoad() {
    const rg = this.ctx.createLinearGradient(0, this.road.y, 0, this.road.y + this.road.height);
    rg.addColorStop(0, '#333'); rg.addColorStop(0.5, '#222'); rg.addColorStop(1, '#111');
    this.ctx.fillStyle = rg;
    this.ctx.fillRect(0, this.road.y, this.canvas.width, this.road.height);

    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([20, 20]);
    const lineY = this.road.y + this.road.height / 2;
    this.ctx.beginPath(); this.ctx.moveTo(0, lineY); this.ctx.lineTo(this.canvas.width, lineY); this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawObstacles() {
    for (let o of this.obstacles) {
      this.ctx.fillStyle = o.color;
      this.ctx.fillRect(o.x, o.y, o.width, o.height);
    }
  }

  drawPlayer() {
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
  }

  drawQuestion() {
    if (!this.activeQuestion) return;
    const laneHeight = this.road.height / 3, blockWidth = 180, x = this.activeQuestion.x;

    if (this.correctLane === 0) {
      this.ctx.fillStyle = '#006600';
      this.ctx.fillRect(x, this.road.lanes[0], blockWidth, laneHeight);
      this.ctx.fillStyle = '#fff'; this.ctx.fillText(this.activeQuestion.correct, x + 90, this.road.lanes[0] + laneHeight / 2);

      this.ctx.fillStyle = '#660000';
      this.ctx.fillRect(x, this.road.lanes[2], blockWidth, laneHeight);
      this.ctx.fillStyle = '#fff'; this.ctx.fillText(this.activeQuestion.incorrect, x + 90, this.road.lanes[2] + laneHeight / 2);
    } else {
      this.ctx.fillStyle = '#660000';
      this.ctx.fillRect(x, this.road.lanes[0], blockWidth, laneHeight);
      this.ctx.fillStyle = '#fff'; this.ctx.fillText(this.activeQuestion.incorrect, x + 90, this.road.lanes[0] + laneHeight / 2);

      this.ctx.fillStyle = '#006600';
      this.ctx.fillRect(x, this.road.lanes[2], blockWidth, laneHeight);
      this.ctx.fillStyle = '#fff'; this.ctx.fillText(this.activeQuestion.correct, x + 90, this.road.lanes[2] + laneHeight / 2);
    }

    // Wrap question text
    this.ctx.fillStyle = '#fff'; this.ctx.font = '16px Orbitron'; this.ctx.textAlign = 'center';
    const words = this.activeQuestion.text.split(" "), lines = []; let line = "";
    const maxWidth = blockWidth * 2 - 75;
    for (let w of words) {
      const test = line + w + " ";
      if (this.ctx.measureText(test).width > maxWidth) { lines.push(line); line = w + " "; }
      else line = test;
    }
    lines.push(line);
    lines.forEach((ln, i) => this.ctx.fillText(ln.trim(), x + blockWidth / 2, this.road.y - 30 - (lines.length - i - 1) * 20));
  }
}

// Control functions
function startGame() { if (window.game) window.game.startGame(); }
function restartGame() { if (window.game) window.game.startGame(); }
function goToMenu() { window.location.href = 'index.html'; }

// Init
document.addEventListener('DOMContentLoaded', () => { window.game = new RunnerGame(); });
