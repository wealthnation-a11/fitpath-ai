
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface WorkoutAnimationProps {
  name: string;
  animationUrl: string;
}

export const WorkoutAnimation = ({ name, animationUrl }: WorkoutAnimationProps) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const handleReplay = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 0);
  };

  return (
    <div className="relative rounded-lg overflow-hidden bg-black/5 aspect-square">
      {isPlaying && (
        <img
          src={animationUrl}
          alt={`${name} demonstration`}
          className="w-full h-full object-cover"
        />
      )}
      <Button
        variant="secondary"
        size="sm"
        className="absolute bottom-2 right-2"
        onClick={handleReplay}
      >
        <Play className="h-4 w-4 mr-1" />
        Replay
      </Button>
    </div>
  );
};
