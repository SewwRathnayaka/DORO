// src/services/audio.ts
// Web-only audio service using HTML5 Audio (no Expo)

const isWeb = typeof window !== 'undefined';

// Static URLs so Vite can resolve and bundle assets
const getUrls = () => ({
  click: new URL('../../assets/audio/click.mp3', import.meta.url).href,
  background: new URL('../../assets/audio/background.mp3', import.meta.url).href,
  pomodoro: new URL('../../assets/audio/pomodoro.mp3', import.meta.url).href,
  victory: new URL('../../assets/audio/victory.mp3', import.meta.url).href,
  breakAlarm: new URL('../../assets/audio/break-alarm.mp3', import.meta.url).href,
  sad: new URL('../../assets/audio/sad.mp3', import.meta.url).href,
});

class AudioService {
  private clickSound: HTMLAudioElement | null = null;
  private victorySound: HTMLAudioElement | null = null;
  private breakAlarm: HTMLAudioElement | null = null;
  private sadSound: HTMLAudioElement | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;
  private pomodoroMusic: HTMLAudioElement | null = null;

  private soundsEnabled = true;
  private musicEnabled = true;
  private volume = 0.7;
  private isBackgroundMusicPlaying = false;
  private isPomodoroMusicPlaying = false;

  async initialize(): Promise<void> {
    // No-op for web
  }

  async loadSounds(): Promise<void> {
    if (!isWeb) return;
    try {
      const urls = getUrls();
      this.clickSound = new Audio(urls.click);
      this.victorySound = new Audio(urls.victory);
      this.breakAlarm = new Audio(urls.breakAlarm);
      this.sadSound = new Audio(urls.sad);
      this.backgroundMusic = new Audio(urls.background);
      this.pomodoroMusic = new Audio(urls.pomodoro);

      if (this.backgroundMusic) this.backgroundMusic.loop = true;
      if (this.pomodoroMusic) this.pomodoroMusic.loop = true;
      this.updateAllVolumes();
    } catch (e) {
      if (import.meta.env?.DEV) console.error('Error loading audio:', e);
    }
  }

  setSettings(settings: { soundsEnabled?: boolean; musicEnabled?: boolean; volume?: number }): void {
    if (settings.soundsEnabled !== undefined) this.soundsEnabled = settings.soundsEnabled;
    if (settings.musicEnabled !== undefined) {
      this.musicEnabled = settings.musicEnabled;
      if (!this.musicEnabled) {
        this.stopBackgroundMusic();
        this.stopPomodoroMusic();
      }
    }
    if (settings.volume !== undefined) {
      this.volume = Math.max(0, Math.min(1, settings.volume));
      this.updateAllVolumes();
    }
  }

  private updateAllVolumes(): void {
    const setVol = (el: HTMLAudioElement | null, mult = 1) => {
      if (el) el.volume = this.volume * mult;
    };
    setVol(this.clickSound);
    setVol(this.victorySound);
    setVol(this.breakAlarm);
    setVol(this.sadSound);
    setVol(this.backgroundMusic, 0.5);
    setVol(this.pomodoroMusic, 0.6);
  }

  private replay(el: HTMLAudioElement | null): void {
    if (!this.soundsEnabled || !el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }

  async playClickSound(): Promise<void> {
    this.replay(this.clickSound);
  }
  async playVictorySound(): Promise<void> {
    this.replay(this.victorySound);
  }
  async playBreakAlarm(): Promise<void> {
    this.replay(this.breakAlarm);
  }
  async playSadSound(): Promise<void> {
    this.replay(this.sadSound);
  }

  async playBackgroundMusic(): Promise<void> {
    if (!this.musicEnabled || !this.backgroundMusic) return;
    if (this.isPomodoroMusicPlaying) await this.stopPomodoroMusic();
    try {
      await this.backgroundMusic.play();
      this.isBackgroundMusicPlaying = true;
    } catch {
      // Audio context may need user interaction first
    }
  }

  async stopBackgroundMusic(): Promise<void> {
    if (!this.backgroundMusic || !this.isBackgroundMusicPlaying) return;
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    this.isBackgroundMusicPlaying = false;
  }

  async playPomodoroMusic(): Promise<void> {
    if (!this.musicEnabled || !this.pomodoroMusic || this.isPomodoroMusicPlaying) return;
    if (this.isBackgroundMusicPlaying) await this.stopBackgroundMusic();
    try {
      await this.pomodoroMusic.play();
      this.isPomodoroMusicPlaying = true;
    } catch (e) {
      if (import.meta.env?.DEV) console.error('Error playing pomodoro music:', e);
    }
  }

  async stopPomodoroMusic(): Promise<void> {
    if (!this.pomodoroMusic || !this.isPomodoroMusicPlaying) return;
    this.pomodoroMusic.pause();
    this.pomodoroMusic.currentTime = 0;
    this.isPomodoroMusicPlaying = false;
  }

  async pausePomodoroMusic(): Promise<void> {
    if (this.pomodoroMusic && this.isPomodoroMusicPlaying) this.pomodoroMusic.pause();
  }

  async resumePomodoroMusic(): Promise<void> {
    if (this.musicEnabled && this.pomodoroMusic && this.isPomodoroMusicPlaying) {
      this.pomodoroMusic.play().catch(() => {});
    }
  }

  async stopAll(): Promise<void> {
    await this.stopBackgroundMusic();
    await this.stopPomodoroMusic();
  }

  async cleanup(): Promise<void> {
    await this.stopAll();
    this.clickSound = this.victorySound = this.breakAlarm = this.sadSound = null;
    this.backgroundMusic = this.pomodoroMusic = null;
  }

  getSettings(): { soundsEnabled: boolean; musicEnabled: boolean; volume: number } {
    return { soundsEnabled: this.soundsEnabled, musicEnabled: this.musicEnabled, volume: this.volume };
  }

  async testAudio(): Promise<boolean> {
    await this.playClickSound();
    return true;
  }
}

export const audioService = new AudioService();
