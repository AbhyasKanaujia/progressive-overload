export interface Program {
  id: number;
  name: string;
  description?: string;
}

export interface Split {
  id: number;
  programId: number;
  name: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

export interface Workout {
  id: number;
  splitId: number;
  name: string;
}

export interface Exercise {
  id: number;
  name: string;
  movementPattern: string;
  muscleGroups: string;
  equipment: string;
}

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  orderIndex: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
}

export interface SetLog {
  id: number;
  workoutExerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  completedAt: string;
}
