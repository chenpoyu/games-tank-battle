/**
 * ============================================================
 * 牆壁類別 (Wall Class)
 * ============================================================
 * 分為「磚牆 (BRICK)」與「鐵牆 (STEEL)」兩種。
 * 磚牆可被子彈摧毀，鐵牆不可摧毀。
 */
import {
  WALL_SIZE, WALL_TYPE,
  WALL_COLOR_BRICK, WALL_COLOR_STEEL,
} from './constants.js';

export class Wall {
  /**
   * @param {number} x - 設計座標 X（網格對齊）
   * @param {number} y - 設計座標 Y（網格對齊）
   * @param {string} type - WALL_TYPE.BRICK 或 WALL_TYPE.STEEL
   */
  constructor(x, y, type = WALL_TYPE.BRICK) {
    this.x = x;
    this.y = y;
    this.size = WALL_SIZE;
    this.type = type;
    this.alive = true;

    // 鐵牆不可被摧毀
    this.destructible = type === WALL_TYPE.BRICK;
  }

  /**
   * 取得碰撞矩形
   */
  getBounds() {
    return { x: this.x, y: this.y, w: this.size, h: this.size };
  }

  /**
   * 在 Canvas 上繪製牆壁
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} scale
   */
  draw(ctx, scale) {
    if (!this.alive) return;

    const s = scale;
    const x = this.x * s;
    const y = this.y * s;
    const sz = this.size * s;

    if (this.type === WALL_TYPE.BRICK) {
      // ---- 磚牆：繪製磚塊紋理 ----
      ctx.fillStyle = WALL_COLOR_BRICK;
      ctx.fillRect(x, y, sz, sz);

      // 磚縫效果
      ctx.strokeStyle = '#5C2D06';
      ctx.lineWidth = Math.max(1, s);
      const halfSz = sz / 2;

      // 水平線
      ctx.beginPath();
      ctx.moveTo(x, y + halfSz);
      ctx.lineTo(x + sz, y + halfSz);
      ctx.stroke();

      // 上半部垂直線
      ctx.beginPath();
      ctx.moveTo(x + halfSz, y);
      ctx.lineTo(x + halfSz, y + halfSz);
      ctx.stroke();

      // 下半部垂直線（錯開排列）
      ctx.beginPath();
      ctx.moveTo(x + sz * 0.25, y + halfSz);
      ctx.lineTo(x + sz * 0.25, y + sz);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + sz * 0.75, y + halfSz);
      ctx.lineTo(x + sz * 0.75, y + sz);
      ctx.stroke();

    } else {
      // ---- 鐵牆：金屬質感 ----
      ctx.fillStyle = WALL_COLOR_STEEL;
      ctx.fillRect(x, y, sz, sz);

      // 金屬高光
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x + sz * 0.1, y + sz * 0.1, sz * 0.35, sz * 0.35);

      // 邊框
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = Math.max(1, s);
      ctx.strokeRect(x, y, sz, sz);

      // 十字螺絲裝飾
      ctx.strokeStyle = '#AAAAAA';
      ctx.lineWidth = Math.max(1, s * 0.8);
      const cx = x + sz / 2;
      const cy = y + sz / 2;
      const crossSize = sz * 0.15;
      ctx.beginPath();
      ctx.moveTo(cx - crossSize, cy);
      ctx.lineTo(cx + crossSize, cy);
      ctx.moveTo(cx, cy - crossSize);
      ctx.lineTo(cx, cy + crossSize);
      ctx.stroke();
    }
  }
}
