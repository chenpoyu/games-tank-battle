/**
 * ============================================================
 * 虛擬搖桿 / 方向鍵與射擊按鈕 (VirtualControls)
 * ============================================================
 * 永遠顯示在畫面底部。
 * 同時支援 touch（手機）和 mouse（桌機）。
 *
 * 佈局（flex row）：
 *   [D-Pad]  —  [中間小按鈕區：⏸ ⛶]  —  [FIRE]
 *
 * 中間小按鈕區在手機上顯示（inline-controls），
 * 桌機上 toolbar 獨立顯示，這裡仍渲染但由 CSS 隱藏。
 */
import React, { useCallback, useRef } from 'react';

/**
 * @param {{
 *   setDirection: Function,
 *   setFire: Function,
 *   onPause?: Function|null,
 *   onFullscreen?: Function|null,
 * }} props
 */
export default function VirtualControls({ setDirection, setFire, onPause, onFullscreen }) {
  const activeDirRef = useRef(null);

  // ---- 方向按鈕：按下 ----
  const handleDirStart = useCallback((dir) => (e) => {
    e.preventDefault();
    activeDirRef.current = dir;
    setDirection(dir);
  }, [setDirection]);

  // ---- 方向按鈕：放開 ----
  const handleDirEnd = useCallback((e) => {
    e.preventDefault();
    activeDirRef.current = null;
    setDirection(null);
  }, [setDirection]);

  // ---- 射擊按鈕 ----
  const handleFireStart = useCallback((e) => {
    e.preventDefault();
    setFire(true);
  }, [setFire]);

  const handleFireEnd = useCallback((e) => {
    e.preventDefault();
    setFire(false);
  }, [setFire]);

  /** touch + mouse 雙軌事件綁定 */
  const dirEvents = (dir) => ({
    onTouchStart: handleDirStart(dir),
    onTouchEnd: handleDirEnd,
    onTouchCancel: handleDirEnd,
    onMouseDown: handleDirStart(dir),
    onMouseUp: handleDirEnd,
    onMouseLeave: handleDirEnd,
  });

  const fireEvents = {
    onTouchStart: handleFireStart,
    onTouchEnd: handleFireEnd,
    onTouchCancel: handleFireEnd,
    onMouseDown: handleFireStart,
    onMouseUp: handleFireEnd,
    onMouseLeave: handleFireEnd,
  };

  return (
    <div className="virtual-controls">
      {/* ===== 左側：D-Pad ===== */}
      <div className="dpad-container">
        <div className="dpad">
          <button className="dpad-btn dpad-up" {...dirEvents('up')} aria-label="上移">
            <svg viewBox="0 0 40 40" width="100%" height="100%">
              <polygon points="20,6 34,32 6,32" fill="currentColor" />
            </svg>
          </button>

          <button className="dpad-btn dpad-left" {...dirEvents('left')} aria-label="左移">
            <svg viewBox="0 0 40 40" width="100%" height="100%">
              <polygon points="6,20 32,6 32,34" fill="currentColor" />
            </svg>
          </button>

          <div className="dpad-center" />

          <button className="dpad-btn dpad-right" {...dirEvents('right')} aria-label="右移">
            <svg viewBox="0 0 40 40" width="100%" height="100%">
              <polygon points="34,20 8,6 8,34" fill="currentColor" />
            </svg>
          </button>

          <button className="dpad-btn dpad-down" {...dirEvents('down')} aria-label="下移">
            <svg viewBox="0 0 40 40" width="100%" height="100%">
              <polygon points="20,34 6,8 34,8" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== 中間：內嵌工具鈕（手機用，桌機由獨立 toolbar 提供）===== */}
      <div className="inline-controls">
        {onPause && (
          <button className="inline-btn" onClick={onPause} aria-label="暫停">
            ⏸
          </button>
        )}
        {onFullscreen && (
          <button className="inline-btn" onClick={onFullscreen} aria-label="全螢幕">
            ⛶
          </button>
        )}
      </div>

      {/* ===== 右側：射擊 ===== */}
      <div className="fire-container">
        <button className="fire-btn" {...fireEvents} aria-label="射擊">
          <span className="fire-btn-inner">FIRE</span>
        </button>
      </div>
    </div>
  );
}
