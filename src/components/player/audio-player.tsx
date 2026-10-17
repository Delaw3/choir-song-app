"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Repeat, Rewind, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { formatDuration } from "@/lib/utils";
import type { Song, SongPart } from "@/types/song";

export function AudioPlayer({ song, selectedPart }: { song: Song; selectedPart: SongPart }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(selectedPart.duration ?? 0);
  const [loop, setLoop] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [repeatA, setRepeatA] = useState<number | null>(null);
  const [repeatB, setRepeatB] = useState<number | null>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !selectedPart.audioUrl) {
      setIsPlaying((value) => !value);
      return;
    }

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seek = (offset: number) => {
    const next = Math.min(Math.max(currentTime + offset, 0), duration);
    setCurrentTime(next);
    if (audioRef.current) audioRef.current.currentTime = next;
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 text-slate-950 shadow-xl shadow-slate-300/40 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:shadow-slate-950/20">
      <audio
        ref={audioRef}
        src={selectedPart.audioUrl}
        loop={loop}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || selectedPart.duration || 0)}
        onTimeUpdate={(event) => {
          const next = event.currentTarget.currentTime;
          if (repeatB !== null && repeatA !== null && next >= repeatB) {
            event.currentTarget.currentTime = repeatA;
            setCurrentTime(repeatA);
            return;
          }
          setCurrentTime(next);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <div>
        <p className="text-sm font-semibold text-violet-700 dark:text-violet-200">{selectedPart.displayName}</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight">{song.title}</h2>
      </div>

      <div className="mt-7">
        <input
          aria-label="Audio progress"
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={(event) => {
            const next = Number(event.target.value);
            setCurrentTime(next);
            if (audioRef.current) audioRef.current.currentTime = next;
          }}
          className="w-full accent-violet-400"
        />
        <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-300">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {!selectedPart.audioUrl ? (
        <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-white/10 dark:text-slate-200">
          Audio for this part is not uploaded yet. The player controls remain available for UI testing.
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-center gap-3">
        <IconButton label="Skip backward 10 seconds" onClick={() => seek(-10)} className="bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
          <Rewind className="size-5" />
        </IconButton>
        <button
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
          className="flex size-16 items-center justify-center rounded-full bg-violet-500 text-white shadow-xl shadow-violet-500/30 transition active:scale-95"
        >
          {isPlaying ? <Pause className="size-7" /> : <Play className="ml-1 size-7" />}
        </button>
        <IconButton label="Skip forward 10 seconds" onClick={() => seek(10)} className="bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
          <FastForward className="size-5" />
        </IconButton>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Button variant={loop ? "secondary" : "ghost"} size="sm" onClick={() => setLoop((value) => !value)} className="dark:border-white/10 dark:text-white dark:hover:bg-white/10">
          <Repeat className="size-4" /> Loop
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSpeed((value) => (value >= 1.5 ? 0.75 : value + 0.25))}
          className="dark:border-white/10 dark:text-white dark:hover:bg-white/10"
        >
          {speed.toFixed(2).replace(".00", "")}x
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (repeatA === null) setRepeatA(currentTime);
            else if (repeatB === null) setRepeatB(currentTime);
            else {
              setRepeatA(null);
              setRepeatB(null);
            }
          }}
          className="dark:border-white/10 dark:text-white dark:hover:bg-white/10"
        >
          A-B
        </Button>
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-slate-400">
        A {repeatA === null ? "--" : formatDuration(repeatA)} · B {repeatB === null ? "--" : formatDuration(repeatB)}
      </p>
    </section>
  );
}
