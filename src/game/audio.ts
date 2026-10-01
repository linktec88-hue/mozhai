// 墨斋谜局 · 音频管理器
// 浏览器自动播放策略：首次用户交互后 unlock()，此后所有音效可用。

type SoundName =
  | 'bgm'
  | 'click'
  | 'success'
  | 'fail'
  | 'paper'
  | 'door'
  | 'stone'
  | 'hint'
  | 'pickup'
  | 'dawn';

class AudioManager {
  private cache: Record<string, HTMLAudioElement> = {};
  private bgmEl: HTMLAudioElement | null = null;
  private dawnEl: HTMLAudioElement | null = null;
  private unlocked = false;
  muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem('mozhai-muted') === '1';
    } catch {
      /* ignore */
    }
  }

  private el(name: SoundName): HTMLAudioElement {
    if (!this.cache[name]) {
      const a = new Audio(`${import.meta.env.BASE_URL}audio/${name}.mp3`);
      a.preload = 'auto';
      this.cache[name] = a;
    }
    return this.cache[name];
  }

  /** 在用户首次交互时调用，解锁音频并播放背景音乐 */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.startBgm();
  }

  startBgm() {
    if (this.muted) return;
    if (!this.bgmEl) {
      this.bgmEl = this.el('bgm');
      this.bgmEl.loop = true;
      this.bgmEl.volume = 0.3;
    }
    this.bgmEl.play().catch(() => {});
  }

  stopBgm() {
    this.bgmEl?.pause();
  }

  play(name: SoundName, vol = 0.75) {
    if (this.muted || !this.unlocked) return;
    const src = this.el(name);
    const a = src.cloneNode() as HTMLAudioElement;
    a.volume = vol;
    a.play().catch(() => {});
  }

  /** 结局：清晨氛围（循环） */
  playDawn() {
    if (this.muted || !this.unlocked) return;
    if (!this.dawnEl) {
      this.dawnEl = this.el('dawn');
      this.dawnEl.loop = true;
      this.dawnEl.volume = 0.45;
    }
    this.dawnEl.play().catch(() => {});
  }

  stopDawn() {
    this.dawnEl?.pause();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('mozhai-muted', this.muted ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (this.muted) {
      this.stopBgm();
      this.stopDawn();
    } else if (this.unlocked) {
      this.startBgm();
    }
    return this.muted;
  }
}

export const audio = new AudioManager();
