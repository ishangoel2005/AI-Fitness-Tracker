import React from 'react';
import { ExerciseType } from '../utils/exerciseDetection';
import { Activity, ChevronDown, Dumbbell } from 'lucide-react';

interface ExerciseSelectorProps {
  selectedExercise: ExerciseType;
  onSelectExercise: (exercise: ExerciseType) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercise,
  onSelectExercise
}) => {
  const exercises: { type: ExerciseType; name: string; icon: React.ReactNode }[] = [
    { type: 'squat', name: 'Squats', icon: <ChevronDown className="w-5 h-5" /> },
    { type: 'pushup', name: 'Push-ups', icon: <Activity className="w-5 h-5" /> },
    { type: 'bicepCurl', name: 'Bicep Curls', icon: <Dumbbell className="w-5 h-5" /> }
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-6">
      {exercises.map((exercise) => (
        <button
          key={exercise.type}
          onClick={() => onSelectExercise(exercise.type)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            selectedExercise === exercise.type
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-100'
          }`}
        >
          {exercise.icon}
          <span>{exercise.name}</span>
        </button>
      ))}
    </div>
  );
};

export default ExerciseSelector;