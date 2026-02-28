/**
 * ============================================================
 * SoundEffects - 遊戲音效管理器
 * ============================================================
 * 使用 Web Audio API 生成 8-bit 風格的遊戲音效。
 * 包含：發射、爆炸、通關等音效。
 */

export class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isMuted = false;
    this.init();
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.25;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.25;
    }
  }

  /**
   * 發射音效 - 短促的激光音
   */
  playShoot() {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    
    // 主音 - 從高頻滑落的方波
    const osc = this.audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    // 音量包絡
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 爆炸音效 - 噪音混合低頻震動
   */
  playExplosion() {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    
    // 噪音層 - 模擬爆炸的隨機性
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    // 低頻震動
    const bass = this.audioContext.createOscillator();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(150, now);
    bass.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    // 噪音濾波器 - 從高頻到低頻
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    // 音量包絡
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    bass.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    bass.start(now);
    noise.stop(now + 0.3);
    bass.stop(now + 0.3);
  }

  /**
   * 通關音效 - 勝利旋律
   */
  playLevelComplete() {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    
    // 勝利旋律音階（C大調上行）
    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.15 },  // E5
      { freq: 783.99, time: 0.3 },   // G5
      { freq: 1046.5, time: 0.45 },  // C6
    ];

    melody.forEach(note => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = note.freq;

      const gain = this.audioContext.createGain();
      const startTime = now + note.time;
      const duration = 0.2;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * 擊中音效 - 金屬碰撞聲
   */
  playHit() {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    
    // 金屬碰撞 - 高頻振盪快速衰減
    const osc = this.audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * 遊戲結束音效 - 下降音階
   */
  playGameOver() {
    if (!this.audioContext || this.isMuted) return;

    const now = this.audioContext.currentTime;
    
    // 失敗旋律（下行音階）
    const melody = [
      { freq: 523.25, time: 0 },     // C5
      { freq: 493.88, time: 0.15 },  // B4
      { freq: 440.00, time: 0.3 },   // A4
      { freq: 392.00, time: 0.45 },  // G4
    ];

    melody.forEach(note => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = note.freq;

      const gain = this.audioContext.createGain();
      const startTime = now + note.time;
      const duration = 0.25;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }
}

// 單例模式 - 確保全域只有一個音效管理器
let soundEffectsInstance = null;

export function getSoundEffects() {
  if (!soundEffectsInstance) {
    soundEffectsInstance = new SoundEffects();
  }
  return soundEffectsInstance;
}
