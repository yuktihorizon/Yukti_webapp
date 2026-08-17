import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import HomeBgAudio from "../assets/home-bg-audio.mp3";

const BackgroundAudioContext = createContext(null);

const UNLOCK_EVENTS = ["pointerdown", "touchstart", "touchend", "click", "keydown"];

export function BackgroundAudioProvider({ children }) {
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef(null);
  const userMutedRef = useRef(false);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      userMutedRef.current = !next;
      return next;
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.45;

    const sync = async () => {
      if (soundOn) {
        try {
          await audio.play();
        } catch {
          setSoundOn(false);
        }
      } else {
        audio.pause();
      }
    };

    sync();
  }, [soundOn]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const unlock = async () => {
      if (userMutedRef.current) return;
      audio.volume = 0.45;
      try {
        await audio.play();
        setSoundOn(true);
        UNLOCK_EVENTS.forEach((type) => {
          document.removeEventListener(type, unlock, true);
        });
      } catch {
        setSoundOn(false);
      }
    };

    const attemptAutoplay = async () => {
      if (userMutedRef.current) return;
      audio.volume = 0.45;
      try {
        await audio.play();
        setSoundOn(true);
      } catch {
        setSoundOn(false);
        UNLOCK_EVENTS.forEach((type) => {
          document.addEventListener(type, unlock, { capture: true, passive: true });
        });
      }
    };

    attemptAutoplay();

    return () => {
      UNLOCK_EVENTS.forEach((type) => {
        document.removeEventListener(type, unlock, true);
      });
    };
  }, []);

  return (
    <BackgroundAudioContext.Provider value={{ soundOn, toggleSound }}>
      <audio
        ref={audioRef}
        className="bg-audio-element"
        src={HomeBgAudio}
        loop
        preload="auto"
      />
      {children}
    </BackgroundAudioContext.Provider>
  );
}

export function useBackgroundAudio() {
  const ctx = useContext(BackgroundAudioContext);
  if (!ctx) {
    throw new Error("useBackgroundAudio must be used within BackgroundAudioProvider");
  }
  return ctx;
}
