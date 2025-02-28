import React from 'react';
import { ExerciseType } from '../utils/exerciseDetection';
import { Award, Activity, ChevronDown, Dumbbell } from 'lucide-react';

interface WorkoutSummaryProps {
  exerciseCounts: Record<ExerciseType, number>;
  totalTime: number;
  onReset: () => void;
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  exerciseCounts,
  totalTime,
  onReset
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalReps = (): number => {
    return Object.values(exerciseCounts).reduce((sum, count) => sum + count, 0);
  };

  const getExerciseIcon = (type: ExerciseType) => {
    switch (type) {
      case 'squat':
        return <ChevronDown className="w-5 h-5" />;
      case 'pushup':
        return <Activity className="w-5 h-5" />;
      case 'bicepCurl':
        return <Dumbbell className="w-5 h-5" />;
    }
  };

  const getExerciseName = (type: ExerciseType): string => {
    switch (type) {
      case 'squat':
        return 'Squats';
      case 'pushup':
        return 'Push-ups';
      case 'bicepCurl':
        return 'Bicep Curls';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-center mb-4">
        <div className="bg-green-100 p-3 rounded-full">
          <Award className="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6">Workout Summary</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Total Time</span>
          <span className="font-semibold">{formatTime(totalTime)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Total Reps</span>
          <span className="font-semibold">{getTotalReps()}</span>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <h3 className="font-semibold text-gray-700">Exercise Breakdown</h3>
        {(Object.keys(exerciseCounts) as ExerciseType[]).map((type) => (
          exerciseCounts[type] > 0 && (
            <div key={type} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                {getExerciseIcon(type)}
                <span>{getExerciseName(type)}</span>
              </div>
              <span className="font-semibold">{exerciseCounts[type]} reps</span>
            </div>
          )
        ))}
      </div>
      
      <button
        onClick={onReset}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
      >
        Start New Workout
      </button>
    </div>
  );
};

export default WorkoutSummary;