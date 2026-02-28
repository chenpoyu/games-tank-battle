/**
 * ============================================================
 * BackgroundMusic - 背景音樂播放器
 * ============================================================
 * 使用 Web Audio API 生成 8-bit 風格的坦克遊戲背景音樂。
 * 提供音量控制、靜音切換功能。
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getSoundEffects } from '../game/SoundEffects.js';

/**
 * 使用 Web Audio API 生成簡單的 8-bit 風格循環音樂
 */
class ChiptunePlayer {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentNote = 0;
    this.oscillators = [];
    this.scheduledTime = 0;
  }

  init() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.15; // 降低音量避免過吵
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // 經典坦克遊戲風格的音樂音階（C大調）
  getNotes() {
    // 音符頻率 (Hz) - 簡化的旋律循環
    return [
      [523.25, 0.15], // C5
      [587.33, 0.15], // D5
      [659.25, 0.15], // E5
      [698.46, 0.15], // F5
      [783.99, 0.3],  // G5 (長音)
      [698.46, 0.15], // F5
      [659.25, 0.15], // E5
      [587.33, 0.3],  // D5 (長音)
      [523.25, 0.15], // C5
      [587.33, 0.15], // D5
      [659.25, 0.3],  // E5 (長音)
      [523.25, 0.45], // C5 (更長)
    ];
  }

  playNote(frequency, duration) {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const startTime = Math.max(now, this.scheduledTime);
    
    // 主旋律 - 方波 (8-bit 音色)
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'square';
    osc1.frequency.value = frequency;

    // 和聲 - 低八度方波
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = frequency / 2;

    // 音符包絡 Gain
    const noteGain = this.audioContext.createGain();
    noteGain.gain.value = 0;
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.01); // Attack
    noteGain.gain.exponentialRampToValueAtTime(0.2, startTime + duration - 0.05); // Sustain
    noteGain.gain.linearRampToValueAtTime(0.001, startTime + duration); // Release

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);

    this.scheduledTime = startTime + duration;
    this.oscillators.push(osc1, osc2);

    // 清理已停止的振盪器
    setTimeout(() => {
      const index1 = this.oscillators.indexOf(osc1);
      const index2 = this.oscillators.indexOf(osc2);
      if (index1 > -1) this.oscillators.splice(index1, 1);
      if (index2 > -1) this.oscillators.splice(index2, 1);
    }, duration * 1000 + 100);
  }

  play() {
    if (this.isPlaying) return;
    
    this.init();
    if (!this.audioContext) return;

    this.isPlaying = true;
    this.scheduledTime = this.audioContext.currentTime;
    this.currentNote = 0;

    const playLoop = () => {
      if (!this.isPlaying) return;

      const notes = this.getNotes();
      const [freq, duration] = notes[this.currentNote];
      
      this.playNote(freq, duration);
      this.currentNote = (this.currentNote + 1) % notes.length;

      // 安排下一個音符
      setTimeout(playLoop, duration * 1000);
    };

    playLoop();
  }

  pause() {
    this.isPlaying = false;
    // 停止所有當前振盪器
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // 已經停止，忽略錯誤
      }
    });
    this.oscillators = [];
  }

  setMuted(muted) {
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.15;
    }
  }
}

/**
 * @param {{
 *   isPlaying: boolean,
 * }} props
 */
export default function BackgroundMusic({ isPlaying }) {
  const playerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('tankgame-music-muted');
    return saved === 'true';
  });

  // 初始化播放器
  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = new ChiptunePlayer();
    }
    // 同步初始靜音狀態到音效管理器
    getSoundEffects().setMuted(isMuted);
  }, [isMuted]);

  // 切換靜音
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem('tankgame-music-muted', newValue);
      if (playerRef.current) {
        playerRef.current.setMuted(newValue);
      }
      // 同步音效的靜音狀態
      getSoundEffects().setMuted(newValue);
      return newValue;
    });
  }, []);

  // 根據遊戲狀態控制播放
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying && !isMuted) {
      player.play();
    } else {
      player.pause();
    }

    return () => {
      player.pause();
    };
  }, [isPlaying, isMuted]);

  return (
    <button
      className="music-toggle-btn"
      onClick={toggleMute}
      aria-label={isMuted ? '開啟音樂' : '關閉音樂'}
      title={isMuted ? '開啟背景音樂 (8-bit)' : '關閉背景音樂'}
    >
      {isMuted ? '🔇' : '🎵'}
    </button>
  );
}
