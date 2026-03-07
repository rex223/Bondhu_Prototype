"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type BlobEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "excited"
  | "confused"
  | "sleepy"
  | "focused"
  | "smart"
  | "neutral";

interface BondhuBlobProps {
  emotion?: BlobEmotion;
  size?: "sm" | "md" | "lg" | "xl";
  isListening?: boolean;
  isSpeaking?: boolean;
  onClick?: () => void;
  className?: string;
  animated?: boolean;
}

// Face expression configurations matching the reference design
// ViewBox is 100x100, face is centered
const faceExpressions: Record<BlobEmotion, {
  leftEyebrow: string;
  rightEyebrow: string;
  leftEyebrowRotate: number;
  rightEyebrowRotate: number;
  eyeScaleY: number;
  noseMouth: string; // L-shaped: vertical line = nose, horizontal line = mouth
}> = {
  happy: {
    leftEyebrow: "M 22 32 Q 28 26 36 32",
    rightEyebrow: "M 64 32 Q 72 26 78 32",
    leftEyebrowRotate: -5,
    rightEyebrowRotate: 5,
    eyeScaleY: 1,
    noseMouth: "M 48 52 L 48 64 Q 48 68 52 68 L 60 68", // Curved L with smile
  },
  sad: {
    leftEyebrow: "M 22 32 Q 28 36 36 32",
    rightEyebrow: "M 64 32 Q 72 36 78 32",
    leftEyebrowRotate: 8,
    rightEyebrowRotate: -8,
    eyeScaleY: 0.8,
    noseMouth: "M 48 52 L 48 64 L 52 64", // Shorter, sadder mouth
  },
  angry: {
    leftEyebrow: "M 22 36 Q 28 28 36 32",
    rightEyebrow: "M 64 32 Q 72 28 78 36",
    leftEyebrowRotate: -15,
    rightEyebrowRotate: 15,
    eyeScaleY: 0.7,
    noseMouth: "M 48 52 L 48 64 L 54 64", // Tense, short mouth
  },
  excited: {
    leftEyebrow: "M 22 30 Q 28 22 36 30",
    rightEyebrow: "M 64 30 Q 72 22 78 30",
    leftEyebrowRotate: -8,
    rightEyebrowRotate: 8,
    eyeScaleY: 1.2,
    noseMouth: "M 48 52 L 48 64 Q 48 72 56 72 L 64 68", // Big curved smile
  },
  confused: {
    leftEyebrow: "M 22 30 Q 28 28 36 34",
    rightEyebrow: "M 64 34 Q 72 28 78 30",
    leftEyebrowRotate: -10,
    rightEyebrowRotate: 0,
    eyeScaleY: 1,
    noseMouth: "M 48 52 L 48 64 L 54 66 L 58 64", // Wavy mouth
  },
  sleepy: {
    leftEyebrow: "M 22 34 Q 28 32 36 34",
    rightEyebrow: "M 64 34 Q 72 32 78 34",
    leftEyebrowRotate: 0,
    rightEyebrowRotate: 0,
    eyeScaleY: 0.3, // Half-closed eyes
    noseMouth: "M 48 52 L 48 64 L 52 64", // Small mouth
  },
  focused: {
    leftEyebrow: "M 22 32 Q 28 28 36 32",
    rightEyebrow: "M 64 32 Q 72 28 78 32",
    leftEyebrowRotate: 0,
    rightEyebrowRotate: 0,
    eyeScaleY: 1,
    noseMouth: "M 48 52 L 48 66 L 58 66", // Standard L-shape
  },
  smart: {
    leftEyebrow: "M 22 32 Q 28 26 36 32",
    rightEyebrow: "M 64 34 Q 72 30 78 32",
    leftEyebrowRotate: -8,
    rightEyebrowRotate: 2,
    eyeScaleY: 1,
    noseMouth: "M 48 52 L 48 64 Q 48 68 54 68 L 58 66", // Slight smirk
  },
  neutral: {
    leftEyebrow: "M 22 32 Q 28 28 36 32",
    rightEyebrow: "M 64 32 Q 72 28 78 32",
    leftEyebrowRotate: 0,
    rightEyebrowRotate: 0,
    eyeScaleY: 1,
    noseMouth: "M 48 52 L 48 66 L 58 66", // Standard L-shape from reference
  },
};

// Gradient colors for each emotion
const emotionGradients: Record<BlobEmotion, { from: string; to: string }> = {
  happy: { from: "#FFD93D", to: "#FF8E3C" },
  sad: { from: "#7DD3FC", to: "#A78BFA" },
  angry: { from: "#FF6B6B", to: "#FF8E53" },
  excited: { from: "#FF6B95", to: "#FFD93D" },
  confused: { from: "#A78BFA", to: "#7DD3FC" },
  sleepy: { from: "#667EEA", to: "#764BA2" },
  focused: { from: "#7DD3FC", to: "#A78BFA" },
  smart: { from: "#F5AF19", to: "#F12711" },
  neutral: { from: "#7DD3FC", to: "#A78BFA" },
};

const sizeConfig = {
  sm: { size: 48, blur: 8 },
  md: { size: 64, blur: 12 },
  lg: { size: 200, blur: 30 },
  xl: { size: 300, blur: 45 },
};

export function BondhuBlob({
  emotion = "neutral",
  size = "md",
  isListening = false,
  isSpeaking = false,
  onClick,
  className,
  animated = true,
}: BondhuBlobProps) {
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Handle emotion transitions
  useEffect(() => {
    if (emotion !== currentEmotion) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setCurrentEmotion(emotion);
        setIsTransitioning(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [emotion, currentEmotion]);

  // Blinking animation
  useEffect(() => {
    const blinkLoop = () => {
      const randomDelay = 2000 + Math.random() * 4000; // Random 2-6 seconds
      const timeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        blinkLoop();
      }, randomDelay);
      return timeout;
    };
    const timeout = blinkLoop();
    return () => clearTimeout(timeout);
  }, []);

  const face = faceExpressions[currentEmotion];
  const gradient = emotionGradients[currentEmotion];
  const sizeValues = sizeConfig[size];

  const effectiveGradient = isListening ? emotionGradients.focused : gradient;

  // Calculate eye scale (blinking overrides emotion)
  const eyeScaleY = isBlinking ? 0.1 : face.eyeScaleY;

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-500 ease-out",
        onClick && "hover:scale-105 active:scale-95",
        animated && "animate-blob-float",
        className
      )}
      style={{
        width: sizeValues.size,
        height: sizeValues.size,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Bondhu AI - ${currentEmotion} mood. Click to start voice mode.`}
    >
      {/* Outer glow/blur layer */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          isTransitioning && "opacity-50"
        )}
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${effectiveGradient.from}80 0%, ${effectiveGradient.to}60 50%, transparent 70%)`,
          filter: `blur(${sizeValues.blur}px)`,
          transform: "scale(1.4)",
        }}
      />

      {/* Main blob body */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500",
          animated && (isSpeaking ? "animate-blob-speak" : "animate-blob-idle")
        )}
        style={{
          background: `
            radial-gradient(ellipse at 25% 25%, ${effectiveGradient.from} 0%, transparent 50%),
            radial-gradient(ellipse at 75% 75%, ${effectiveGradient.to} 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, ${effectiveGradient.from}90 0%, ${effectiveGradient.to}90 100%)
          `,
          borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
          filter: `blur(${sizeValues.blur / 4}px)`,
        }}
      />

      {/* Second blob layer for depth */}
      <div
        className={cn(
          "absolute inset-[10%] transition-all duration-500",
          animated && "animate-blob-morph"
        )}
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, ${effectiveGradient.from}CC 0%, transparent 60%),
            radial-gradient(ellipse at 70% 70%, ${effectiveGradient.to}CC 0%, transparent 60%)
          `,
          borderRadius: "50% 60% 40% 50% / 40% 50% 60% 50%",
          filter: `blur(${sizeValues.blur / 6}px)`,
        }}
      />

      {/* Face SVG - Following reference design */}
      <svg
        className={cn(
          "absolute inset-0 flex items-center justify-center z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]",
          isTransitioning && "opacity-0 transition-opacity duration-200"
        )}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Eyebrow */}
        <g
          style={{
            transform: `rotate(${face.leftEyebrowRotate}deg)`,
            transformOrigin: "29px 32px",
          }}
        >
          <path
            d={face.leftEyebrow}
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-300"
          />
        </g>

        {/* Right Eyebrow */}
        <g
          style={{
            transform: `rotate(${face.rightEyebrowRotate}deg)`,
            transformOrigin: "71px 32px",
          }}
        >
          <path
            d={face.rightEyebrow}
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-300"
          />
        </g>

        {/* Left Eye - Simple circle like reference */}
        <circle
          cx="29"
          cy="45"
          r="4"
          fill="white"
          style={{
            transform: `scaleY(${eyeScaleY})`,
            transformOrigin: "29px 45px",
            transition: "transform 0.1s ease-out",
          }}
        />

        {/* Right Eye - Simple circle like reference */}
        <circle
          cx="71"
          cy="45"
          r="4"
          fill="white"
          style={{
            transform: `scaleY(${eyeScaleY})`,
            transformOrigin: "71px 45px",
            transition: "transform 0.1s ease-out",
          }}
        />

        {/* Nose + Mouth - L-shaped like reference */}
        <path
          d={face.noseMouth}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className={cn(
            "transition-all duration-300",
            isSpeaking && "animate-mouth-talk"
          )}
        />
      </svg>

      {/* Listening indicator - pulsing rings */}
      {isListening && (
        <>
          <div
            className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"
            style={{ animationDuration: "1.5s" }}
          />
          <div
            className="absolute inset-[-10%] rounded-full border border-white/20 animate-ping"
            style={{ animationDuration: "2s", animationDelay: "0.5s" }}
          />
        </>
      )}

      {/* Speaking indicator - subtle pulse on blob */}
      {isSpeaking && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-white/60 rounded-full animate-sound-wave"
              style={{
                height: "8px",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

