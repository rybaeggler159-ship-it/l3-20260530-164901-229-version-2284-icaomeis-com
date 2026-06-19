import { H as Hls } from './hls.js';

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    initPlayer(player);
  });
});

function initPlayer(player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const status = player.querySelector('[data-player-status]');
  const source = player.getAttribute('data-video-src');
  let hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function load() {
    if (video.dataset.loaded === 'true') {
      playVideo();
      return;
    }

    video.dataset.loaded = 'true';
    video.controls = true;
    setStatus('正在加载');

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源重连中');
          recoverHls(hlsInstance, data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
    } else {
      video.src = source;
      playVideo();
    }
  }

  function playVideo() {
    const promise = video.play();

    if (promise && typeof promise.then === 'function') {
      promise
        .then(function () {
          player.classList.add('is-playing');
          setStatus('正在播放');
        })
        .catch(function () {
          player.classList.remove('is-playing');
          setStatus('点击继续播放');
        });
    } else {
      player.classList.add('is-playing');
      setStatus('正在播放');
    }
  }

  function pauseVideo() {
    video.pause();
    player.classList.remove('is-playing');
    setStatus('已暂停');
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      load();
    });
  }

  player.addEventListener('click', function (event) {
    if (event.target === video && video.dataset.loaded === 'true') {
      if (video.paused) {
        playVideo();
      } else {
        pauseVideo();
      }
    }
  });

  video.addEventListener('play', function () {
    player.classList.add('is-playing');
    setStatus('正在播放');
  });

  video.addEventListener('pause', function () {
    player.classList.remove('is-playing');
    setStatus('已暂停');
  });

  video.addEventListener('ended', function () {
    player.classList.remove('is-playing');
    setStatus('播放结束');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

function recoverHls(instance, data) {
  if (!instance || !data) {
    return;
  }

  if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
    instance.startLoad();
  } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
    instance.recoverMediaError();
  } else {
    instance.destroy();
  }
}
