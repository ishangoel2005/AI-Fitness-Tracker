import React, { useState, useEffect } from 'react';
import ExerciseCounter from './components/ExerciseCounter';
import ExerciseSelector from './components/ExerciseSelector';
import WorkoutSummary from './components/WorkoutSummary';
import { ExerciseType } from './utils/exerciseDetection';
import { Dumbbell } from 'lucide-react';

function App() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squat');
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [exerciseCounts, setExerciseCounts] = useState<Record<ExerciseType, number>>({
    squat: 0,
    pushup: 0,
    bicepCurl: 0
  });
  const [workoutTime, setWorkoutTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);

  // Start timer when workout begins
  useEffect(() => {
    if (workoutActive && !timerInterval) {
      const interval = window.setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval as unknown as number);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [workoutActive, timerInterval]);

  const handleStartWorkout = () => {
    setWorkoutActive(true);
    setWorkoutComplete(false);
    setExerciseCounts({
      squat: 0,
      pushup: 0,
      bicepCurl: 0
    });
    setWorkoutTime(0);
  };

  const handleFinishWorkout = () => {
    setWorkoutActive(false);
    setWorkoutComplete(true);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handleExerciseComplete = (count: number) => {
    setExerciseCounts(prev => ({
      ...prev,
      [selectedExercise]: count
    }));
  };

  const handleReset = () => {
    setWorkoutActive(false);
    setWorkoutComplete(false);
    setExerciseCounts({
      squat: 0,
      pushup: 0,
      bicepCurl: 0
    });
    setWorkoutTime(0);
    setSelectedExercise('squat');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-8 px-4">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Dumbbell className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">AI Fitness Tracker</h1>
        </div>
        <p className="text-gray-600">Real-time exercise detection and counting</p>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {!workoutActive && !workoutComplete ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to workout?</h2>
            <p className="text-gray-600 mb-6">
              Our AI-powered system will track your exercises in real-time and provide feedback on your form.
            </p>
            <button
              onClick={handleStartWorkout}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Start Workout
            </button>
          </div>
        ) : workoutComplete ? (
          <WorkoutSummary
            exerciseCounts={exerciseCounts}
            totalTime={workoutTime}
            onReset={handleReset}
          />
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-gray-600">Workout time: </span>
                <span className="font-semibold">{formatTime(workoutTime)}</span>
              </div>
              <button
                onClick={handleFinishWorkout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                End Workout
              </button>
            </div>
            
            <ExerciseSelector
              selectedExercise={selectedExercise}
              onSelectExercise={setSelectedExercise}
            />
            
            <ExerciseCounter
              exerciseType={selectedExercise}
              onExerciseComplete={handleExerciseComplete}
            />
            
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Current Progress</h3>
              <div className="grid grid-cols-3 gap-4">
                {(Object.keys(exerciseCounts) as ExerciseType[]).map((type) => (
                  <div key={type} className="text-center">
                    <div className="text-lg font-bold">{exerciseCounts[type]}</div>
                    <div className="text-sm text-gray-600">
                      {type === 'squat' ? 'Squats' : type === 'pushup' ? 'Push-ups' : 'Bicep Curls'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Powered by MediaPipe and TensorFlow.js</p>
      </footer>
    </div>
  );
}

export default App;