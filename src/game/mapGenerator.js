/**
 * ============================================================
 * 地圖生成器 (Map Generator)
 * ============================================================
 * 負責根據關卡產生牆壁佈局。
 * 設計座標系以 WALL_SIZE (36) 為網格單位。
 */
import { WALL_SIZE, WALL_TYPE, DESIGN_WIDTH, DESIGN_HEIGHT, TANK_SIZE } from './constants.js';
import { Wall } from './Wall.js';

// 設計座標下的網格行列數
const COLS = Math.floor(DESIGN_WIDTH / WALL_SIZE);   // 35
const ROWS = Math.floor(DESIGN_HEIGHT / WALL_SIZE);   // 20

/**
 * 根據關卡等級生成牆壁陣列
 * @param {number} level - 目前關卡 (1-based)
 * @returns {Wall[]}
 */
export function generateMap(level) {
  const walls = [];

  // 基礎種子，讓每一關有不同但確定性的佈局
  const seed = level * 7 + 3;

  // ---- 1. 外圍邊界 (鐵牆) ----
  // 上邊與下邊
  for (let c = 0; c < COLS; c++) {
    walls.push(new Wall(c * WALL_SIZE, 0, WALL_TYPE.STEEL));
    walls.push(new Wall(c * WALL_SIZE, (ROWS - 1) * WALL_SIZE, WALL_TYPE.STEEL));
  }
  // 左邊與右邊（排除已放置的四角）
  for (let r = 1; r < ROWS - 1; r++) {
    walls.push(new Wall(0, r * WALL_SIZE, WALL_TYPE.STEEL));
    walls.push(new Wall((COLS - 1) * WALL_SIZE, r * WALL_SIZE, WALL_TYPE.STEEL));
  }

  // ---- 2. 內部障礙物 ----
  // 為玩家出生區與敵軍出生區留白
  const playerSpawnCol = Math.floor(COLS / 2);
  const playerSpawnRow = ROWS - 3;
  const enemySpawnPositions = [
    { c: 2, r: 2 },
    { c: Math.floor(COLS / 2), r: 2 },
    { c: COLS - 3, r: 2 },
  ];

  // 是否為禁止放置牆壁的區域
  const isReserved = (c, r) => {
    // 玩家出生區域（3x3）
    if (Math.abs(c - playerSpawnCol) <= 1 && Math.abs(r - playerSpawnRow) <= 1) return true;
    // 敵軍出生區域
    for (const sp of enemySpawnPositions) {
      if (Math.abs(c - sp.c) <= 1 && Math.abs(r - sp.r) <= 1) return true;
    }
    return false;
  };

  // 使用偽隨機在內部區域放置牆壁
  const innerStartR = 2;
  const innerEndR = ROWS - 2;
  const innerStartC = 2;
  const innerEndC = COLS - 2;

  // 結構化佈局：每隔幾格放一排牆
  // 間距必須 >= 2 格，坦克才能通過（TANK_SIZE=32 < 2*WALL_SIZE=72）
  const rowSpacing = Math.max(3, 5 - Math.floor(level / 3));
  const colSpacing = Math.max(3, 5 - Math.floor(level / 3));

  for (let r = innerStartR; r < innerEndR; r++) {
    for (let c = innerStartC; c < innerEndC; c++) {
      if (isReserved(c, r)) continue;

      // 網格式佈局
      const isStructRow = (r - innerStartR) % rowSpacing === 0;
      const isStructCol = (c - innerStartC) % colSpacing === 0;

      // 交叉位置放磚牆
      if (isStructRow && isStructCol) {
        const type = pseudoRandom(c * seed + r * 13) % 5 === 0
          ? WALL_TYPE.STEEL
          : WALL_TYPE.BRICK;
        walls.push(new Wall(c * WALL_SIZE, r * WALL_SIZE, type));
      }
      // 結構行的連續段
      else if (isStructRow && !isStructCol) {
        const hash = pseudoRandom(c * seed + r * 17 + level);
        if (hash % 3 !== 0) { // ~67% 機率填充
          walls.push(new Wall(c * WALL_SIZE, r * WALL_SIZE, WALL_TYPE.BRICK));
        }
      }
      // 結構列的連續段
      else if (!isStructRow && isStructCol) {
        const hash = pseudoRandom(c * 19 + r * seed + level);
        if (hash % 4 === 0) { // ~25% 機率填充
          walls.push(new Wall(c * WALL_SIZE, r * WALL_SIZE, WALL_TYPE.BRICK));
        }
      }
    }
  }

  // ---- 3. 隨著關卡增加鐵牆數量 ----
  const steelExtra = Math.min(level, 5);
  for (let i = 0; i < steelExtra; i++) {
    const c = innerStartC + pseudoRandom(i * 31 + level * 7) % (innerEndC - innerStartC);
    const r = innerStartR + pseudoRandom(i * 37 + level * 11) % (innerEndR - innerStartR);
    if (!isReserved(c, r)) {
      walls.push(new Wall(c * WALL_SIZE, r * WALL_SIZE, WALL_TYPE.STEEL));
    }
  }

  return walls;
}

/**
 * 取得玩家出生位置（設計座標）
 * @returns {{ x: number, y: number }}
 */
export function getPlayerSpawn() {
  const col = Math.floor(COLS / 2);
  const row = ROWS - 3;
  return { x: col * WALL_SIZE, y: row * WALL_SIZE };
}

/**
 * 取得敵軍可用出生位置列表（設計座標）
 * @returns {{ x: number, y: number }[]}
 */
export function getEnemySpawnPoints() {
  return [
    { x: 2 * WALL_SIZE, y: 2 * WALL_SIZE },
    { x: Math.floor(COLS / 2) * WALL_SIZE, y: 2 * WALL_SIZE },
    { x: (COLS - 3) * WALL_SIZE, y: 2 * WALL_SIZE },
  ];
}

/**
 * 簡易偽隨機數生成（確定性）
 * @param {number} n
 * @returns {number}
 */
function pseudoRandom(n) {
  let x = Math.sin(n * 9301 + 49297) * 233280;
  return Math.abs(Math.floor(x));
}
