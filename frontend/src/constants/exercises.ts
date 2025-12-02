// src/constants/exercises.ts

export type BodyPart =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs"
  | "Glutes"
  | "Core"
  | "FullBody"
  | "Cardio"
  | "Other";

export const EXERCISES_BY_BODY_PART: Record<BodyPart, string[]> = {
  Chest: [
    "Barbell Bench Press",
    "Dumbbell Bench Press",
    "Incline Barbell Bench Press",
    "Incline Dumbbell Bench Press",
    "Decline Bench Press",
    "Push-Up",
    "Weighted Push-Up",
    "Chest Fly (Dumbbell)",
    "Chest Fly (Cable)",
    "Machine Chest Press",
    "Cable Crossover"
  ],

  Back: [
    "Pull-Up",
    "Chin-Up",
    "Lat Pulldown",
    "Seated Cable Row",
    "Bent-Over Barbell Row",
    "Bent-Over Dumbbell Row",
    "Single-Arm Dumbbell Row",
    "T-Bar Row",
    "Chest-Supported Row",
    "Inverted Row",
    "Face Pull"
  ],

  Shoulders: [
    "Overhead Barbell Press",
    "Overhead Dumbbell Press",
    "Seated Dumbbell Press",
    "Arnold Press",
    "Lateral Raise",
    "Front Raise",
    "Rear Delt Fly",
    "Cable Lateral Raise",
    "Machine Shoulder Press",
    "Upright Row"
  ],

  Arms: [
    "Barbell Bicep Curl",
    "Dumbbell Bicep Curl",
    "Hammer Curl",
    "Preacher Curl",
    "Cable Curl",
    "Concentration Curl",
    "Tricep Pushdown",
    "Overhead Tricep Extension",
    "Skullcrusher",
    "Close-Grip Bench Press",
    "Dips",
    "Bench Dips"
  ],

  Legs: [
    "Barbell Back Squat",
    "Front Squat",
    "Goblet Squat",
    "Leg Press",
    "Walking Lunge",
    "Reverse Lunge",
    "Bulgarian Split Squat",
    "Romanian Deadlift",
    "Leg Extension",
    "Leg Curl",
    "Standing Calf Raise",
    "Seated Calf Raise"
  ],

  Glutes: [
    "Barbell Hip Thrust",
    "Glute Bridge",
    "Cable Kickback",
    "Step-Up",
    "Sumo Deadlift",
    "Kettlebell Swing",
    "Curtsy Lunge"
  ],

  Core: [
    "Plank",
    "Side Plank",
    "Crunch",
    "Bicycle Crunch",
    "Hanging Leg Raise",
    "Knee Raise",
    "Russian Twist",
    "Cable Woodchop",
    "Ab Wheel Rollout",
    "Mountain Climber",
    "Dead Bug"
  ],

  FullBody: [
    "Deadlift",
    "Sumo Deadlift High Pull",
    "Clean and Press",
    "Snatch",
    "Thruster",
    "Burpee",
    "Farmer's Walk",
    "Kettlebell Clean",
    "Kettlebell Snatch"
  ],

  Cardio: [
    "Treadmill Run",
    "Treadmill Walk",
    "Stationary Bike",
    "Spin Bike",
    "Rowing Machine",
    "Elliptical",
    "Stair Climber",
    "Jump Rope",
    "Outdoor Run",
    "Outdoor Walk",
    "Swimming"
  ],

  Other: [
    "Band Pull-Apart",
    "Pallof Press",
    "Sled Push",
    "Sled Pull",
    "Battle Ropes",
    "Box Jump",
    "Medicine Ball Slam"
  ]
};

// Flattened list if you ever need it (includes "ALL" once at the top)
export const ALL_EXERCISES: string[] = Array.from(
  new Set(
    Object.values(EXERCISES_BY_BODY_PART)
      .flat()
  )
);
