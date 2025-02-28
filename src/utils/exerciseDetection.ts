import { NormalizedLandmarkList } from '@mediapipe/pose';
import { calculateAngle, getCoordinates } from './poseDetection';

export type ExerciseType = 'squat' | 'pushup' | 'bicepCurl';

interface ExerciseState {
  count: number;
  stage: 'up' | 'down' | null;
  feedback: string;
  confidence: number;
}

export const detectSquat = (
  landmarks: NormalizedLandmarkList,
  prevState: ExerciseState
): ExerciseState => {
  const hip = getCoordinates(landmarks, 24);
  const knee = getCoordinates(landmarks, 26);
  const ankle = getCoordinates(landmarks, 28);
  
  const angle = calculateAngle(hip, knee, ankle);
  let stage = prevState.stage;
  let count = prevState.count;
  let feedback = '';
  let confidence = 0;
  
  // Determine squat stage based on knee angle
  if (angle > 160) {
    stage = 'up';
    confidence = Math.min(1, (angle - 160) / 20);
    feedback = 'Stand straight';
  } else if (angle < 120) {
    stage = 'down';
    confidence = Math.min(1, (120 - angle) / 30);
    feedback = 'Good depth';
  }
  
  // Count a rep when transitioning from down to up
  if (stage === 'up' && prevState.stage === 'down') {
    count++;
    feedback = 'Good rep!';
  }
  
  // Provide form feedback
  if (stage === 'down' && angle > 90) {
    feedback = 'Go lower for full range of motion';
  }
  
  return { count, stage, feedback, confidence };
};

export const detectPushup = (
  landmarks: NormalizedLandmarkList,
  prevState: ExerciseState
): ExerciseState => {
  const shoulder = getCoordinates(landmarks, 12);
  const elbow = getCoordinates(landmarks, 14);
  const wrist = getCoordinates(landmarks, 16);
  
  const angle = calculateAngle(shoulder, elbow, wrist);
  let stage = prevState.stage;
  let count = prevState.count;
  let feedback = '';
  let confidence = 0;
  
  // Determine pushup stage based on elbow angle
  if (angle > 160) {
    stage = 'up';
    confidence = Math.min(1, (angle - 160) / 20);
    feedback = 'Arms extended';
  } else if (angle < 90) {
    stage = 'down';
    confidence = Math.min(1, (90 - angle) / 30);
    feedback = 'Good depth';
  }
  
  // Count a rep when transitioning from down to up
  if (stage === 'up' && prevState.stage === 'down') {
    count++;
    feedback = 'Good rep!';
  }
  
  return { count, stage, feedback, confidence };
};

export const detectBicepCurl = (
  landmarks: NormalizedLandmarkList,
  prevState: ExerciseState
): ExerciseState => {
  // Use right arm for bicep curl detection
  const shoulder = getCoordinates(landmarks, 12);
  const elbow = getCoordinates(landmarks, 14);
  const wrist = getCoordinates(landmarks, 16);
  
  const angle = calculateAngle(shoulder, elbow, wrist);
  let stage = prevState.stage;
  let count = prevState.count;
  let feedback = '';
  let confidence = 0;
  
  // Determine curl stage based on elbow angle
  if (angle > 150) {
    stage = 'down';
    confidence = Math.min(1, (angle - 150) / 30);
    feedback = 'Arm extended';
  } else if (angle < 60) {
    stage = 'up';
    confidence = Math.min(1, (60 - angle) / 30);
    feedback = 'Good curl';
  }
  
  // Count a rep when transitioning from up to down
  if (stage === 'down' && prevState.stage === 'up') {
    count++;
    feedback = 'Good rep!';
  }
  
  return { count, stage, feedback, confidence };
};

export const detectExercise = (
  exerciseType: ExerciseType,
  landmarks: NormalizedLandmarkList,
  prevState: ExerciseState
): ExerciseState => {
  switch (exerciseType) {
    case 'squat':
      return detectSquat(landmarks, prevState);
    case 'pushup':
      return detectPushup(landmarks, prevState);
    case 'bicepCurl':
      return detectBicepCurl(landmarks, prevState);
    default:
      return prevState;
  }
};