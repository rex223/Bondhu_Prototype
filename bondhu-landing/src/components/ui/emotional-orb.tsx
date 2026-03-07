"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type EmotionalState = 
  | "happy" 
  | "sad" 
  | "angry" 
  | "excited" 
  | "confused" 
  | "sleepy" 
  | "focused" 
  | "smart"
  | "neutral";

interface EmotionalOrbProps {
  emotion?: EmotionalState;
  size?: "sm" | "md" | "lg" | "xl";
  isListening?: boolean;
  isSpeaking?: boolean;
  onClick?: () => void;
  className?: string;
}

const emotionConfig: Record<EmotionalState, {
  colors: string[];
  animation: string;
  glowColor: string;
  pulseSpeed: string;
}> = {
  happy: {
    colors: ["#FFD93D", "#FF8E3C", "#FFA500"],
    animation: "animate-orb-happy",
    glowColor: "rgba(255, 217, 61, 0.5)",
    pulseSpeed: "2s",
  },
  sad: {
    colors: ["#6B8DD6", "#8E99A4", "#5C7AEA"],
    animation: "animate-orb-sad",
    glowColor: "rgba(107, 141, 214, 0.4)",
    pulseSpeed: "4s",
  },
  angry: {
    colors: ["#FF6B6B", "#FF8E53", "#E74C3C"],
    animation: "animate-orb-angry",
    glowColor: "rgba(255, 107, 107, 0.5)",
    pulseSpeed: "0.8s",
  },
  excited: {
    colors: ["#FF6B95", "#FFD93D", "#6BCB77"],
    animation: "animate-orb-excited",
    glowColor: "rgba(255, 107, 149, 0.5)",
    pulseSpeed: "1s",
  },
  confused: {
    colors: ["#9B59B6", "#3498DB", "#8E44AD"],
    animation: "animate-orb-confused",
    glowColor: "rgba(155, 89, 182, 0.4)",
    pulseSpeed: "2.5s",
  },
  sleepy: {
    colors: ["#667EEA", "#764BA2", "#5B6DCD"],
    animation: "animate-orb-sleepy",
    glowColor: "rgba(102, 126, 234, 0.3)",
    pulseSpeed: "5s",
  },
  focused: {
    colors: ["#11998E", "#38EF7D", "#0F8A5F"],
    animation: "animate-orb-focused",
    glowColor: "rgba(17, 153, 142, 0.5)",
    pulseSpeed: "1.5s",
  },
  smart: {
    colors: ["#F5AF19", "#F12711", "#FFD700"],
    animation: "animate-orb-smart",
    glowColor: "rgba(245, 175, 25, 0.5)",
    pulseSpeed: "1.2s",
  },
  neutral: {
    colors: ["#10B981", "#059669", "#34D399"],
    animation: "animate-orb-neutral",
    glowColor: "rgba(16, 185, 129, 0.4)",
    pulseSpeed: "3s",
  },
};

const sizeConfig = {
  sm: { size: 40, blur: 8, glow: 15 },
  md: { size: 56, blur: 12, glow: 20 },
  lg: { size: 80, blur: 16, glow: 30 },
  xl: { size: 120, blur: 24, glow: 45 },
};

export function EmotionalOrb({
  emotion = "neutral",
  size = "md",
  isListening = false,
  isSpeaking = false,
  onClick,
  className,
}: EmotionalOrbProps) {
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (emotion !== currentEmotion) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setCurrentEmotion(emotion);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [emotion, currentEmotion]);

  const config = emotionConfig[currentEmotion];
  const sizeValues = sizeConfig[size];

  // Override emotion if listening/speaking
  const effectiveConfig = isListening 
    ? emotionConfig.focused 
    : isSpeaking 
    ? emotionConfig[currentEmotion] 
    : config;

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-500 ease-out",
        onClick && "hover:scale-110 active:scale-95",
        className
      )}
      style={{
        width: sizeValues.size,
        height: sizeValues.size,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Bondhu AI - ${currentEmotion} mood`}
    >
      {/* Outer glow layer */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          isTransitioning && "opacity-0"
        )}
        style={{
          background: `radial-gradient(circle, ${effectiveConfig.glowColor} 0%, transparent 70%)`,
          transform: `scale(${isListening ? 1.8 : isSpeaking ? 1.5 : 1.3})`,
          filter: `blur(${sizeValues.blur}px)`,
          animation: `pulse ${effectiveConfig.pulseSpeed} ease-in-out infinite`,
        }}
      />

      {/* Middle glow layer */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isTransitioning && "opacity-50"
        )}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${effectiveConfig.colors[0]}80 0%, ${effectiveConfig.colors[1]}60 50%, ${effectiveConfig.colors[2]}40 100%)`,
          transform: "scale(1.15)",
          filter: `blur(${sizeValues.blur / 2}px)`,
        }}
      />

      {/* Main orb body */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500 overflow-hidden",
          effectiveConfig.animation,
          isListening && "animate-orb-listening",
          isSpeaking && "animate-orb-speaking"
        )}
        style={{
          background: `radial-gradient(circle at 35% 35%, ${effectiveConfig.colors[0]} 0%, ${effectiveConfig.colors[1]} 50%, ${effectiveConfig.colors[2]} 100%)`,
          boxShadow: `
            inset -2px -2px ${sizeValues.glow / 2}px rgba(0,0,0,0.2),
            inset 2px 2px ${sizeValues.glow / 2}px rgba(255,255,255,0.3),
            0 0 ${sizeValues.glow}px ${effectiveConfig.glowColor}
          `,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute rounded-full bg-white/40"
          style={{
            width: "30%",
            height: "30%",
            top: "15%",
            left: "20%",
            filter: "blur(3px)",
          }}
        />

        {/* Secondary highlight */}
        <div
          className="absolute rounded-full bg-white/20"
          style={{
            width: "15%",
            height: "15%",
            top: "25%",
            left: "55%",
            filter: "blur(2px)",
          }}
        />

        {/* Animated inner gradient for movement effect */}
        <div
          className="absolute inset-0 rounded-full animate-orb-inner-rotate"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${effectiveConfig.colors[0]}30 25%, transparent 50%, ${effectiveConfig.colors[2]}30 75%, transparent 100%)`,
          }}
        />
      </div>

      {/* Listening indicator rings */}
      {isListening && (
        <>
          <div
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{
              borderColor: effectiveConfig.colors[0],
              opacity: 0.4,
            }}
          />
          <div
            className="absolute inset-0 rounded-full border animate-ping"
            style={{
              borderColor: effectiveConfig.colors[1],
              opacity: 0.3,
              animationDelay: "0.5s",
              transform: "scale(1.2)",
            }}
          />
        </>
      )}

      {/* Speaking animation dots */}
      {isSpeaking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                backgroundColor: effectiveConfig.colors[i % effectiveConfig.colors.length],
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// CSS for animations (add to globals.css)
export const orbAnimationStyles = `
@keyframes orb-happy {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes orb-sad {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(0.98) translateY(2px); }
}

@keyframes orb-angry {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.02) rotate(-1deg); }
  75% { transform: scale(1.02) rotate(1deg); }
}

@keyframes orb-excited {
  0%, 100% { transform: scale(1) translateY(0); }
  25% { transform: scale(1.08) translateY(-3px); }
  50% { transform: scale(1) translateY(0); }
  75% { transform: scale(1.05) translateY(-2px); }
}

@keyframes orb-confused {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

@keyframes orb-sleepy {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.97); opacity: 0.85; }
}

@keyframes orb-focused {
  0%, 100% { transform: scale(1); box-shadow: 0 0 20px currentColor; }
  50% { transform: scale(1.02); box-shadow: 0 0 30px currentColor; }
}

@keyframes orb-smart {
  0% { transform: scale(1); }
  10% { transform: scale(1.1); }
  20% { transform: scale(1); }
  100% { transform: scale(1); }
}

@keyframes orb-neutral {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes orb-inner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes orb-listening {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes orb-speaking {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.03); }
  50% { transform: scale(1); }
  75% { transform: scale(1.02); }
}

.animate-orb-happy { animation: orb-happy 2s ease-in-out infinite; }
.animate-orb-sad { animation: orb-sad 4s ease-in-out infinite; }
.animate-orb-angry { animation: orb-angry 0.8s ease-in-out infinite; }
.animate-orb-excited { animation: orb-excited 1s ease-in-out infinite; }
.animate-orb-confused { animation: orb-confused 2.5s ease-in-out infinite; }
.animate-orb-sleepy { animation: orb-sleepy 5s ease-in-out infinite; }
.animate-orb-focused { animation: orb-focused 1.5s ease-in-out infinite; }
.animate-orb-smart { animation: orb-smart 1.2s ease-in-out infinite; }
.animate-orb-neutral { animation: orb-neutral 3s ease-in-out infinite; }
.animate-orb-inner-rotate { animation: orb-inner-rotate 20s linear infinite; }
.animate-orb-listening { animation: orb-listening 1s ease-in-out infinite; }
.animate-orb-speaking { animation: orb-speaking 0.5s ease-in-out infinite; }
`;
