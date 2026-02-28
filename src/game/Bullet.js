/**
 * ============================================================
 * 子彈類別 (Bullet Class)
 * ============================================================
 * 管理子彈的移動、碰撞與渲染。
 */
import {
  BULLET_SIZE, BULLET_SPEED,
  DIR, DESIGN_WIDTH, DESIGN_HEIGHT,
} from './constants.js';

export class Bullet {
  /**
   * @param {number} x - 設計座標 X
   * @param {number} y - 設計座標 Y
   * @param {string} direction - 飛行方向
   * @param {boolean} isPlayerBullet - 是否為玩家發射
   * @param {string} color - 子彈顏色
   */
  constructor(x, y, direction, isPlayerBullet, color) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.isPlayerBullet = isPlayerBullet;
    this.color = color;
    this.size = BULLET_SIZE;
    this.speed = BULLET_SPEED;
    this.alive = true;
  }

  /**
   * 取得碰撞矩形
   */
  getBounds() {
    return { x: this.x, y: this.y, w: this.size, h: this.size };
  }

  /**
   * 每幀更新位置
   * 超出邊界則標記為死亡
   */
  update() {
    if (!this.alive) return;

    switch (this.direction) {
      case DIR.UP:    this.y -= this.speed; break;
      case DIR.DOWN:  this.y += this.speed; break;
      case DIR.LEFT:  this.x -= this.speed; break;
      case DIR.RIGHT: this.x += this.speed; break;
    }

    // 超出設計解析度邊界 → 銷毀
    if (
      this.x < -this.size ||
      this.x > DESIGN_WIDTH + this.size ||
      this.y < -this.size ||
      this.y > DESIGN_HEIGHT + this.size
    ) {
      this.alive = false;
    }
  }

  /**
   * 在 Canvas 上繪製子彈
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} scale - 縮放因子
   */
  draw(ctx, scale) {
    if (!this.alive) return;

    const s = scale;
    const x = this.x * s;
    const y = this.y * s;
    const sz = this.size * s;

    // 子彈外發光效果
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6 * s;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(x + sz / 2, y + sz / 2, sz / 2, 0, Math.PI * 2);
    ctx.fill();

    // 重置陰影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}
