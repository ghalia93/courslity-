"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Captions,
  Clock3,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  buildCourseExplainer,
  isLiuComputerCommunicationCourse,
  type CourseExplainerScene,
} from "@/lib/courseExplainer";

type CourseForExplainer = {
  code: string;
  title: string;
  description: string;
  videoUrl?: string | null;
  videoTitle?: string | null;
  credits?: string | number;
  level?: string;
  language?: string;
  university: string;
  department: string;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getSceneIndex(
  elapsedSeconds: number,
  scenes: CourseExplainerScene[],
  durationSeconds: number,
) {
  const sceneDuration = durationSeconds / scenes.length;
  return Math.min(
    scenes.length - 1,
    Math.max(0, Math.floor(elapsedSeconds / sceneDuration)),
  );
}

function canUseSpeech() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function isDirectVideoSource(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host.endsWith("youtube.com")) {
      const videoId =
        parsed.searchParams.get("v") ||
        parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host.endsWith("vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return url;
  } catch {
    return null;
  }
}

export default function CourseExplainerVideo({
  course,
}: {
  course: CourseForExplainer;
}) {
  const customVideoUrl = course.videoUrl?.trim() || "";
  const shouldShowVideo =
    !!customVideoUrl || isLiuComputerCommunicationCourse(course);
  const explainer = useMemo(() => buildCourseExplainer(course), [course]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [customDurationSeconds, setCustomDurationSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isPlaying || customVideoUrl) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((currentElapsed) => {
        const nextElapsed = currentElapsed + 0.12;

        if (nextElapsed >= explainer.durationSeconds) {
          setIsPlaying(false);
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
          }
          return explainer.durationSeconds;
        }

        return nextElapsed;
      });
    }, 120);

    return () => window.clearInterval(interval);
  }, [customVideoUrl, explainer.durationSeconds, isPlaying]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!shouldShowVideo) return null;

  const effectiveDuration =
    customVideoUrl && customDurationSeconds > 0
      ? customDurationSeconds
      : explainer.durationSeconds;
  const currentSceneIndex = getSceneIndex(
    elapsedSeconds,
    explainer.scenes,
    effectiveDuration,
  );
  const currentScene = explainer.scenes[currentSceneIndex];
  const progress = Math.min(100, (elapsedSeconds / effectiveDuration) * 100);

  if (customVideoUrl) {
    const embedUrl = getEmbedUrl(customVideoUrl);
    const videoTitle = course.videoTitle?.trim() || explainer.title;
    const directVideo = isDirectVideoSource(customVideoUrl);

    function handleCustomPlayPause() {
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        void video.play();
      } else {
        video.pause();
      }
    }

    function handleCustomRestart() {
      const video = videoRef.current;
      if (!video) return;

      video.currentTime = 0;
      void video.play();
    }

    function handleCustomSceneSelect(index: number) {
      const video = videoRef.current;
      const sceneDuration = effectiveDuration / explainer.scenes.length;
      const nextTime = sceneDuration * index;
      setElapsedSeconds(nextTime);

      if (!video) return;
      video.currentTime = nextTime;
      video.pause();
    }

    return (
      <section
        id="course-explainer-video"
        className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-[#F6FBFF] p-4 dark:border-zinc-700 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6155F5] text-white shadow-sm">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Course Explainer Video
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {course.code} - LIU Computer and Communications Engineering
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-zinc-300">
            <Clock3 className="h-4 w-4 text-[#6155F5]" />
            Max {formatDuration(effectiveDuration)}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="relative min-h-[330px] bg-[#0F172A] p-5 text-white sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-slate-700">
              <div
                className="h-full bg-[#67D4C2] transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#A8DCE0]">
                Scene {currentSceneIndex + 1} of {explainer.scenes.length}
              </span>
              <span className="text-sm text-slate-300">
                {formatDuration(elapsedSeconds)} /{" "}
                {formatDuration(effectiveDuration)}
              </span>
            </div>

            <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
              {directVideo ? (
                <video
                  ref={videoRef}
                  className="h-full w-full"
                  src={customVideoUrl}
                  title={videoTitle}
                  muted={!voiceEnabled}
                  playsInline
                  onLoadedMetadata={(event) => {
                    const duration = event.currentTarget.duration;
                    if (Number.isFinite(duration) && duration > 0) {
                      setCustomDurationSeconds(duration);
                    }
                  }}
                  onTimeUpdate={(event) =>
                    setElapsedSeconds(event.currentTarget.currentTime)
                  }
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              ) : embedUrl ? (
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-300">
                  The saved video link could not be embedded.
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {currentScene.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-slate-100"
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between bg-white p-5 dark:bg-zinc-900 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase text-[#6155F5]">
                Video Script
              </p>
              <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                {videoTitle}
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-zinc-300">
                {currentScene.caption}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {explainer.scenes.map((scene, index) => (
                  <button
                    key={scene.title}
                    type="button"
                    onClick={() => handleCustomSceneSelect(index)}
                    className={`h-2 rounded-full transition ${
                      index <= currentSceneIndex
                        ? "bg-[#6155F5]"
                        : "bg-slate-200 dark:bg-zinc-700"
                    }`}
                    aria-label={`Go to ${scene.title}`}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCustomPlayPause}
                  disabled={!directVideo}
                  className="inline-flex items-center gap-2 rounded-full bg-[#6155F5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4E43D8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isPlaying ? "Pause" : "Play"}
                </button>

                <button
                  type="button"
                  onClick={handleCustomRestart}
                  disabled={!directVideo}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  Replay
                </button>

                <button
                  type="button"
                  onClick={() => setVoiceEnabled((current) => !current)}
                  disabled={!directVideo}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {voiceEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  Voice
                </button>
              </div>

              <div className="rounded-xl bg-[#EEF7F7] p-3 text-sm leading-6 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Caption:
                </span>{" "}
                {currentScene.caption}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function startNarration() {
    if (!voiceEnabled || !canUseSpeech()) return;

    window.speechSynthesis.cancel();
    const narration = new SpeechSynthesisUtterance(explainer.narration);
    narration.rate = 0.96;
    narration.pitch = 1;
    narration.volume = 1;
    window.speechSynthesis.speak(narration);
  }

  function handlePlayPause() {
    if (isPlaying) {
      setIsPlaying(false);
      if (canUseSpeech()) window.speechSynthesis.pause();
      return;
    }

    if (elapsedSeconds >= explainer.durationSeconds) {
      setElapsedSeconds(0);
    }

    setIsPlaying(true);
    if (canUseSpeech() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      startNarration();
    }
  }

  function handleRestart() {
    setElapsedSeconds(0);
    setIsPlaying(true);
    startNarration();
  }

  function handleVoiceToggle() {
    const nextValue = !voiceEnabled;
    setVoiceEnabled(nextValue);

    if (!canUseSpeech()) return;
    window.speechSynthesis.cancel();
    if (nextValue && isPlaying) {
      const narration = new SpeechSynthesisUtterance(explainer.narration);
      narration.rate = 0.96;
      window.speechSynthesis.speak(narration);
    }
  }

  return (
    <section
      id="course-explainer-video"
      className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-[#F6FBFF] p-4 dark:border-zinc-700 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6155F5] text-white shadow-sm">
            <Video className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Course Explainer Video
            </h2>
            <p className="text-sm text-gray-500">
              {course.code} - LIU Computer and Communications Engineering
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Clock3 className="h-4 w-4 text-[#6155F5]" />
          Max {formatDuration(explainer.durationSeconds)}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="relative min-h-[330px] bg-[#0F172A] p-5 text-white sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-slate-700">
            <div
              className="h-full bg-[#67D4C2] transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex h-full min-h-[290px] flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#A8DCE0]">
                  Scene {currentSceneIndex + 1} of {explainer.scenes.length}
                </span>
                <span className="text-sm text-slate-300">
                  {formatDuration(elapsedSeconds)} /{" "}
                  {formatDuration(explainer.durationSeconds)}
                </span>
              </div>

              <div className="mt-8 max-w-2xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#67D4C2] text-slate-950">
                  {currentSceneIndex === 0 ? (
                    <BookOpen className="h-7 w-7" />
                  ) : currentSceneIndex === 1 ? (
                    <Captions className="h-7 w-7" />
                  ) : (
                    <Lightbulb className="h-7 w-7" />
                  )}
                </div>
                <h3 className="text-3xl font-bold text-white">
                  {currentScene.title}
                </h3>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-100">
                  {currentScene.caption}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {currentScene.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-slate-100"
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between bg-white p-5 dark:bg-zinc-900 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase text-[#6155F5]">
              Video Script
            </p>
            <h3 className="mt-2 text-xl font-semibold text-gray-900">
              {explainer.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {currentScene.caption}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {explainer.scenes.map((scene, index) => (
                <button
                  key={scene.title}
                  type="button"
                  onClick={() => {
                    setElapsedSeconds(
                      (explainer.durationSeconds / explainer.scenes.length) *
                        index,
                    );
                    if (canUseSpeech()) window.speechSynthesis.cancel();
                    setIsPlaying(false);
                  }}
                  className={`h-2 rounded-full transition ${
                    index <= currentSceneIndex
                      ? "bg-[#6155F5]"
                      : "bg-slate-200 dark:bg-zinc-700"
                  }`}
                  aria-label={`Go to ${scene.title}`}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePlayPause}
                className="inline-flex items-center gap-2 rounded-full bg-[#6155F5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4E43D8]"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isPlaying ? "Pause" : "Play"}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-4 w-4" />
                Replay
              </button>

              <button
                type="button"
                onClick={handleVoiceToggle}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                Voice
              </button>
            </div>

            <div className="rounded-xl bg-[#EEF7F7] p-3 text-sm leading-6 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200">
              <span className="font-semibold text-gray-900">Caption:</span>{" "}
              {currentScene.caption}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
