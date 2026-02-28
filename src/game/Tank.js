/**
 * ============================================================
 * 坦克類別 (Tank Class)
 * ============================================================
 * 負責管理坦克的位置、方向、繪製與射擊邏輯。
 * 玩家坦克與敵軍坦克共用此類別，透過 isPlayer 旗標區分。
 */
import {
  TANK_SIZE, TANK_SPEED, TANK_FIRE_COOLDOWN,
  ENEMY_SPEED, ENEMY_FIRE_COOLDOWN,
  BULLET_SPEED, BULLET_SIZE,
  COLOR_PLAYER, COLOR_ENEMY,
  COLOR_BULLET_PLAYER, COLOR_BULLET_ENEMY,
  DIR, DESIGN_WIDTH, DESIGN_HEIGHT, WALL_SIZE,
} from './constants.js';
import { Bullet } from './Bullet.js';

export class Tank {
  /**
   * @param {number} x - 設計座標 X
   * @param {number} y - 設計座標 Y
   * @param {string} direction - 初始方向 (DIR.UP / DOWN / LEFT / RIGHT)
   * @param {boolean} isPlayer - 是否為玩家坦克
   */
  constructor(x, y, direction = DIR.UP, isPlayer = false) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.isPlayer = isPlayer;

    // 根據身份設定屬性
    this.speed = isPlayer ? TANK_SPEED : ENEMY_SPEED;
    this.fireCooldown = isPlayer ? TANK_FIRE_COOLDOWN : ENEMY_FIRE_COOLDOWN;
    this.color = isPlayer ? COLOR_PLAYER : COLOR_ENEMY;
    this.bulletColor = isPlayer ? COLOR_BULLET_PLAYER : COLOR_BULLET_ENEMY;

    // 射擊冷卻計時器
    this.lastFireTime = 0;

    // 坦克是否存活
    this.alive = true;

    // 坦克尺寸（設計座標）
    this.size = TANK_SIZE;

    // 無敵時間（玩家重生後短暫無敵）
    this.invincibleUntil = 0;

    // ---- 敵軍 AI 用 ----
    this.aiDirectionTimer = 0;          // AI 方向切換計時器
    this.aiDirectionInterval = 1500 + Math.random() * 1500; // 隨機間隔
  }

  /**
   * 取得坦克的碰撞矩形 (Bounding Box)
   * @returns {{ x: number, y: number, w: number, h: number }}
   */
  getBounds() {
    return { x: this.x, y: this.y, w: this.size, h: this.size };
  }

  /**
   * 移動坦克
   * 關鍵修正：轉向時進行「網格對齊 (Grid Snap)」，
   * 將坦克的垂直軸座標對齊到最近的 WALL_SIZE 網格線，
   * 這樣才能順暢通過單格寬度的走廊，不會卡住。
   *
   * @param {string} dir - 移動方向
   * @param {Array} walls - 牆壁陣列（用於碰撞檢測）
   * @param {Array} tanks - 其他坦克（用於碰撞檢測）
   */
  move(dir, walls = [], tanks = []) {
    if (!this.alive) return;

    // 偵測是否在「水平↔垂直」之間轉向
    const wasVertical = (this.direction === DIR.UP || this.direction === DIR.DOWN);
    const nowVertical = (dir === DIR.UP || dir === DIR.DOWN);
    const axisChanged = wasVertical !== nowVertical;

    this.direction = dir;

    // ---- 轉向時進行網格對齊 ----
    // 將「非移動軸」的座標對齊到最近的 WALL_SIZE 格線
    // 這是經典坦克大戰的核心技巧，確保坦克能進入走廊
    if (axisChanged) {
      if (nowVertical) {
        // 即將垂直移動 → 對齊 X 軸到最近格線
        this.x = snapToGrid(this.x);
      } else {
        // 即將水平移動 → 對齊 Y 軸到最近格線
        this.y = snapToGrid(this.y);
      }
    }

    // 計算預期位置
    let nx = this.x;
    let ny = this.y;

    switch (dir) {
      case DIR.UP:    ny -= this.speed; break;
      case DIR.DOWN:  ny += this.speed; break;
      case DIR.LEFT:  nx -= this.speed; break;
      case DIR.RIGHT: nx += this.speed; break;
    }

    // 邊界檢查（不超出設計解析度範圍）
    nx = Math.max(0, Math.min(DESIGN_WIDTH - this.size, nx));
    ny = Math.max(0, Math.min(DESIGN_HEIGHT - this.size, ny));

    // 建立預期的碰撞矩形（內縮 0.5px 容差，避免浮點邊緣卡牆）
    const TOLERANCE = 0.5;
    const nextBounds = {
      x: nx + TOLERANCE,
      y: ny + TOLERANCE,
      w: this.size - TOLERANCE * 2,
      h: this.size - TOLERANCE * 2,
    };

    // 牆壁碰撞檢測
    for (const wall of walls) {
      if (!wall.alive) continue;
      if (rectsOverlap(nextBounds, wall.getBounds())) {
        return; // 碰到牆壁，取消移動
      }
    }

    // 其他坦克碰撞檢測
    for (const tank of tanks) {
      if (tank === this || !tank.alive) continue;
      if (rectsOverlap(nextBounds, tank.getBounds())) {
        return; // 碰到其他坦克，取消移動
      }
    }

    // 通過所有檢測，更新位置
    this.x = nx;
    this.y = ny;
  }

  /**
   * 射擊 — 產生一顆子彈
   * @param {number} now - 當前時間戳 (ms)
   * @returns {Bullet|null} 若冷卻完成回傳子彈實例，否則 null
   */
  fire(now) {
    if (!this.alive) return null;
    if (now - this.lastFireTime < this.fireCooldown) return null;

    this.lastFireTime = now;

    // 子彈從坦克砲口中央射出
    const halfTank = this.size / 2;
    const halfBullet = BULLET_SIZE / 2;
    let bx, by;

    switch (this.direction) {
      case DIR.UP:
        bx = this.x + halfTank - halfBullet;
        by = this.y - BULLET_SIZE;
        break;
      case DIR.DOWN:
        bx = this.x + halfTank - halfBullet;
        by = this.y + this.size;
        break;
      case DIR.LEFT:
        bx = this.x - BULLET_SIZE;
        by = this.y + halfTank - halfBullet;
        break;
      case DIR.RIGHT:
        bx = this.x + this.size;
        by = this.y + halfTank - halfBullet;
        break;
    }

    return new Bullet(bx, by, this.direction, this.isPlayer, this.bulletColor);
  }

  /**
   * 是否處於無敵狀態
   * @param {number} now
   * @returns {boolean}
   */
  isInvincible(now) {
    return now < this.invincibleUntil;
  }

  /**
   * 在 Canvas 上繪製坦克
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} scale - 縮放因子（設計座標 → 實際像素）
   * @param {number} now - 當前時間戳（用於無敵閃爍效果）
   */
  draw(ctx, scale, now = 0) {
    if (!this.alive) return;

    // 無敵狀態閃爍效果
    if (this.isInvincible(now) && Math.floor(now / 100) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const s = scale;
    const x = this.x * s;
    const y = this.y * s;
    const sz = this.size * s;

    // ---- 繪製坦克本體 ----
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, sz, sz);

    // ---- 繪製履帶（兩側深色條紋）----
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    const trackW = sz * 0.18;
    if (this.direction === DIR.UP || this.direction === DIR.DOWN) {
      ctx.fillRect(x, y, trackW, sz);
      ctx.fillRect(x + sz - trackW, y, trackW, sz);
    } else {
      ctx.fillRect(x, y, sz, trackW);
      ctx.fillRect(x, y + sz - trackW, sz, trackW);
    }

    // ---- 繪製砲管 ----
    ctx.fillStyle = '#FFFFFF';
    const barrelW = sz * 0.16;
    const barrelH = sz * 0.45;
    ctx.save();
    ctx.translate(x + sz / 2, y + sz / 2);

    let angle = 0;
    switch (this.direction) {
      case DIR.UP:    angle = 0; break;
      case DIR.DOWN:  angle = Math.PI; break;
      case DIR.LEFT:  angle = -Math.PI / 2; break;
      case DIR.RIGHT: angle = Math.PI / 2; break;
    }
    ctx.rotate(angle);
    ctx.fillRect(-barrelW / 2, -sz / 2 - barrelH * 0.1, barrelW, barrelH);
    ctx.restore();

    // ---- 繪製中心圓形砲塔 ----
    ctx.fillStyle = this.isPlayer ? '#00FF66' : '#FF6666';
    ctx.beginPath();
    ctx.arc(x + sz / 2, y + sz / 2, sz * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // 重置透明度
    ctx.globalAlpha = 1;
  }
}

/**
 * 矩形碰撞檢測輔助函式
 * @param {{ x: number, y: number, w: number, h: number }} a
 * @param {{ x: number, y: number, w: number, h: number }} b
 * @returns {boolean}
 */
export function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * 將座標對齊到最近的 WALL_SIZE 網格線
 * 經典坦克大戰的核心技巧：轉向時將垂直軸 snap 到格線，
 * 確保坦克能順暢進入 1 格寬的走廊。
 *
 * @param {number} val - 原始座標
 * @returns {number} - 對齊後的座標
 */
function snapToGrid(val) {
  return Math.round(val / WALL_SIZE) * WALL_SIZE;
}
