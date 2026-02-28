/**
 * ============================================================
 * 遊戲 HUD (Head-Up Display)
 * ============================================================
 * 顯示分數、生命值、關卡、剩餘敵軍數。
 * 在手機上使用較大字型確保可讀性。
 */
import React from 'react';

/**
 * @param {{ score: number, lives: number, level: number, enemiesLeft: number }} props
 */
export default function GameHUD({ score, lives, level, enemiesLeft }) {
  return (
    <div className="game-hud">
      <div className="hud-item hud-level">
        <span className="hud-label">關卡</span>
        <span className="hud-value">{level}</span>
      </div>
      <div className="hud-item hud-score">
        <span className="hud-label">分數</span>
        <span className="hud-value">{score}</span>
      </div>
      <div className="hud-item hud-lives">
        <span className="hud-label">生命</span>
        <span className="hud-value">
          {/* 用坦克 emoji 表示剩餘生命 */}
          {'🛡️'.repeat(Math.max(0, lives))}
        </span>
      </div>
      <div className="hud-item hud-enemies">
        <span className="hud-label">敵軍</span>
        <span className="hud-value">{enemiesLeft}</span>
      </div>
    </div>
  );
}
