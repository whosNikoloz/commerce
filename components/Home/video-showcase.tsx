"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  // Try to autoplay on mount
  useEffect(() => {
    const v = videoRef.current;

    if (!v) return;

    v.muted = true;
    v.defaultMuted = true;

    const id = requestAnimationFrame(async () => {
      try {
        await v.play();
        setIsPlaying(true);
        setAutoplayFailed(false);
      } catch {
        setIsPlaying(false);
        setAutoplayFailed(true);
      }
    });

    return () => cancelAnimationFrame(id);
  }, []);

  const toggleMute = async () => {
    const v = videoRef.current;

    if (!v) return;

    const next = !isMuted;

    setIsMuted(next);
    v.muted = next;

    // If we unmute and video is paused due to policy, try to play
    if (!next && !isPlaying) {
      try {
        await v.play();
        setIsPlaying(true);
        setAutoplayFailed(false);
      } catch {
        /* ignore */
      }
    }
  };

  const togglePlayPause = async () => {
    const v = videoRef.current;

    if (!v) return;

    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      try {
        await v.play();
        setIsPlaying(true);
        setAutoplayFailed(false);
      } catch {
        // if blocked, unmute and try again
        v.muted = false;
        setIsMuted(false);
        try {
          await v.play();
          setIsPlaying(true);
          setAutoplayFailed(false);
        } catch {
          /* give up; user can try again */
        }
      }
    }
  };

  return (
    <section className="py-20 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="mb-6 text-4xl md:text-5xl font-bold text-text-light dark:text-text-lightdark">
            Behind the Brand
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-text-subtle dark:text-text-subtledark">
            Discover the craftsmanship and passion that goes into every product
          </p>
        </div>

        <div className="group relative mx-auto max-w-6xl overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            autoPlay
            loop
            playsInline
            className="h-[60vh] w-full object-cover"
            muted={isMuted}
            preload="auto"
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          >
            <source src="/Nike.mp4" type="video/mp4" />
          </video>

          {/* contrast overlay */}
          <div className="absolute inset-0 bg-black/20 transition-all duration-300 group-hover:bg-black/10" />

          {/* Center overlay: Play/Pause control */}
          <button
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="absolute inset-0 grid place-items-center"
            title={isPlaying ? "Pause video" : "Play video"}
            type="button"
            onClick={togglePlayPause}
          >
            <span className="rounded-full bg-brand-surface/20 dark:bg-brand-surfacedark/20 p-4 backdrop-blur-md transition hover:bg-brand-surface/30 dark:hover:bg-brand-surfacedark/30">
              {isPlaying ? (
                <Pause className="h-10 w-10 text-text-light dark:text-text-lightdark" />
              ) : (
                <Play className="h-10 w-10 text-text-light dark:text-text-lightdark" />
              )}
            </span>
          </button>

          {/* Mute/Unmute toggle (top-right) */}
          <div className="absolute right-6 top-6">
            <Button
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              className="bg-brand-surface/10 dark:bg-brand-surfacedark/10 text-text-light dark:text-text-lightdark backdrop-blur-md transition hover:bg-brand-surface/20 dark:hover:bg-brand-surfacedark/20"
              size="icon"
              type="button"
              variant="ghost"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>

          {/* CTA (bottom-left) */}
          <div className="absolute left-8 bottom-8">
            <Button
              className="rounded-full bg-brand-primary px-8 py-3 text-white transition hover:bg-brand-primarydark"
              type="button"
              onClick={() => {
                window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
              }}
            >
              <Play className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>

          {/* Optional hint if autoplay failed initially */}
          {autoplayFailed && (
            <div className="pointer-events-none absolute bottom-6 right-6 rounded-md bg-brand-surface/15 dark:bg-brand-surfacedark/15 px-3 py-1 text-sm text-text-light dark:text-text-lightdark backdrop-blur">
              Tap the center button to play
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
