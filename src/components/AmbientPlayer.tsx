"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type SoundMode = "rain" | "fire" | "pad";

const SOUND_LABELS: Record<SoundMode, string> = {
  rain: "빗소리",
  fire: "벽난로",
  pad: "심야 코드",
};

export default function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<SoundMode>("rain");
  const [volume, setVolume] = useState(0.35);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stopAudio = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    masterGainRef.current = null;
  };

  const startAudio = (selectedMode: SoundMode, currentVol: number) => {
    stopAudio();

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = currentVol;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    if (selectedMode === "rain" || selectedMode === "fire") {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (selectedMode === "rain") {
          data[i] = (lastOut + 0.04 * white) / 1.04;
          lastOut = data[i];
          data[i] *= 2.2;
        } else {
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          const crackle = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 0.45 : 0;
          data[i] = data[i] * 2.5 + crackle;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = selectedMode === "rain" ? 950 : 520;

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();

      cleanupRef.current = () => {
        try {
          noise.stop();
          noise.disconnect();
        } catch {}
      };
    } else {
      const freqs = [174.61, 220.0, 261.63, 329.63];
      const oscs: OscillatorNode[] = [];
      const padGain = ctx.createGain();
      padGain.gain.value = 0.14;
      padGain.connect(masterGain);

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.value = f;
        osc.connect(padGain);
        osc.start();
        oscs.push(osc);
      });

      cleanupRef.current = () => {
        oscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {}
        });
      };
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(mode, volume);
      setIsPlaying(true);
    }
  };

  const handleModeChange = (nextMode: SoundMode) => {
    setMode(nextMode);
    if (isPlaying) {
      startAudio(nextMode, volume);
    }
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5 border border-[var(--border-main)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px]">
      <button
        type="button"
        onClick={togglePlay}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-bold transition ${
          isPlaying
            ? "bg-[var(--accent)] text-[var(--accent-text)]"
            : "text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
        }`}
        title={isPlaying ? "배경음악 끄기" : "배경음악 켜기"}
      >
        {isPlaying ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        <span>{isPlaying ? "ON" : "BGM"}</span>
      </button>

      <div className="flex items-center divide-x divide-[var(--border-subtle)] border-l border-[var(--border-subtle)] pl-1.5">
        {(Object.keys(SOUND_LABELS) as SoundMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleModeChange(item)}
            className={`px-1.5 py-0.5 font-medium transition ${
              mode === item
                ? "font-bold text-[var(--accent)] underline underline-offset-4"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {SOUND_LABELS[item]}
          </button>
        ))}
      </div>

      {isPlaying && (
        <input
          type="range"
          min={0.05}
          max={0.8}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="배경음악 볼륨"
          className="ml-1 h-1 w-14 cursor-pointer accent-[var(--accent)]"
        />
      )}
    </div>
  );
}