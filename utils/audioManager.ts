// 全局音频管理器
class AudioManager {
    private audios: Map<string, HTMLAudioElement> = new Map();
    private isUnlocked: boolean = false;
    private _volume: number = 0.1;

    constructor() {
        // 创建多个音频对象
        this.audios.set('card-select', new Audio('/sounds/card-select.mp3'));
        this.audios.set('card-select2', new Audio('/sounds/card-select2.mp3'));
        
        this.audios.forEach(audio => {
            audio.volume = this._volume;
            audio.preload = 'auto';
        });
    }

    setVolume(v: number) {
        this._volume = Math.min(1, Math.max(0, v));
        this.audios.forEach(audio => { audio.volume = this._volume; });
    }

    getVolume() {
        return this._volume;
    }

    // 解锁音频播放
    async unlock(): Promise<boolean> {
        if (this.isUnlocked) return this.isUnlocked;
        
        try {
            // 尝试播放并立即暂停，这样可以解锁音频
            const audio = this.audios.get('card-select');
            if (audio) {
                await audio.play();
                audio.pause();
                audio.currentTime = 0;
            }
            this.isUnlocked = true;
            return true;
        } catch (error) {
            return false;
        }
    }

    // 播放指定音效
    async play(soundName: string = 'card-select'): Promise<void> {
        const audio = this.audios.get(soundName);
        if (!audio) return;
        
        try {
            // 重置到开头
            audio.currentTime = 0;
            
            // 直接尝试播放（如果用户已经移动过鼠标，音频应该已经解锁）
            await audio.play();
            
            // 如果播放成功，标记为已解锁
            if (!this.isUnlocked) {
                this.isUnlocked = true;
            }
        } catch (error: any) {
            // 如果播放失败且未解锁，尝试解锁后再播放
            if (!this.isUnlocked) {
                const unlocked = await this.unlock();
                if (unlocked) {
                    try {
                        audio.currentTime = 0;
                        await audio.play();
                    } catch (e) {
                        // 静默处理错误
                    }
                }
            }
        }
    }
}

// 导出单例
export const audioManager = new AudioManager();
