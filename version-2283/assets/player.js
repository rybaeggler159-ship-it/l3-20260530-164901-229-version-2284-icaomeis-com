import { H as Hls } from './hls-vendor.js';

function showMessage(container, message) {
  var messageBox = container.querySelector('[data-player-message]');

  if (!messageBox) {
    return;
  }

  messageBox.textContent = message;
  messageBox.classList.add('is-visible');
}

function attachSource(video, source) {
  var isHlsSource = source.indexOf('.m3u8') !== -1;

  if (isHlsSource && Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    return hls;
  }

  if (isHlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return null;
  }

  video.src = source;
  return null;
}

function setupPlayer(container) {
  var video = container.querySelector('video');
  var button = container.querySelector('.play-overlay');
  var source = container.dataset.videoSrc;
  var initialized = false;
  var hlsInstance = null;

  if (!video || !button || !source) {
    return;
  }

  function play() {
    if (!initialized) {
      try {
        hlsInstance = attachSource(video, source);
        initialized = true;
      } catch (error) {
        showMessage(container, '视频初始化失败，请稍后重试。');
        return;
      }
    }

    video.controls = true;
    container.classList.add('is-playing');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showMessage(container, '浏览器阻止了自动播放，请再次点击播放器开始播放。');
        container.classList.remove('is-playing');
      });
    }
  }

  button.addEventListener('click', play);

  video.addEventListener('pause', function () {
    if (!video.ended) {
      container.classList.remove('is-playing');
    }
  });

  video.addEventListener('play', function () {
    container.classList.add('is-playing');
  });

  video.addEventListener('error', function () {
    showMessage(container, '当前播放源暂时无法加载，请刷新页面或稍后重试。');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.js-video-player').forEach(setupPlayer);
});
