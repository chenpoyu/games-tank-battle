/**
 * ============================================================
 * useInputHandler Hook
 * ============================================================
 * 統一管理鍵盤 (WASD / 方向鍵) 與觸控虛擬按鈕的輸入。
 * 將輸入狀態同步到 GameEngine 的 keys 物件。
 */
import { useEffect, useCallback, useRef } from 'react';

/**
 * @param {import('../game/GameEngine.js').GameEngine | null} engine
 */
export function useInputHandler(engine) {
  // 使用 ref 追蹤 engine 避免重複綁定
  const engineRef = useRef(engine);
  engineRef.current = engine;

  // ---- 鍵盤事件處理 ----
  const handleKeyDown = useCallback((e) => {
    const eng = engineRef.current;
    if (!eng) return;

    switch (e.key.toLowerCase()) {
      case 'w': case 'arrowup':
        eng.keys.up = true; e.preventDefault(); break;
      case 's': case 'arrowdown':
        eng.keys.down = true; e.preventDefault(); break;
      case 'a': case 'arrowleft':
        eng.keys.left = true; e.preventDefault(); break;
      case 'd': case 'arrowright':
        eng.keys.right = true; e.preventDefault(); break;
      case ' ': case 'j':
        eng.keys.fire = true; e.preventDefault(); break;
      case 'p': case 'escape':
        eng.togglePause(); e.preventDefault(); break;
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    const eng = engineRef.current;
    if (!eng) return;

    switch (e.key.toLowerCase()) {
      case 'w': case 'arrowup':    eng.keys.up = false; break;
      case 's': case 'arrowdown':  eng.keys.down = false; break;
      case 'a': case 'arrowleft':  eng.keys.left = false; break;
      case 'd': case 'arrowright': eng.keys.right = false; break;
      case ' ': case 'j':          eng.keys.fire = false; break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // ---- 提供給虛擬按鈕的觸控介面 ----
  const setDirection = useCallback((dir) => {
    const eng = engineRef.current;
    if (!eng) return;
    // 先重置所有方向
    eng.keys.up = false;
    eng.keys.down = false;
    eng.keys.left = false;
    eng.keys.right = false;
    // 設定新方向
    if (dir) {
      eng.keys[dir] = true;
    }
  }, []);

  const setFire = useCallback((firing) => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.keys.fire = firing;
  }, []);

  return { setDirection, setFire };
}
