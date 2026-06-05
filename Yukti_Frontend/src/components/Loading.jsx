import "../styles/loading.css";

export default function Loading({ fullScreen = false }) {
  return (
    <div className={`loading-overlay ${fullScreen ? "loading-fullscreen" : ""}`}>
      <div className="loading-video-wrap">
        <video
          className="loading-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/loading.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
