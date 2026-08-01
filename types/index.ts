// Global Exercise Library

export interface MovementPattern {
  id: number;
  name: string;
  parentId: number | null;
  category: string;
}

export interface Exercise {
  id: number;
  name: string;
  movementPatternId: number;
  muscleGroups: string;
  equipment: string;
  difficulty: string;
}

export interface ExerciseAlternative {
  exerciseId: number;
  alternativeExerciseId: number;
}

// Program Templates

export interface Program {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface WorkoutTemplate {
  id: number;
  programId: number;
  name: string;
  orderIndex: number;
}

export interface TemplateExercise {
  id: number;
  workoutTemplateId: number;
  exerciseId: number;
  orderIndex: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
}

// Workout Sessions

export interface WorkoutSession {
  id: number;
  workoutTemplateId: number | null;
  programId: number | null;
  performedAt: string;
  notes: string | null;
  completed: boolean;
}

export interface SessionExercise {
  id: number;
  workoutSessionId: number;
  exerciseId: number;
  orderIndex: number;
}

export interface SetLog {
  id: number;
  sessionExerciseId: number;
  setNumber: number;
  targetWeight: number | null;
  targetReps: number | null;
  performedWeight: number | null;
  performedReps: number | null;
  rir: number | null;
  completed: boolean;
  createdAt: string;
}
