(function () {
  const video = document.querySelector(".bg-video");
  if (!video) return;
  const rate = 1 / 3;
  const slow = () => {
    if (video.playbackRate !== rate) video.playbackRate = rate;
  };
  slow();
  ["loadedmetadata", "play", "playing", "seeked", "ratechange"].forEach((event) => {
    video.addEventListener(event, slow);
  });
})();
