// js/game.js
import { AssetManager } from "./assets.js";
import { InputManager } from "./input.js";
import { ScoreManager } from "./score.js";
import { RankingManager } from "./ranking.js";
import { GameMechanics } from "./mechanics.js";

export class Game {
    constructor() {
        this.canvas = document.getElementById("game-canvas");
        this.ctx = this.canvas.getContext("2d");

        this.assets = new AssetManager();
        this.input = new InputManager();
        this.score = new ScoreManager();
        this.ranking = new RankingManager();
        this.mechanics = null;

        this.state = "BOOT"; // BOOT, TITLE, TUTORIAL, COUNTDOWN, PLAY, RESULT, RANKING
        this.lastFrameTime = 0;

        this.playTime = 30;
        this.timeLeft = this.playTime;
        this.catchZone = { y_start: 0.75, y_end: 1.0 };

        this.ui = {
            title: document.getElementById("screen-title"),
            tutorial: document.getElementById("screen-tutorial"),
            result: document.getElementById("screen-result"),
            ranking: document.getElementById("screen-ranking"),
            hud: document.getElementById("hud"),
            score: document.getElementById("score-display"),
            timer: document.getElementById("timer-display"),
            resultTable: document.getElementById("result-table-body"),
            rankingTable: document.getElementById("ranking-table-body"),
        };

        this.feedbackEffects = [];

        this.init();
    }

    async init() {
        this.resize();
        window.addEventListener("resize", () => this.resize());

        await this.assets.loadManifest();
        await this.assets.preloadImages();

        this.mechanics = new GameMechanics(this.assets.getManifest());

        document.getElementById("btn-start").addEventListener("click", () => this.startTutorial());
        document.getElementById("btn-ranking-next").addEventListener("click", () => this.showRanking());
        document.getElementById("btn-title").addEventListener("click", () => this.toTitle());

        this.state = "TITLE";
        this.toggleUI("title");
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
        if (this.state === "PLAY") this.updatePlay(dt);

        this.feedbackEffects = this.feedbackEffects.filter((e) => {
            e.life -= dt;
            e.y -= 100 * dt;
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

        const players = this.input.getPlayers();
        players.forEach((p) => {
            const droppedItem = this.mechanics.checkInteraction(p, this.catchZone);
            if (droppedItem) this.onItemGet(p, droppedItem);
        });
    }

    onItemGet(player, item) {
        this.score.addScore(player.id, item);
        this.ui.score.textContent = this.score.totalScore;

        const xPx = player.x * this.canvas.width;
        const yPx = player.y * this.canvas.height;

        // ★ここが核心：filenameではなく item（type object）を渡す
        const img = this.assets.getCharacterImage(item);

        this.feedbackEffects.push({
            x: xPx,
            y: yPx,
            text: `+${item.score || 0}`,
            life: 1.0,
            image: img,
        });

        // デバッグ（壊れてる2件の特定が一発でできます）
        if (item._charMissing) {
            console.warn("[CATCH] missing char image:", item.type_id, item.display_name, item._charCandidates);
        }
    }

    draw() {
        this.ctx.fillStyle = "#0f0f13";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const zoneY = this.catchZone.y_start * this.canvas.height;
        this.ctx.fillStyle = "rgba(255,255,255,0.05)";
        this.ctx.fillRect(0, zoneY, this.canvas.width, this.canvas.height - zoneY);

        this.ctx.strokeStyle = "rgba(59,130,246,0.5)";
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, zoneY);
        this.ctx.lineTo(this.canvas.width, zoneY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillStyle = "rgba(255,255,255,0.2)";
        this.ctx.font = "20px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText("CATCH ZONE", this.canvas.width / 2, zoneY + 30);

        if (this.state === "PLAY" || this.state === "TUTORIAL" || this.state === "COUNTDOWN") {
            const players = this.input.getPlayers();
            players.forEach((p) => {
                const x = p.x * this.canvas.width;
                const y = p.y * this.canvas.height;

                this.ctx.beginPath();
                this.ctx.arc(x, y, 40, 0, Math.PI * 2);
                this.ctx.strokeStyle = "#f43f5e";
                this.ctx.lineWidth = 4;
                this.ctx.stroke();

                this.ctx.fillStyle = "#fff";
                this.ctx.font = "16px sans-serif";
                this.ctx.fillText(`P${p.id}`, x, y + 60);
            });
        }

        this.feedbackEffects.forEach((e) => {
            if (e.image) {
                const size = 100;
                this.ctx.globalAlpha = Math.min(1, e.life * 2);
                this.ctx.drawImage(e.image, e.x - size / 2, e.y - size / 2, size, size);
            }
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.font = "bold 30px sans-serif";
            this.ctx.fillText(e.text, e.x, e.y - 60);
            this.ctx.globalAlpha = 1.0;
        });
    }

    startTutorial() {
        this.toggleUI("tutorial");
        this.state = "TUTORIAL";
        setTimeout(() => this.startCountdown(), 2000);
    }

    startCountdown() {
        this.state = "COUNTDOWN";
        this.toggleUI("hud");

        this.score.reset();
        this.ui.score.textContent = "0";
        this.timeLeft = this.playTime;

        setTimeout(() => {
            this.state = "PLAY";
        }, 1000);
    }

    endGame() {
        this.state = "RESULT";
        const summary = this.score.getSummary();
        this.ui.resultTable.innerHTML = "";

        summary.history.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${item.data.display_name}</td>
        <td>${item.count}</td>
        <td>${item.scoreSum}</td>
        <td>${item.raritySum} pts</td>
      `;
            this.ui.resultTable.appendChild(row);
        });

        const totalRow = document.createElement("tr");
        totalRow.style.fontWeight = "bold";
        totalRow.innerHTML = `
      <td>TOTAL</td>
      <td>-</td>
      <td>${summary.totalScore}</td>
      <td>${summary.raritySum} pts</td>
    `;
        this.ui.resultTable.appendChild(totalRow);

        this.toggleUI("result");
        this.ranking.saveScore({ totalScore: summary.totalScore, raritySum: summary.raritySum });
    }

    showRanking() {
        this.state = "RANKING";
        const data = this.ranking.getRanking();
        this.ui.rankingTable.innerHTML = "";

        data.forEach((entry, index) => {
            const date = new Date(entry.timestamp).toLocaleTimeString();
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>#${index + 1}</td>
        <td>${entry.totalScore}</td>
        <td>${entry.raritySum}</td>
        <td>${date}</td>
      `;
            this.ui.rankingTable.appendChild(row);
        });

        this.toggleUI("ranking");
    }

    toTitle() {
        this.state = "TITLE";
        this.toggleUI("title");
    }

    toggleUI(screenName) {
        Object.values(this.ui).forEach((el) => {
            if (el && el.classList) el.classList.add("hidden");
        });

        if (screenName === "title") this.ui.title.classList.remove("hidden");
        if (screenName === "tutorial") this.ui.tutorial.classList.remove("hidden");
        if (screenName === "result") this.ui.result.classList.remove("hidden");
        if (screenName === "ranking") this.ui.ranking.classList.remove("hidden");

        if (this.state === "PLAY" || this.state === "COUNTDOWN") {
            this.ui.hud.classList.remove("hidden");
        }
    }
}