(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
        players.forEach(function (video) {
            var frame = video.closest(".player-frame");
            var trigger = frame ? frame.querySelector(".play-trigger") : null;
            var stream = video.getAttribute("data-stream");
            var prepared = false;
            var hlsInstance = null;

            function prepare() {
                if (prepared || !stream) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = stream;
            }

            function play() {
                prepare();
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (trigger) {
                trigger.addEventListener("click", play);
            }
            video.addEventListener("play", function () {
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (trigger && video.currentTime === 0) {
                    trigger.classList.remove("is-hidden");
                }
            });
            video.addEventListener("loadedmetadata", function () {
                if (hlsInstance) {
                    hlsInstance.startLoad(-1);
                }
            });
        });
    });
})();
