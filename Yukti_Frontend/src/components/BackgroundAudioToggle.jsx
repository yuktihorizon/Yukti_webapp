import { Volume2, VolumeX } from "lucide-react";
import { useBackgroundAudio } from "../context/BackgroundAudioContext";
import "../styles/backgroundAudio.css";

export default function BackgroundAudioToggle() {
  const { soundOn, toggleSound } = useBackgroundAudio();

  return (
    <button
      type="button"
      className={`bg-audio-fab ${soundOn ? "is-on" : "is-off"}`}
      onClick={toggleSound}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Mute background audio" : "Play background audio"}
    >
      <span className="bg-audio-fab__ring" aria-hidden="true" />
      <span className="bg-audio-fab__ring bg-audio-fab__ring--delay" aria-hidden="true" />
      <span className="bg-audio-fab__icon">
        {soundOn ? (
          <Volume2 size={22} strokeWidth={2.25} />
        ) : (
          <VolumeX size={22} strokeWidth={2.25} />
        )}
      </span>
      {!soundOn && <span className="bg-audio-fab__hint">Tap for sound</span>}
      {soundOn && (
        <span className="bg-audio-fab__eq" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      )}
    </button>
  );
}
