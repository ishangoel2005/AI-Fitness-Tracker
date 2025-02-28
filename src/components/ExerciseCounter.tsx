import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, Results } from '@mediapipe/pose';
import { setupPoseDetection } from '../utils/poseDetection';
import { detectExercise, ExerciseType } from '../utils/exerciseDetection';
import { Activity, Dumbbell, ChevronDown } from 'lucide-react';

interface ExerciseCounterProps {
  exerciseType: ExerciseType;
  onExerciseComplete?: (count: number) => void;
}

const ExerciseCounter: React.FC<ExerciseCounterProps> = ({ 
  exerciseType,
  onExerciseComplete 
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const [count, setCount] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);

  const exerciseState = useRef({
    count: 0,
    stage: null as 'up' | 'down' | null,
    feedback: '',
    confidence: 0
  });

  useEffect(() => {
    const initializePoseDetection = async () => {
      if (!webcamRef.current || !canvasRef.current) return;

      setIsProcessing(true);

      try {
        // Setup pose detection
        poseRef.current = await setupPoseDetection(onResults);

        // Setup camera
        if (webcamRef.current.video) {
          cameraRef.current = new Camera(webcamRef.current.video, {
            onFrame: async () => {
              if (webcamRef.current?.video && poseRef.current) {
                await poseRef.current.send({ image: webcamRef.current.video });
              }
            },
            width: 640,
            height: 480
          });
          cameraRef.current.start();
        }
      } catch (error) {
        console.error('Error initializing pose detection:', error);
        setFeedback('Error initializing camera. Please check permissions.');
      } finally {
        setIsProcessing(false);
      }
    };

    initializePoseDetection();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [exerciseType]);

  const onResults = (results: Results) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pose landmarks
    if (results.poseLandmarks) {
      // Update exercise state
      const newState = detectExercise(
        exerciseType,
        results.poseLandmarks,
        exerciseState.current
      );

      // Update state if count changed
      if (newState.count !== exerciseState.current.count) {
        setCount(newState.count);
        if (onExerciseComplete && newState.count > 0) {
          onExerciseComplete(newState.count);
        }
      }

      // Update feedback
      if (newState.feedback !== exerciseState.current.feedback) {
        setFeedback(newState.feedback);
      }

      // Update confidence
      setConfidence(newState.confidence);

      // Update ref
      exerciseState.current = newState;

      // Draw skeleton
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Mirror the canvas
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      
      // Draw pose landmarks
      for (const landmark of results.poseLandmarks) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#4ade80';
        ctx.fill();
      }
      
      // Draw connections
      if (results.poseWorldLandmarks) {
        // Draw lines between key points
        const connections = [
          // Torso
          [11, 12], [12, 24], [24, 23], [23, 11],
          // Right arm
          [12, 14], [14, 16],
          // Left arm
          [11, 13], [13, 15],
          // Right leg
          [24, 26], [26, 28],
          // Left leg
          [23, 25], [25, 27]
        ];
        
        for (const [i, j] of connections) {
          const p1 = results.poseLandmarks[i];
          const p2 = results.poseLandmarks[j];
          
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      
      ctx.restore();
    }
  };

  const getExerciseIcon = () => {
    switch (exerciseType) {
      case 'squat':
        return <ChevronDown className="w-6 h-6" />;
      case 'pushup':
        return <Activity className="w-6 h-6" />;
      case 'bicepCurl':
        return <Dumbbell className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const getExerciseName = () => {
    switch (exerciseType) {
      case 'squat':
        return 'Squats';
      case 'pushup':
        return 'Push-ups';
      case 'bicepCurl':
        return 'Bicep Curls';
      default:
        return 'Exercise';
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          className="absolute top-0 left-0 w-full h-full object-cover mirror"
          mirrored={true}
          audio={false}
          width={640}
          height={480}
          videoConstraints={{
            facingMode: 'user',
            width: 640,
            height: 480
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width={640}
          height={480}
        />
        
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-lg">Initializing camera...</div>
          </div>
        )}
        
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
          {getExerciseIcon()}
          <span>{getExerciseName()}</span>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{count} reps</div>
            <div className="text-sm">{feedback}</div>
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${confidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCounter;