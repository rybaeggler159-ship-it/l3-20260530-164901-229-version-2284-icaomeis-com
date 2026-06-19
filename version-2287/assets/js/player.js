import { H as Hls } from './hls-vendor.js';

const players = Array.from(document.querySelectorAll('[data-player]'));
players.forEach((box) => {
    const video = box.querySelector('video');
    const source = video ? video.dataset.src : '';
    const button = box.querySelector('.play-button');
    const overlay = box.querySelector('.player-overlay');
    const note = box.parentElement ? box.parentElement.querySelector('.player-note') : null;

    if (!video || !source) {
        return;
    }

    const setNote = (message) => {
        if (note) {
            note.textContent = message;
        }
    };

    if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setNote('播放源已就绪');
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
                setNote('视频加载失败，请刷新页面后重试');
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', () => {
            setNote('播放源已就绪');
        });
    } else {
        setNote('当前浏览器不支持此播放格式');
    }

    const togglePlay = () => {
        if (video.paused) {
            video.play().catch(() => setNote('请再次点击播放'));
        } else {
            video.pause();
        }
    };

    video.addEventListener('click', togglePlay);
    if (button) {
        button.addEventListener('click', togglePlay);
    }
    video.addEventListener('play', () => {
        if (overlay) {
            overlay.classList.add('hide');
        }
    });
    video.addEventListener('pause', () => {
        if (overlay) {
            overlay.classList.remove('hide');
        }
    });
});
