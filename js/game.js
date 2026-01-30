
import { AssetManager } from './assets.js';
import { InputManager } from './input.js';
import { ScoreManager } from './score.js';
import { RankingManager } from './ranking.js';
import { GameMechanics } from './mechanics.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Systems
        this.assets = new AssetManager();
        this.input = new InputManager();
        this.score = new ScoreManager();
        this.ranking = new RankingManager();
        this.mechanics = null; // Init after manifest load

        // State
        this.state = 'BOOT'; // BOOT, TITLE, TUTORIAL, COUNTDOWN, PLAY, RESULT, RANKING
        this.lastFrameTime = 0;

        // Game specific
        this.playTime = 30; // seconds
        this.timeLeft = this.playTime;
        this.catchZone = { y_start: 0.75, y_end: 1.0 }; // Bottom 25%

        // UI references
        this.ui = {
            title: document.getElementById('screen-title'),
            tutorial: document.getElementById('screen-tutorial'),
            result: document.getElementById('screen-result'),
            ranking: document.getElementById('screen-ranking'),
            hud: document.getElementById('hud'),
            score: document.getElementById('score-display'),
            timer: document.getElementById('timer-display'),
            resultTable: document.getElementById('result-table-body'),
            rankingTable: document.getElementById('ranking-table-body')
        };

        // Play State
        this.items = []; // Visual items (falling/popped)
        this.feedbackEffects = []; // Score popups etc

        this.init();
    }

    async init() {
        // Resize handling
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Load assets
        await this.assets.loadManifest();
        await this.assets.preloadImages();

        // Init Mechanics with loaded manifest
        this.mechanics = new GameMechanics(this.assets.getManifest());

        // Bind UI events
        document.getElementById('btn-start').addEventListener('click', () => this.startTutorial());
        document.getElementById('btn-ranking-next').addEventListener('click', () => this.showRanking());
        document.getElementById('btn-title').addEventListener('click', () => this.toTitle());

        // Start Loop
        this.state = 'TITLE';
        this.toggleUI('title');
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.state === 'PLAY') {
            this.updatePlay(dt);
        }

        // Feedback effects update (visual only)
        this.feedbackEffects = this.feedbackEffects.filter(e => {
            e.life -= dt;
            e.y -= 100 * dt; // Float up
            return e.life > 0;
        });
    }

    updatePlay(dt) {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.endGame();
        }

        this.ui.timer.textContent = Math.ceil(this.timeLeft);

        // Input & Mechanics
        const players = this.input.getPlayers();
        players.forEach(p => {
            // Mechanics check
            const droppedItem = this.mechanics.checkInteraction(p, this.catchZone);
            if (droppedItem) {
                this.onItemGet(p, droppedItem);
            }
        });
    }

    onItemGet(player, item) {
        // 1. Add Score
        this.score.addScore(player.id, item);
        this.ui.score.textContent = this.score.totalScore;

        // 2. Visual Feedback
        // Show item image at player position
        const xPx = player.x * this.canvas.width;
        const yPx = player.y * this.canvas.height;

        this.feedbackEffects.push({
            x: xPx,
            y: yPx,
            text: `+${item.score}`,
            life: 1.0,
            image: this.assets.getCharacterImage(item.character_filename), // or book
            scale: 0
        });

        // 3. Play Sound (if we had audio)
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#0f0f13';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Catch Zone
        const zoneY = this.catchZone.y_start * this.canvas.height;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fillRect(0, zoneY, this.canvas.width, this.canvas.height - zoneY);
        this.ctx.strokeStyle = `rgba(59, 130, 246, 0.5)`; // Primary color
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, zoneY);
        this.ctx.lineTo(this.canvas.width, zoneY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw Text "CATCH ZONE"
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.font = '20px Outfit';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("CATCH ZONE", this.canvas.width / 2, zoneY + 30);

        // Draw Players (Rings)
        if (this.state === 'PLAY' || this.state === 'TUTORIAL' || this.state === 'COUNTDOWN') {
            const players = this.input.getPlayers();
            players.forEach(p => {
                const x = p.x * this.canvas.width;
                const y = p.y * this.canvas.height;

                this.ctx.beginPath();
                this.ctx.arc(x, y, 40, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#f43f5e'; // Accent color
                this.ctx.lineWidth = 4;
                this.ctx.stroke();

                // Ring ID
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '16px Inter';
                this.ctx.fillText(`P${p.id}`, x, y + 60);
            });
        }

        // Draw Feedback Effects
        this.feedbackEffects.forEach(e => {
            // Draw Image
            if (e.image) {
                const size = 100;
                this.ctx.globalAlpha = Math.min(1, e.life * 2);
                this.ctx.drawImage(e.image, e.x - size / 2, e.y - size / 2, size, size);
            }

            // Draw Text
            this.ctx.fillStyle = '#ffcc00';
            this.ctx.font = 'bold 30px Outfit';
            this.ctx.fillText(e.text, e.x, e.y - 60);
            this.ctx.globalAlpha = 1.0;
        });
    }

    startTutorial() {
        this.toggleUI('tutorial');
        this.state = 'TUTORIAL';
        setTimeout(() => this.startCountdown(), 2000); // Short tutorial
    }

    startCountdown() {
        // Ideally show a countdown UI, but for MVP just wait
        this.state = 'COUNTDOWN';
        this.toggleUI('hud'); // Show HUD
        this.score.reset(); // Reset Scores
        this.ui.score.textContent = "0";
        this.timeLeft = this.playTime;

        setTimeout(() => {
            this.state = 'PLAY';
        }, 1000);
    }

    endGame() {
        this.state = 'RESULT';

        // Build Result Table
        const summary = this.score.getSummary();
        this.ui.resultTable.innerHTML = ''; // Clear

        summary.history.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${this.assets.paths.characters_dir}${item.data.character_filename}" height="40" style="vertical-align:middle; margin-right:10px;"> ${item.data.display_name}</td>
                <td>${item.count}</td>
                <td>${item.scoreSum}</td>
                <td>${item.raritySum} pts</td>
            `;
            this.ui.resultTable.appendChild(row);
        });

        // Add Total Row
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.innerHTML = `
            <td>TOTAL</td>
            <td>-</td>
            <td>${summary.totalScore}</td>
            <td>${summary.raritySum} pts</td>
        `;
        this.ui.resultTable.appendChild(totalRow);

        this.toggleUI('result');

        // Save to Ranking
        this.ranking.saveScore({
            totalScore: summary.totalScore,
            raritySum: summary.raritySum
        });
    }

    showRanking() {
        this.state = 'RANKING';

        const data = this.ranking.getRanking();
        this.ui.rankingTable.innerHTML = '';

        data.forEach((entry, index) => {
            const date = new Date(entry.timestamp).toLocaleTimeString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${index + 1}</td>
                <td>${entry.totalScore}</td>
                <td>${entry.raritySum}</td>
                <td>${date}</td>
            `;
            this.ui.rankingTable.appendChild(row);
        });

        this.toggleUI('ranking');
    }

    toTitle() {
        this.state = 'TITLE';
        this.toggleUI('title');
    }

    toggleUI(screenName) {
        // Hide all
        Object.values(this.ui).forEach(el => {
            if (el && el.classList) el.classList.add('hidden');
        });

        // Show specific
        if (screenName === 'title') this.ui.title.classList.remove('hidden');
        if (screenName === 'tutorial') this.ui.tutorial.classList.remove('hidden');
        if (screenName === 'result') this.ui.result.classList.remove('hidden');
        if (screenName === 'ranking') this.ui.ranking.classList.remove('hidden');

        // HUD is special, stays on during PLAY
        if (this.state === 'PLAY' || this.state === 'COUNTDOWN') {
            this.ui.hud.classList.remove('hidden');
        }
    }
}
