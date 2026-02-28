/**
 * ============================================================
 * TankGame 主元件 (Main Game Component)
 * ============================================================
 * 整合 Canvas 渲染、遊戲引擎、響應式佈局、
 * 鍵盤/觸控輸入、HUD 與虛擬控制器。
 *
 * 佈局（由上到下，Flexbox column）：
 *   [HUD]  — 固定高度
 *   [Canvas] — 自適應，保持 16:9
 *   [Toolbar] — 固定高度
 *   [Controls] — D-Pad + Fire，永遠可見
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine.js';
import { GAME_STATE, ENEMIES_PER_LEVEL } from '../game/constants.js';
import { useResponsiveCanvas } from '../hooks/useResponsiveCanvas.js';
import { useInputHandler } from '../hooks/useInputHandler.js';
import VirtualControls from './VirtualControls.jsx';
import GameHUD from './GameHUD.jsx';
import BackgroundMusic from './BackgroundMusic.jsx';

export default function TankGame() {
  // ---- Canvas ref ----
  const canvasRef = useRef(null);

  // ---- 遊戲引擎（使用 ref 避免重複建立）----
  const engineRef = useRef(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  // ---- 響應式 Canvas 尺寸（永遠預留控制區空間）----
  const { canvasWidth, canvasHeight } = useResponsiveCanvas();

  // ---- 輸入處理（鍵盤 + 觸控/滑鼠）----
  const { setDirection, setFire } = useInputHandler(engine);

  // ---- UI 狀態（由遊戲引擎回呼更新）----
  const [gameInfo, setGameInfo] = useState({
    state: GAME_STATE.MENU,
    score: 0,
    lives: 3,
    level: 1,
    enemiesLeft: ENEMIES_PER_LEVEL,
  });

  // 連結引擎狀態變更回呼
  useEffect(() => {
    engine.onStateChange = (info) => {
      setGameInfo({ ...info });
    };
  }, [engine]);

  // ---- 遊戲主迴圈 (requestAnimationFrame) ----
  useEffect(() => {
    let animFrameId;

    const gameLoop = () => {
      const now = performance.now();
      engine.update(now);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        engine.render(ctx, canvas.width, canvas.height);
      }

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [engine]);

  // ---- 按鈕操作 ----
  const handleStartGame = useCallback(() => {
    engine.startGame(1);
  }, [engine]);

  const handleNextLevel = useCallback(() => {
    engine.nextLevel();
  }, [engine]);

  const handleRestart = useCallback(() => {
    engine.startGame(1);
  }, [engine]);

  const handlePause = useCallback(() => {
    engine.togglePause();
  }, [engine]);

  // ---- 全螢幕切換 ----
  const handleFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() ||
      el.webkitRequestFullscreen?.() ||
      el.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.();
    }
  }, []);

  // ---- 防止 Canvas 上的觸控預設行為 ----
  const preventDefaultTouch = useCallback((e) => {
    e.preventDefault();
  }, []);

  // ---- 遊戲狀態判斷 ----
  const isMenu = gameInfo.state === GAME_STATE.MENU;
  const isPlaying = gameInfo.state === GAME_STATE.PLAYING;
  const isPaused = gameInfo.state === GAME_STATE.PAUSED;
  const isGameOver = gameInfo.state === GAME_STATE.GAME_OVER;
  const isLevelClear = gameInfo.state === GAME_STATE.LEVEL_CLEAR;

  return (
    <div className="game-container">
      {/* ===== 頂部 HUD ===== */}
      <GameHUD
        score={gameInfo.score}
        lives={gameInfo.lives}
        level={gameInfo.level}
        enemiesLeft={gameInfo.enemiesLeft}
      />

      {/* ===== Canvas 遊戲畫布 ===== */}
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="game-canvas"
          onTouchStart={preventDefaultTouch}
          onTouchMove={preventDefaultTouch}
        />

        {/* ===== 覆蓋按鈕層（選單/暫停/結算畫面）===== */}
        <div className="overlay-buttons">
          {isMenu && (
            <button className="game-btn btn-start" onClick={handleStartGame}>
              🎮 開始遊戲
            </button>
          )}
          {isPaused && (
            <button className="game-btn btn-resume" onClick={handlePause}>
              ▶ 繼續遊戲
            </button>
          )}
          {isGameOver && (
            <button className="game-btn btn-restart" onClick={handleRestart}>
              🔄 重新開始
            </button>
          )}
          {isLevelClear && (
            <button className="game-btn btn-next" onClick={handleNextLevel}>
              ➡️ 下一關
            </button>
          )}
        </div>
      </div>

      {/* ===== 工具列 — 桌機上才獨立顯示，手機上由 VirtualControls 內嵌 ===== */}
      <div className="toolbar">
        {isPlaying && (
          <button className="toolbar-btn" onClick={handlePause} title="暫停">
            ⏸
          </button>
        )}
        <button className="toolbar-btn" onClick={handleFullscreen} title="全螢幕">
          ⛶
        </button>
      </div>

      {/* ===== 虛擬控制器 + 內嵌工具鈕（手機用）===== */}
      <VirtualControls
        setDirection={setDirection}
        setFire={setFire}
        onPause={isPlaying ? handlePause : null}
        onFullscreen={handleFullscreen}
      />

      {/* ===== 背景音樂播放器 ===== */}
      <BackgroundMusic isPlaying={isPlaying || isMenu} />

      {/* ===== 版權標記 ===== */}
      <footer className="copyright">
        © 2026 Poyu Chen. All rights reserved.
      </footer>
    </div>
  );
}
