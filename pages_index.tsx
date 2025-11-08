import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoPlayerApp() {
  const [videoUrl, setVideoUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSkipFeedback, setShowSkipFeedback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFromParam = urlParams.get('url');
    if (urlFromParam) {
      setVideoUrl(decodeURIComponent(urlFromParam));
    }
  }, []);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (videoUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      }
    } else {
      video.src = videoUrl;
    }
  }, [videoUrl]);

  const handleGeneratePlayer = () => {
    if (!inputUrl.trim()) return;
    const playerUrl = `${window.location.origin}${window.location.pathname}?url=${encodeURIComponent(inputUrl)}`;
    window.open(playerUrl, '_blank');
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    const newTime = Math.min(videoRef.current.currentTime + 120, duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setShowSkipFeedback(true);
    setTimeout(() => setShowSkipFeedback(false), 1000);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-purple-600 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Video Player Generator</h1>
            <p className="text-slate-300">Cole o link do seu vídeo MP4 ou M3U8</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL do Vídeo
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://exemplo.com/video.mp4 ou .m3u8"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleGeneratePlayer()}
              />
            </div>

            <button
              onClick={handleGeneratePlayer}
              disabled={!inputUrl.trim()}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              Abrir Player em Nova Guia
            </button>
          </div>

          <div className="mt-8 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Formatos Suportados:</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• MP4 - Vídeos diretos</li>
              <li>• M3U8 - Streaming HLS</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl aspect-video bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {showSkipFeedback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-75 px-6 py-4 rounded-lg flex items-center space-x-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
              </svg>
              <span className="text-white text-xl font-semibold">+2:00</span>
            </div>
          </div>
        )}

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute top-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="text-white text-lg font-semibold">Video Player</div>
              <button
                onClick={() => window.close()}
                className="p-2 bg-slate-800 bg-opacity-50 rounded-lg hover:bg-opacity-75 transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(currentTime / duration) * 100}%, #475569 ${(currentTime / duration) * 100}%, #475569 100%)`
              }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-all"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={skipForward}
                  className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-all group"
                  title="Pular 2 minutos"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                  </svg>
                </button>

                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-slate-800 bg-opacity-50 rounded-lg hover:bg-opacity-75 transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="p-6 bg-purple-600 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all transform hover:scale-110"
            >
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
