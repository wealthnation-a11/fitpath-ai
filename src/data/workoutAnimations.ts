
export interface WorkoutAnimationData {
  name: string;
  animationUrl: string;
}

// Replace these placeholder URLs with actual animation GIFs or Lottie files
export const workoutAnimations: Record<string, WorkoutAnimationData> = {
  pushups: {
    name: "Push-ups",
    animationUrl: "/animations/pushups.gif",
  },
  squats: {
    name: "Squats",
    animationUrl: "/animations/squats.gif",
  },
  jumpingJacks: {
    name: "Jumping Jacks",
    animationUrl: "/animations/jumping-jacks.gif",
  },
  plank: {
    name: "Plank",
    animationUrl: "/animations/plank.gif",
  },
  lunges: {
    name: "Lunges",
    animationUrl: "/animations/lunges.gif",
  },
};
