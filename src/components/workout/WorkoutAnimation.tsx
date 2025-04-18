
import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workoutVideos } from "@/data/workoutVideos";

interface WorkoutAnimationProps {
  name: string;
}

export const WorkoutAnimation = ({ name }: WorkoutAnimationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = workoutVideos[name];

  useEffect(() => {
    // Preload the video when the component mounts
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Reset video to start and play
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!videoUrl) {
    return null;
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-black/5">
      <p className="text-sm text-muted-foreground mb-2">Watch how to do it:</p>
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          id={`video-${name}`}
          className="w-full h-full object-cover rounded-lg"
          src={videoUrl}
          playsInline
          loop
          muted
          preload="auto"
          onCanPlay={() => {
            // Start playing as soon as enough data is loaded
            if (videoRef.current && !isPlaying) {
              videoRef.current.play().catch(error => {
                console.error("Error auto-playing video:", error);
              });
              setIsPlaying(true);
            }
          }}
        >
          Your browser does not support the video tag.
        </video>
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
