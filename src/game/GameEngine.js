/**
 * ============================================================
 * 遊戲引擎 (Game Engine)
 * ============================================================
 * 核心遊戲迴圈、碰撞檢測、AI 邏輯、分數管理。
 * 此模組為純邏輯層，不依賴 React — 由 React 元件呼叫。
 */
import { Tank, rectsOverlap } from './Tank.js';
import {
  DIR, GAME_STATE,
  DESIGN_WIDTH, DESIGN_HEIGHT,
  MAX_ENEMIES, ENEMY_SPAWN_INTERVAL, ENEMIES_PER_LEVEL,
  ENEMY_DIR_CHANGE_INTERVAL, PLAYER_MAX_LIVES,
  COLOR_BACKGROUND, COLOR_GRID, WALL_SIZE,
} from './constants.js';
import { generateMap, getPlayerSpawn, getEnemySpawnPoints } from './mapGenerator.js';
import { getSoundEffects } from './SoundEffects.js';

export class GameEngine {
  constructor() {
    // ---- 遊戲狀態 ----
    this.state = GAME_STATE.MENU;
    this.score = 0;
    this.lives = PLAYER_MAX_LIVES;
    this.level = 1;
    this.enemiesDestroyed = 0;      // 本關已擊毀的敵軍數
    this.totalEnemiesSpawned = 0;   // 本關已生成的敵軍數

    // ---- 遊戲物件 ----
    this.player = null;    // Tank 實例
    this.enemies = [];     // Tank[]
    this.bullets = [];     // Bullet[]
    this.walls = [];       // Wall[]

    // ---- 計時器 ----
    this.lastEnemySpawnTime = 0;

    // ---- 輸入狀態 ----
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      fire: false,
    };

    // ---- 爆炸效果 ----
    this.explosions = []; // { x, y, radius, maxRadius, alpha }

    // ---- 回呼函式（用於通知 React 層更新 UI）----
    this.onStateChange = null;
  }

  /**
   * 初始化 / 重新開始遊戲
   * @param {number} level - 起始關卡
   */
  startGame(level = 1) {
    this.state = GAME_STATE.PLAYING;
    this.level = level;
    this.score = level === 1 ? 0 : this.score;
    this.lives = level === 1 ? PLAYER_MAX_LIVES : this.lives;
    this.enemiesDestroyed = 0;
    this.totalEnemiesSpawned = 0;
    this.bullets = [];
    this.enemies = [];
    this.explosions = [];

    // 生成地圖
    this.walls = generateMap(level);

    // 生成玩家坦克
    const spawn = getPlayerSpawn();
    this.player = new Tank(spawn.x, spawn.y, DIR.UP, true);
    this.player.invincibleUntil = performance.now() + 2000; // 重生無敵 2 秒

    this.lastEnemySpawnTime = performance.now();

    this._notifyStateChange();
  }

  /**
   * 進入下一關
   */
  nextLevel() {
    this.startGame(this.level + 1);
  }

  /**
   * 暫停 / 繼續
   */
  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
    }
    this._notifyStateChange();
  }

  /**
   * =============================================
   * 主遊戲迴圈 — 每幀呼叫一次
   * =============================================
   * @param {number} now - performance.now()
   */
  update(now) {
    if (this.state !== GAME_STATE.PLAYING) return;

    // ---- 1. 處理玩家輸入 ----
    this._handlePlayerInput(now);

    // ---- 2. 更新敵軍 AI ----
    this._updateEnemyAI(now);

    // ---- 3. 生成新敵軍 ----
    this._spawnEnemies(now);

    // ---- 4. 更新所有子彈 ----
    for (const bullet of this.bullets) {
      bullet.update();
    }

    // ---- 5. 碰撞檢測 ----
    this._checkCollisions(now);

    // ---- 6. 清理死亡物件 ----
    this.bullets = this.bullets.filter(b => b.alive);
    this.enemies = this.enemies.filter(e => e.alive);
    this.walls = this.walls.filter(w => w.alive);
    this.explosions = this.explosions.filter(e => e.alpha > 0);

    // ---- 7. 更新爆炸效果 ----
    for (const exp of this.explosions) {
      exp.radius += 1.5;
      exp.alpha -= 0.03;
    }

    // ---- 8. 檢查過關條件 ----
    if (this.enemiesDestroyed >= ENEMIES_PER_LEVEL) {
      this.state = GAME_STATE.LEVEL_CLEAR;
      getSoundEffects().playLevelComplete();
      this._notifyStateChange();
    }
  }

  /**
   * =============================================
   * 繪製 — 在 Canvas 上渲染所有遊戲物件
   * =============================================
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth - 實際 Canvas 寬度 (px)
   * @param {number} canvasHeight - 實際 Canvas 高度 (px)
   */
  render(ctx, canvasWidth, canvasHeight) {
    // 計算縮放因子
    const scale = canvasWidth / DESIGN_WIDTH;
    const now = performance.now();

    // ---- 清除畫布 ----
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // ---- 繪製背景網格 ----
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 0.5;
    const gridSize = WALL_SIZE * scale;
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // ---- 繪製牆壁 ----
    for (const wall of this.walls) {
      wall.draw(ctx, scale);
    }

    // ---- 繪製坦克 ----
    for (const enemy of this.enemies) {
      enemy.draw(ctx, scale, now);
    }
    if (this.player && this.player.alive) {
      this.player.draw(ctx, scale, now);
    }

    // ---- 繪製子彈 ----
    for (const bullet of this.bullets) {
      bullet.draw(ctx, scale);
    }

    // ---- 繪製爆炸效果 ----
    for (const exp of this.explosions) {
      ctx.globalAlpha = Math.max(0, exp.alpha);
      ctx.fillStyle = exp.color || '#FF6600';
      ctx.beginPath();
      ctx.arc(exp.x * scale, exp.y * scale, exp.radius * scale, 0, Math.PI * 2);
      ctx.fill();

      // 內圈亮光
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(exp.x * scale, exp.y * scale, exp.radius * scale * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ---- 遊戲狀態覆蓋畫面 ----
    if (this.state === GAME_STATE.MENU) {
      this._drawOverlay(ctx, canvasWidth, canvasHeight, '🎮 坦克大戰', '點擊「開始遊戲」', scale);
    } else if (this.state === GAME_STATE.PAUSED) {
      this._drawOverlay(ctx, canvasWidth, canvasHeight, '⏸ 暫停中', '點擊繼續', scale);
    } else if (this.state === GAME_STATE.GAME_OVER) {
      this._drawOverlay(ctx, canvasWidth, canvasHeight, '💀 遊戲結束', `最終分數：${this.score}`, scale);
    } else if (this.state === GAME_STATE.LEVEL_CLEAR) {
      this._drawOverlay(ctx, canvasWidth, canvasHeight, `🏆 第 ${this.level} 關完成！`, `分數：${this.score}`, scale);
    }
  }

  // =============================================
  // 私有方法 (Private Methods)
  // =============================================

  /**
   * 處理玩家鍵盤 / 觸控輸入
   */
  _handlePlayerInput(now) {
    if (!this.player || !this.player.alive) return;

    const allTanks = [this.player, ...this.enemies];

    if (this.keys.up) this.player.move(DIR.UP, this.walls, allTanks);
    else if (this.keys.down) this.player.move(DIR.DOWN, this.walls, allTanks);
    else if (this.keys.left) this.player.move(DIR.LEFT, this.walls, allTanks);
    else if (this.keys.right) this.player.move(DIR.RIGHT, this.walls, allTanks);

    if (this.keys.fire) {
      const bullet = this.player.fire(now);
      if (bullet) {
        this.bullets.push(bullet);
        getSoundEffects().playShoot();
      }
    }
  }

  /**
   * 更新敵軍 AI — 隨機移動 + 自動射擊
   */
  _updateEnemyAI(now) {
    const allTanks = [this.player, ...this.enemies];
    const directions = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      // 定時隨機更換方向
      if (now - enemy.aiDirectionTimer > enemy.aiDirectionInterval) {
        enemy.aiDirectionTimer = now;
        enemy.direction = directions[Math.floor(Math.random() * 4)];
        enemy.aiDirectionInterval = 1500 + Math.random() * 1500;
      }

      // 移動
      enemy.move(enemy.direction, this.walls, allTanks);

      // 自動射擊（加入隨機性避免過度密集）
      if (Math.random() < 0.02) {
        const bullet = enemy.fire(now);
        if (bullet) this.bullets.push(bullet);
      }
    }
  }

  /**
   * 生成敵軍
   */
  _spawnEnemies(now) {
    // 已生成足夠敵軍
    if (this.totalEnemiesSpawned >= ENEMIES_PER_LEVEL) return;
    // 場上敵軍已滿
    if (this.enemies.length >= MAX_ENEMIES) return;
    // 冷卻時間未到
    if (now - this.lastEnemySpawnTime < ENEMY_SPAWN_INTERVAL) return;

    this.lastEnemySpawnTime = now;

    const spawnPoints = getEnemySpawnPoints();
    const sp = spawnPoints[this.totalEnemiesSpawned % spawnPoints.length];

    // 檢查出生點是否被佔據
    const testBounds = { x: sp.x, y: sp.y, w: 36, h: 36 };
    const blocked = [...this.enemies, this.player].some(t =>
      t && t.alive && rectsOverlap(testBounds, t.getBounds())
    );
    if (blocked) return;

    const enemy = new Tank(sp.x, sp.y, DIR.DOWN, false);
    enemy.aiDirectionTimer = now;
    this.enemies.push(enemy);
    this.totalEnemiesSpawned++;
  }

  /**
   * 碰撞檢測：子彈 vs 牆壁、子彈 vs 坦克
   */
  _checkCollisions(now) {
    for (const bullet of this.bullets) {
      if (!bullet.alive) continue;
      const bb = bullet.getBounds();

      // ---- 子彈 vs 牆壁 ----
      for (const wall of this.walls) {
        if (!wall.alive) continue;
        if (rectsOverlap(bb, wall.getBounds())) {
          bullet.alive = false;
          if (wall.destructible) {
            wall.alive = false;
            this._addExplosion(wall.x + wall.size / 2, wall.y + wall.size / 2, 12, '#AA6633');
          } else {
            // 鐵牆火花效果
            this._addExplosion(bullet.x, bullet.y, 6, '#CCCCCC');
          }
          break;
        }
      }
      if (!bullet.alive) continue;

      // ---- 玩家子彈 vs 敵軍 ----
      if (bullet.isPlayerBullet) {
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          if (rectsOverlap(bb, enemy.getBounds())) {
            bullet.alive = false;
            enemy.alive = false;
            this.score += 100;
            this.enemiesDestroyed++;
            this._addExplosion(
              enemy.x + enemy.size / 2,
              enemy.y + enemy.size / 2,
              25, '#FF4400'
            );
            getSoundEffects().playExplosion();
            this._notifyStateChange();
            break;
          }
        }
      }

      // ---- 敵軍子彈 vs 玩家 ----
      if (!bullet.isPlayerBullet && this.player && this.player.alive) {
        if (!this.player.isInvincible(now) && rectsOverlap(bb, this.player.getBounds())) {
          bullet.alive = false;
          this.lives--;
          this._addExplosion(
            this.player.x + this.player.size / 2,
            this.player.y + this.player.size / 2,
            25, '#00FF66'
          );
          getSoundEffects().playHit();

          if (this.lives <= 0) {
            this.player.alive = false;
            this.state = GAME_STATE.GAME_OVER;
            getSoundEffects().playGameOver();
            this._notifyStateChange();
          } else {
            // 玩家重生
            const spawn = getPlayerSpawn();
            this.player.x = spawn.x;
            this.player.y = spawn.y;
            this.player.direction = DIR.UP;
            this.player.invincibleUntil = now + 2000;
            this._notifyStateChange();
          }
        }
      }
    }
  }

  /**
   * 新增爆炸效果
   */
  _addExplosion(x, y, maxRadius, color) {
    this.explosions.push({
      x, y,
      radius: 2,
      maxRadius,
      alpha: 1,
      color,
    });
  }

  /**
   * 繪製半透明覆蓋畫面（選單 / 暫停 / 結束）
   */
  _drawOverlay(ctx, cw, ch, title, subtitle, scale) {
    // 半透明黑色背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, cw, ch);

    // 標題
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.max(24, 48 * scale)}px "Noto Sans TC", sans-serif`;
    ctx.fillText(title, cw / 2, ch / 2 - 30 * scale);

    // 副標題
    ctx.font = `${Math.max(14, 22 * scale)}px "Noto Sans TC", sans-serif`;
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText(subtitle, cw / 2, ch / 2 + 25 * scale);
  }

  /**
   * 通知 React 層遊戲狀態已更新
   */
  _notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({
        state: this.state,
        score: this.score,
        lives: this.lives,
        level: this.level,
        enemiesLeft: ENEMIES_PER_LEVEL - this.enemiesDestroyed,
      });
    }
  }
}
