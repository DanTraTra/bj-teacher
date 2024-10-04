import React, { useRef, useEffect, useState } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

const CameraRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load camera stream
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // front-facing camera
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startVideo();
  }, []);

  useEffect(() => {
    // Load BodyPix model and start segmentation
    const loadModelAndStart = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const model = await bodyPix.load();
      setIsLoading(false);

      const segmentFrame = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const segmentation = await model.segmentPerson(videoRef.current);
        const ctx = canvasRef.current.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Create a mask for the person in the video
          const mask = bodyPix.toMask(segmentation);

          // Draw the mask on the canvas
          ctx.putImageData(mask, 0, 0);

          // Draw the video over the mask for the person (transparent background effect)
          ctx.globalCompositeOperation = 'source-in';
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

          // Reset the compositing operation to draw the background
          ctx.globalCompositeOperation = 'destination-over';

          // Optional: Add background color or transparent background
          ctx.fillStyle = 'rgba(255, 255, 255, 0)'; // Transparent background
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        // Continue processing the next frame
        requestAnimationFrame(segmentFrame);
      };

      // Start the frame segmentation loop
      segmentFrame();
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', loadModelAndStart);
    }
  }, []);

  return (
    <div className="relative w-[320px] h-[240px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          Loading...
        </div>
      )}

      {/* Video element for capturing camera feed */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${isLoading ? '' : 'hidden'}`}
        autoPlay
        playsInline
        muted
      ></video>

      {/* Canvas for rendering the background removal */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={320}
        height={240}
      ></canvas>
    </div>
  );
};

export default CameraRecorder;
