import * as poseDetection from '@mediapipe/pose';

// Initialize pose detection
export const setupPoseDetection = async (
  onResults: (results: poseDetection.Results) => void
) => {
  const pose = new poseDetection.Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults(onResults);

  return pose;
};

// Calculate angle between three points
export const calculateAngle = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
};

// Get coordinates from pose landmarks
export const getCoordinates = (landmarks: poseDetection.NormalizedLandmarkList, index: number) => {
  if (!landmarks || !landmarks[index]) return { x: 0, y: 0 };
  return {
    x: landmarks[index].x,
    y: landmarks[index].y
  };
};