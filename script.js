// Advanced Nexus Bird - Modern Game Engine
class NexusBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.bgCanvas = document.getElementById('bgCanvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.neuralCanvas = document.getElementById('neuralCanvas');
        this.neuralCtx = this.neuralCanvas.getContext('2d');
        
        this.initializeElements();
        this.setupGame();
        this.setupEventListeners();
        this.setupBackgroundEffects();
        this.startGameLoop();
    }
    
    initializeElements() {
        this.elements = {
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            highScore: document.getElementById('highScore'),
            scoreProgress: document.getElementById('scoreProgress'),
            syncRate: document.getElementById('syncRate'),
            nodeCount: document.getElementById('nodeCount'),
            achievementFeed: document.getElementById('achievementFeed'),
            gameOverModal: document.getElementById('gameOverModal'),
            finalScore: document.getElementById('finalScore'),
            finalLevel: document.getElementById('finalLevel'),
            modalHighScore: document.getElementById('modalHighScore'),
            efficiency: document.getElementById('efficiency'),
            notifications: document.getElementById('notifications')
        };
    }
    
    setupGame() {
        this.game = {
            bird: {
                x: 80, y: 350, velocity: 0, size: 25,
                trail: [], rotation: 0, shield: false,
                invulnerable: false, energy: 100
            },
            pipes: [],
            powerups: [],
            particles: [],
            neuralNodes: [],
            score: 0,
            level: 1,
            lives: 3,
            highScore: parseInt(localStorage.getItem('nexusBirdHighScore')) || 0,
            gameRunning: false,
            gameStarted: false,
            frameCount: 0,
            achievements: [],
            effects: {
                screenShake: 0,
                timeWarp: 1,
                glitchEffect: false
            }
        };
        
        this.resizeCanvas();
        this.initNeuralNetwork();
        this.updateUI();
    }
    
    resizeCanvas() {
        const maxWidth = Math.min(500, window.innerWidth * 0.6);
        const maxHeight = Math.min(700, window.innerHeight * 0.7);
        const aspectRatio = 500 / 700;
        
        let canvasWidth = maxWidth;
        let canvasHeight = maxWidth / aspectRatio;
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        }
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        // Background canvas
        this.bgCanvas.width = window.innerWidth;
        this.bgCanvas.height = window.innerHeight;
        
        // Adjust game elements
        this.game.bird.x = canvasWidth * 0.16;
        this.game.bird.y = canvasHeight * 0.5;
    }
    
    initNeuralNetwork() {
        this.game.neuralNodes = [];
        for (let i = 0; i < 50; i++) {
            this.game.neuralNodes.push({
                x: Math.random() * 200,
                y: Math.random() * 150,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                pulse: Math.random() * Math.PI * 2,
                connections: []
            });
        }
    }
    
    setupBackgroundEffects() {
        this.backgroundParticles = [];
        for (let i = 0; i < 100; i++) {
            this.backgroundParticles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                hue: Math.random() * 360
            });
        }
    }
    
    setupEventListeners() {
        // Game controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.canvas.addEventListener('click', () => this.jump());
        
        // UI controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        
        // Window events
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Power slots
        document.querySelectorAll('.power-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => this.activatePowerSlot(index));
        });
    }
    
    handleKeyDown(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.jump();
                break;
            case 'ArrowUp':
                if (this.game.bird.energy > 20) {
                    this.superJump();
                }
                break;
            case 'ArrowDown':
                this.dive();
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
    }
    
    jump() {
        if (!this.game.gameStarted) {
            this.startGame();
            return;
        }
        
        if (this.game.gameRunning) {
            this.game.bird.velocity = -14;
            this.game.bird.rotation = -0.3;
            this.createParticles(this.game.bird.x - 20, this.game.bird.y + 10, 8, '#00d4ff');
            this.playSound('jump');
        }
    }
    
    superJump() {
        if (this.game.gameRunning) {
            this.game.bird.velocity = -18;
            this.game.bird.energy -= 20;
            this.createParticles(this.game.bird.x, this.game.bird.y, 15, '#ff0080');
            this.game.effects.screenShake = 10;
            this.playSound('boost');
        }
    }
    
    dive() {
        if (this.game.gameRunning) {
            this.game.bird.velocity += 5;
            this.createParticles(this.game.bird.x, this.game.bird.y + 20, 5, '#8b5cf6');
        }
    }
    
    startGame() {
        this.game.gameStarted = true;
        this.game.gameRunning = true;
        this.showNotification('Neural link established', 'success');
    }
    
    togglePause() {
        if (this.game.gameStarted) {
            this.game.gameRunning = !this.game.gameRunning;
            const pauseBtn = document.getElementById('pauseBtn');
            pauseBtn.innerHTML = this.game.gameRunning ? '<span class="btn-icon">⏸️</span>' : '<span class="btn-icon">▶️</span>';
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    showSettings() {
        this.showNotification('Settings panel coming soon', 'info');
    }
    
    activatePowerSlot(index) {
        const slot = document.getElementById(`slot${index + 1}`);
        if (!slot.classList.contains('active')) {
            slot.classList.add('active');
            this.applyPowerUp(slot.dataset.type);
            setTimeout(() => slot.classList.remove('active'), 5000);
        }
    }
    
    applyPowerUp(type) {
        switch(type) {
            case 'shield':
                this.game.bird.shield = true;
                setTimeout(() => this.game.bird.shield = false, 5000);
                break;
            case 'boost':
                this.game.bird.energy = Math.min(100, this.game.bird.energy + 50);
                break;
            case 'magnet':
                this.game.bird.magnetism = true;
                setTimeout(() => this.game.bird.magnetism = false, 8000);
                break;
        }
        this.showNotification(`${type.toUpperCase()} activated`, 'success');
    }
    
    updateBird() {
        // Physics
        this.game.bird.velocity += 0.7;
        this.game.bird.y += this.game.bird.velocity * this.game.effects.timeWarp;
        this.game.bird.rotation = Math.min(0.5, this.game.bird.velocity * 0.05);
        
        // Energy regeneration
        this.game.bird.energy = Math.min(100, this.game.bird.energy + 0.1);
        
        // Trail effect
        this.game.bird.trail.push({x: this.game.bird.x, y: this.game.bird.y});
        if (this.game.bird.trail.length > 12) this.game.bird.trail.shift();
    }
    
    updatePipes() {
        const pipeFreq = Math.max(80, 150 - this.game.level * 3);
        if (this.game.frameCount % pipeFreq === 0) {
            const gap = Math.max(140, 200 - this.game.level * 2);
            const pipeTop = Math.random() * (this.canvas.height - gap - 100) + 50;
            const isSpecial = Math.random() < 0.2;
            
            this.game.pipes.push({
                x: this.canvas.width,
                top: pipeTop,
                bottom: pipeTop + gap,
                width: 60,
                passed: false,
                special: isSpecial,
                points: isSpecial ? 3 : 1,
                glitch: Math.random() < 0.1
            });
        }
        
        const speed = (3 + this.game.level * 0.3) * this.game.effects.timeWarp;
        this.game.pipes.forEach(pipe => {
            pipe.x -= speed;
            
            if (!pipe.passed && pipe.x + pipe.width < this.game.bird.x) {
                pipe.passed = true;
                this.game.score += pipe.points;
                this.updateLevel();
                this.updateUI();
                this.playSound('score');
            }
        });
        
        this.game.pipes = this.game.pipes.filter(pipe => pipe.x + pipe.width > 0);
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.game.score / 10) + 1;
        if (newLevel > this.game.level) {
            this.game.level = newLevel;
            this.createParticles(this.game.bird.x, this.game.bird.y, 20, '#00ff9f');
            this.game.effects.screenShake = 15;
            this.showNotification(`Wave ${this.game.level} reached!`, 'success');
            this.checkAchievements();
        }
    }
    
    updatePowerups() {
        if (this.game.frameCount % 400 === 0 && Math.random() < 0.4) {
            const types = ['shield', 'energy', 'magnet', 'time'];
            this.game.powerups.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 300) + 150,
                type: types[Math.floor(Math.random() * types.length)],
                pulse: 0,
                collected: false
            });
        }
        
        const speed = (3 + this.game.level * 0.3) * this.game.effects.timeWarp;
        this.game.powerups.forEach(powerup => {
            powerup.x -= speed;
            powerup.pulse += 0.2;
            
            // Magnet effect
            if (this.game.bird.magnetism && !powerup.collected) {
                const dx = this.game.bird.x - powerup.x;
                const dy = this.game.bird.y - powerup.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 100) {
                    powerup.x += dx * 0.1;
                    powerup.y += dy * 0.1;
                }
            }
        });
        
        this.game.powerups = this.game.powerups.filter(p => p.x > -50);
    }
    
    updateParticles() {
        this.game.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.life--;
            particle.size *= 0.98;
        });
        this.game.particles = this.game.particles.filter(p => p.life > 0);
    }
    
    updateNeuralNetwork() {
        this.game.neuralNodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            node.pulse += 0.1;
            
            if (node.x < 0 || node.x > 200) node.vx *= -1;
            if (node.y < 0 || node.y > 150) node.vy *= -1;
        });
        
        // Update neural stats
        this.elements.syncRate.textContent = Math.floor(95 + Math.sin(this.game.frameCount * 0.1) * 5) + '%';
        this.elements.nodeCount.textContent = this.game.neuralNodes.length;
    }
    
    updateBackgroundEffects() {
        this.backgroundParticles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.hue += 0.5;
            
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;
        });
    }
    
    checkCollisions() {
        if (this.game.bird.invulnerable) return;
        
        // Boundaries
        if (this.game.bird.y - this.game.bird.size <= 0 || 
            this.game.bird.y + this.game.bird.size >= this.canvas.height) {
            if (!this.game.bird.shield) {
                this.loseLife();
            } else {
                this.game.bird.y = Math.max(this.game.bird.size, 
                    Math.min(this.canvas.height - this.game.bird.size, this.game.bird.y));
                this.game.bird.velocity = 0;
            }
            return;
        }
        
        // Pipes
        for (let pipe of this.game.pipes) {
            if (this.game.bird.x + this.game.bird.size > pipe.x && 
                this.game.bird.x - this.game.bird.size < pipe.x + pipe.width) {
                if (this.game.bird.y - this.game.bird.size < pipe.top || 
                    this.game.bird.y + this.game.bird.size > pipe.bottom) {
                    if (!this.game.bird.shield) {
                        this.loseLife();
                        return;
                    }
                }
            }
        }
        
        // Powerups
        for (let i = this.game.powerups.length - 1; i >= 0; i--) {
            const powerup = this.game.powerups[i];
            const dist = Math.hypot(this.game.bird.x - powerup.x, this.game.bird.y - powerup.y);
            if (dist < this.game.bird.size + 20 && !powerup.collected) {
                powerup.collected = true;
                this.collectPowerup(powerup.type);
                this.game.powerups.splice(i, 1);
            }
        }
    }
    
    collectPowerup(type) {
        switch(type) {
            case 'shield':
                this.game.bird.shield = true;
                setTimeout(() => this.game.bird.shield = false, 5000);
                break;
            case 'energy':
                this.game.bird.energy = 100;
                break;
            case 'magnet':
                this.game.bird.magnetism = true;
                setTimeout(() => this.game.bird.magnetism = false, 8000);
                break;
            case 'time':
                this.game.effects.timeWarp = 0.5;
                setTimeout(() => this.game.effects.timeWarp = 1, 3000);
                break;
        }
        this.createParticles(this.game.bird.x, this.game.bird.y, 15, '#00ff9f');
        this.showNotification(`${type.toUpperCase()} collected!`, 'success');
    }
    
    loseLife() {
        if (this.game.bird.invulnerable) return;
        
        this.game.lives--;
        this.createParticles(this.game.bird.x, this.game.bird.y, 25, '#ff0080');
        this.game.effects.screenShake = 20;
        this.game.effects.glitchEffect = true;
        setTimeout(() => this.game.effects.glitchEffect = false, 500);
        
        if (this.game.lives <= 0) {
            this.gameOver();
        } else {
            this.game.bird.y = this.canvas.height * 0.5;
            this.game.bird.velocity = 0;
            this.game.bird.invulnerable = true;
            setTimeout(() => this.game.bird.invulnerable = false, 2000);
            this.showNotification(`${this.game.lives} lives remaining`, 'warning');
        }
        this.updateUI();
    }
    
    gameOver() {
        this.game.gameRunning = false;
        
        if (this.game.score > this.game.highScore) {
            this.game.highScore = this.game.score;
            localStorage.setItem('nexusBirdHighScore', this.game.highScore);
            this.showNotification('New high score!', 'success');
        }
        
        const efficiency = Math.round((this.game.score / Math.max(1, this.game.frameCount / 60)) * 100);
        
        this.elements.finalScore.textContent = this.game.score;
        this.elements.finalLevel.textContent = this.game.level;
        this.elements.modalHighScore.textContent = this.game.highScore;
        this.elements.efficiency.textContent = efficiency + '%';
        
        this.elements.gameOverModal.classList.add('active');
    }
    
    restartGame() {
        this.game.bird = {
            x: this.canvas.width * 0.16, y: this.canvas.height * 0.5, 
            velocity: 0, size: 25, trail: [], rotation: 0, 
            shield: false, invulnerable: false, energy: 100
        };
        this.game.pipes = [];
        this.game.powerups = [];
        this.game.particles = [];
        this.game.score = 0;
        this.game.level = 1;
        this.game.lives = 3;
        this.game.gameRunning = true;
        this.game.gameStarted = true;
        this.game.frameCount = 0;
        this.game.effects = { screenShake: 0, timeWarp: 1, glitchEffect: false };
        
        this.updateUI();
        this.elements.gameOverModal.classList.remove('active');
    }
    
    checkAchievements() {
        const achievements = [
            { id: 'first', score: 1, text: 'Neural link established' },
            { id: 'wave5', level: 5, text: 'Wave master' },
            { id: 'score50', score: 50, text: 'System override' },
            { id: 'wave10', level: 10, text: 'Neural transcendence' }
        ];
        
        achievements.forEach(ach => {
            const trigger = ach.score ? this.game.score === ach.score : this.game.level === ach.level;
            if (trigger && !this.game.achievements.includes(ach.id)) {
                this.game.achievements.push(ach.id);
                this.showAchievement(ach.text);
            }
        });
    }
    
    showAchievement(text) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement-item';
        achievement.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">${text}</div>
        `;
        this.elements.achievementFeed.appendChild(achievement);
        this.elements.achievementFeed.scrollTop = this.elements.achievementFeed.scrollHeight;
        
        setTimeout(() => {
            if (achievement.parentNode) {
                achievement.style.opacity = '0';
                setTimeout(() => achievement.remove(), 500);
            }
        }, 5000);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        this.elements.notifications.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    createParticles(x, y, count, color = '#00d4ff') {
        for (let i = 0; i < count; i++) {
            this.game.particles.push({
                x: x + Math.random() * 30 - 15,
                y: y + Math.random() * 30 - 15,
                vx: Math.random() * 8 - 4,
                vy: Math.random() * 8 - 4,
                life: 40,
                maxLife: 40,
                size: Math.random() * 4 + 2,
                color: color,
                alpha: 1
            });
        }
    }
    
    playSound(type) {
        // Web Audio API sound generation
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch(type) {
            case 'jump':
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
                break;
            case 'score':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.2);
                break;
            case 'boost':
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    drawBird() {
        const ctx = this.ctx;
        const bird = this.game.bird;
        
        // Trail
        bird.trail.forEach((pos, i) => {
            const alpha = i / bird.trail.length;
            ctx.globalAlpha = alpha * 0.6;
            ctx.fillStyle = bird.shield ? '#00ffff' : '#00d4ff';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, bird.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Invulnerability effect
        if (bird.invulnerable && Math.floor(Date.now() / 150) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rotation);
        
        // Shield
        if (bird.shield) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, bird.size + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Bird body with gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.size);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(0.7, '#0099cc');
        gradient.addColorStop(1, '#006699');
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, bird.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(10, -6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
    
    drawPipes() {
        this.game.pipes.forEach(pipe => {
            const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
            
            if (pipe.special) {
                gradient.addColorStop(0, '#ff0080');
                gradient.addColorStop(0.5, '#ff4da6');
                gradient.addColorStop(1, '#ff0080');
                this.ctx.shadowColor = '#ff0080';
                this.ctx.shadowBlur = 20;
            } else {
                gradient.addColorStop(0, '#00ff9f');
                gradient.addColorStop(0.5, '#4dffbf');
                gradient.addColorStop(1, '#00ff9f');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
            this.ctx.fillRect(pipe.x, pipe.bottom, pipe.width, this.canvas.height - pipe.bottom);
            
            // Pipe caps
            this.ctx.fillRect(pipe.x - 8, pipe.top - 30, pipe.width + 16, 30);
            this.ctx.fillRect(pipe.x - 8, pipe.bottom, pipe.width + 16, 30);
            
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawPowerups() {
        this.game.powerups.forEach(powerup => {
            if (powerup.collected) return;
            
            const scale = 1 + Math.sin(powerup.pulse) * 0.3;
            const icons = {
                shield: '🛡️',
                energy: '⚡',
                magnet: '🧲',
                time: '⏰'
            };
            
            this.ctx.save();
            this.ctx.translate(powerup.x, powerup.y);
            this.ctx.scale(scale, scale);
            
            // Glow effect
            this.ctx.shadowColor = '#00ff9f';
            this.ctx.shadowBlur = 20;
            this.ctx.fillStyle = 'rgba(0, 255, 159, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(icons[powerup.type], 0, 10);
            
            this.ctx.restore();
        });
    }
    
    drawParticles() {
        this.game.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 5;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
    
    drawNeuralNetwork() {
        const ctx = this.neuralCtx;
        ctx.clearRect(0, 0, 200, 150);
        
        // Draw connections
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 1;
        this.game.neuralNodes.forEach((node, i) => {
            this.game.neuralNodes.slice(i + 1).forEach(otherNode => {
                const dist = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
                if (dist < 80) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    ctx.stroke();
                }
            });
        });
        
        // Draw nodes
        this.game.neuralNodes.forEach(node => {
            const pulse = Math.sin(node.pulse) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(0, 212, 255, ${0.5 + pulse * 0.5})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size * (0.8 + pulse * 0.4), 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawBackgroundEffects() {
        const ctx = this.bgCtx;
        ctx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
        
        this.backgroundParticles.forEach(particle => {
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = `hsl(${particle.hue}, 70%, 60%)`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
    
    drawStartScreen() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#00d4ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const mainFontSize = Math.max(20, this.canvas.width * 0.08);
        ctx.font = `${mainFontSize}px Orbitron`;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.fillText('NEURAL LINK READY', this.canvas.width/2, this.canvas.height/2 - 40);
        
        const subFontSize = Math.max(14, this.canvas.width * 0.04);
        ctx.font = `${subFontSize}px Rajdhani`;
        ctx.shadowBlur = 10;
        ctx.fillText('Press SPACE or CLICK to initialize', this.canvas.width/2, this.canvas.height/2 + 20);
        
        ctx.shadowBlur = 0;
    }
    
    updateUI() {
        this.elements.score.textContent = this.game.score;
        this.elements.level.textContent = this.game.level;
        this.elements.lives.textContent = this.game.lives;
        this.elements.highScore.textContent = this.game.highScore;
        
        // Score progress bar
        const progress = (this.game.score % 10) * 10;
        this.elements.scoreProgress.style.width = progress + '%';
    }
    
    gameLoop() {
        // Clear main canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Screen shake effect
        if (this.game.effects.screenShake > 0) {
            this.ctx.save();
            this.ctx.translate(
                Math.random() * this.game.effects.screenShake - this.game.effects.screenShake/2,
                Math.random() * this.game.effects.screenShake - this.game.effects.screenShake/2
            );
            this.game.effects.screenShake *= 0.9;
        }
        
        if (!this.game.gameStarted) {
            this.drawStartScreen();
        } else if (this.game.gameRunning) {
            this.game.frameCount++;
            
            // Update game objects
            this.updateBird();
            this.updatePipes();
            this.updatePowerups();
            this.updateParticles();
            this.updateNeuralNetwork();
            this.checkCollisions();
            
            // Draw game objects
            this.drawPipes();
            this.drawPowerups();
            this.drawParticles();
            this.drawBird();
        } else {
            // Paused state - still draw everything
            this.drawPipes();
            this.drawPowerups();
            this.drawParticles();
            this.drawBird();
            
            // Pause overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00d4ff';
            this.ctx.font = '32px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
        }
        
        if (this.game.effects.screenShake > 0) {
            this.ctx.restore();
        }
        
        // Update background effects
        this.updateBackgroundEffects();
        this.drawBackgroundEffects();
        this.drawNeuralNetwork();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startGameLoop() {
        this.gameLoop();
    }
}

// Global functions for HTML onclick events
function restartGame() {
    if (window.nexusBird) {
        window.nexusBird.restartGame();
    }
}

function showLeaderboard() {
    if (window.nexusBird) {
        const score = window.nexusBird.game.score;
        const highScore = window.nexusBird.game.highScore;
        const level = window.nexusBird.game.level;
        window.nexusBird.showNotification(`High Score: ${highScore} | Current: ${score} | Wave: ${level}`, 'info');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nexusBird = new NexusBird();
});