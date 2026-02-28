/**
 * ============================================================
 * useResponsiveCanvas Hook
 * ============================================================
 * 負責計算響應式 Canvas 尺寸。
 * 根據視窗大小自動調整，保持 16:9 比例。
 *
 * 手機直向時 Canvas 寬度 = 螢幕寬度，高度由比例決定；
 * 剩餘空間全部給控制器（按鈕越大，老人家越好按）。
 * 手機橫向 / 桌機時扣除 HUD + 控制器高度後填滿。
 */
import { useState, useEffect, useCallback } from 'react';
import { ASPECT_RATIO } from '../game/constants.js';

/**
 * @returns {{ canvasWidth: number, canvasHeight: number, scale: number }}
 */
export function useResponsiveCanvas() {
  const [dimensions, setDimensions] = useState({ canvasWidth: 800, canvasHeight: 450, scale: 1 });

  const calculateSize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isPortraitMobile = vw < 768 && vh > vw;
    const isLandscapeMobile = vw < 1024 && vh <= vw && vh < 600;

    let hudHeight, toolbarHeight, controlsHeight, gap;

    if (isPortraitMobile) {
      // ── 手機直向 ──
      // HUD 壓到最薄（單行）、toolbar 合併進 controls 區域（= 0）
      // Canvas 以全寬為基準算高度，剩下的空間全給控制器
      hudHeight = 28;
      toolbarHeight = 0; // toolbar 合併到 controls 內
      gap = 4;

      // Canvas 填滿寬度 → 高度由 16:9 決定
      let canvasWidth = vw;
      let canvasHeight = Math.floor(canvasWidth / ASPECT_RATIO);

      // 控制區域 = 剩餘空間
      const remaining = vh - hudHeight - canvasHeight - gap;
      // 若剩餘空間太少（< 120px），就限縮 canvas 高度騰出空間
      if (remaining < 120) {
        const minControls = 120;
        canvasHeight = vh - hudHeight - minControls - gap;
        canvasWidth = Math.floor(canvasHeight * ASPECT_RATIO);
      }

      canvasWidth = Math.max(280, Math.floor(canvasWidth));
      canvasHeight = Math.max(140, Math.floor(canvasHeight));
      const scale = canvasWidth / 1280;
      setDimensions({ canvasWidth, canvasHeight, scale });
      return;
    }

    if (isLandscapeMobile) {
      // ── 手機 / 小平板橫向 ──
      hudHeight = 26;
      toolbarHeight = 0;
      controlsHeight = Math.min(140, Math.max(90, vh * 0.22));
      gap = 2;
    } else {
      // ── 桌機 / 大平板 ──
      hudHeight = 44;
      toolbarHeight = 36;
      controlsHeight = Math.min(200, Math.max(120, Math.min(vw, vh) * 0.22));
      gap = 6;
    }

    const availableHeight = vh - hudHeight - toolbarHeight - controlsHeight - gap;
    const availableWidth = vw;

    let canvasWidth = availableWidth;
    let canvasHeight = canvasWidth / ASPECT_RATIO;

    if (canvasHeight > availableHeight) {
      canvasHeight = availableHeight;
      canvasWidth = canvasHeight * ASPECT_RATIO;
    }
    if (canvasWidth > availableWidth) {
      canvasWidth = availableWidth;
      canvasHeight = canvasWidth / ASPECT_RATIO;
    }

    canvasWidth = Math.max(280, Math.floor(canvasWidth));
    canvasHeight = Math.max(140, Math.floor(canvasHeight));
    const scale = canvasWidth / 1280;
    setDimensions({ canvasWidth, canvasHeight, scale });
  }, []);

  useEffect(() => {
    calculateSize();
    window.addEventListener('resize', calculateSize);
    window.addEventListener('orientationchange', () => setTimeout(calculateSize, 150));
    // 監聽全螢幕變更
    document.addEventListener('fullscreenchange', calculateSize);

    return () => {
      window.removeEventListener('resize', calculateSize);
      window.removeEventListener('orientationchange', calculateSize);
      document.removeEventListener('fullscreenchange', calculateSize);
    };
  }, [calculateSize]);

  return dimensions;
}
