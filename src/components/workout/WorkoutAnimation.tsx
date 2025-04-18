
import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workoutVideos } from "@/data/workoutVideos";

interface WorkoutAnimationProps {
  name: string;
}

export const WorkoutAnimation = ({ name }: WorkoutAnimationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = workoutVideos[name];

  const handlePlayPause = () => {
    const video = document.getElementById(`video-${name}`) as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
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
          id={`video-${name}`}
          className="w-full h-full object-cover rounded-lg"
          src={videoUrl}
          playsInline
          loop
          preload="metadata"
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
