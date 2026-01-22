// Notification sound utility
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxm8gBS';

let audioElement: HTMLAudioElement | null = null;

export const initializeNotificationSound = () => {
    if (!audioElement) {
        audioElement = new Audio(NOTIFICATION_SOUND_URL);
        audioElement.volume = 0.5;
    }
    return audioElement;
};

export const playNotificationSound = () => {
    try {
        const audio = audioElement || initializeNotificationSound();
        audio.currentTime = 0;
        audio.play().catch(err => {
            console.log('Failed to play notification sound:', err);
        });
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
};

export const setNotificationVolume = (volume: number) => {
    const audio = audioElement || initializeNotificationSound();
    audio.volume = Math.max(0, Math.min(1, volume));
};

export const  cleanupNotificationSound = () => {
    if (audioElement) {
        audioElement.pause();
        audioElement = null;
    }
};
