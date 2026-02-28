/**
 * ============================================================
 * 遊戲常數設定 (Game Constants)
 * ============================================================
 * 所有數值皆以「設計解析度」為基準，實際渲染時會乘以 scale 因子。
 * 設計解析度 = 1280 x 720 (16:9)
 */

// ---- 設計解析度 (Design Resolution) ----
export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;
export const ASPECT_RATIO = DESIGN_WIDTH / DESIGN_HEIGHT; // 16:9

// ---- 坦克相關 (Tank) ----
// 重要：坦克尺寸必須 < WALL_SIZE，才能通過單格寬的走廊
export const TANK_SIZE = 32;               // 坦克邊長（比牆壁小 4px，確保能穿過走廊）
export const TANK_SPEED = 2;               // 玩家坦克每幀移動距離（整數，避免浮點誤差）
export const TANK_FIRE_COOLDOWN = 300;     // 玩家射擊冷卻時間（毫秒）
export const PLAYER_MAX_LIVES = 3;         // 玩家初始生命數

// ---- 敵軍相關 (Enemy) ----
export const ENEMY_SPEED = 2;              // 敵軍移動速度（整數，與網格對齊）
export const ENEMY_FIRE_COOLDOWN = 1500;   // 敵軍射擊冷卻（毫秒）
export const ENEMY_DIR_CHANGE_INTERVAL = 2000; // 敵軍變換方向間隔（毫秒）
export const MAX_ENEMIES = 4;              // 同時存在的敵軍最大數量
export const ENEMY_SPAWN_INTERVAL = 3000;  // 敵軍生成間隔（毫秒）
export const ENEMIES_PER_LEVEL = 8;        // 每關需擊敗的敵軍數

// ---- 子彈相關 (Bullet) ----
export const BULLET_SIZE = 6;              // 子彈邊長
export const BULLET_SPEED = 6;             // 子彈每幀移動距離（整數）

// ---- 牆壁 / 地圖 (Wall / Map) ----
export const WALL_SIZE = 36;               // 單一牆壁磚塊邊長
export const WALL_COLOR_BRICK = '#8B4513'; // 磚牆顏色
export const WALL_COLOR_STEEL = '#808080'; // 鐵牆顏色（不可破壞）

// ---- 顏色 (Colors) ----
export const COLOR_PLAYER = '#00CC44';     // 玩家坦克顏色
export const COLOR_ENEMY = '#DD3333';      // 敵軍坦克顏色
export const COLOR_BULLET_PLAYER = '#FFFF00'; // 玩家子彈
export const COLOR_BULLET_ENEMY = '#FF8800';  // 敵軍子彈
export const COLOR_BACKGROUND = '#1a1a2e'; // 遊戲背景色
export const COLOR_GRID = '#16213e';       // 背景網格線顏色

// ---- 方向列舉 (Direction Enum) ----
export const DIR = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
};

// ---- 遊戲狀態 (Game State Enum) ----
export const GAME_STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  LEVEL_CLEAR: 'LEVEL_CLEAR',
};

// ---- 牆壁類型 (Wall Type Enum) ----
export const WALL_TYPE = {
  BRICK: 'BRICK',   // 可被子彈摧毀
  STEEL: 'STEEL',   // 不可摧毀
};
