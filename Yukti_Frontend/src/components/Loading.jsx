import "../styles/loading.css";

export default function Loading({ fullScreen = false, onFinish, simple = false }) {
  const handleVideoEnd = () => {
    if (fullScreen && onFinish) onFinish();
  };

  if (simple) {
    return (
      <div className={`loading-overlay ${fullScreen ? "loading-fullscreen" : ""}`}>
        <p className="loading-simple-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`loading-overlay ${fullScreen ? "loading-fullscreen" : ""}`}>
      <div className="loading-video-wrap">
        <video
          className="loading-video"
          autoPlay
          muted
          playsInline
          loop={!fullScreen}
          onEnded={fullScreen ? handleVideoEnd : undefined}
        >
          {/* VP9 + alpha — Chrome / Firefox / Edge */}
          <source src="/loading-transparent.webm" type="video/webm" />
          {/* HEVC + alpha — Safari / iOS */}
          <source src="/loading-transparent.mov" type='video/mp4; codecs="hvc1"' />
        </video>
      </div>
    </div>
  );
}
