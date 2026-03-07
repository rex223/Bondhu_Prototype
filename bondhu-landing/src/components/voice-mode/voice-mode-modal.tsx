"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, MessageSquare, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BondhuBlob, type BlobEmotion } from "@/components/ui/bondhu-blob";
import { AudioVisualizer, VoiceActivityIndicator } from "./audio-visualizer";
import { cn } from "@/lib/utils";

export type VoiceModeState = "connecting" | "connected" | "disconnected" | "error";

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToChat: () => void;
  userId: string;
  onTranscription?: (text: string, isUser: boolean) => void;
  onEmotionChange?: (emotion: BlobEmotion) => void;
  initialEmotion?: BlobEmotion;
}

interface TranscriptEntry {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isFinal: boolean;
}

// Sentiment analysis for emotion detection
function analyzeTextSentiment(text: string): BlobEmotion {
  const lowerText = text.toLowerCase();

  // Positive emotions
  if (/\b(happy|great|amazing|wonderful|excited|love|awesome|fantastic|joy|grateful|good|nice|thanks|thank)\b/.test(lowerText)) {
    return "happy";
  }
  if (/\b(excited|can't wait|thrilled|pumped|hyped|wow|incredible)\b/.test(lowerText)) {
    return "excited";
  }

  // Negative emotions
  if (/\b(sad|down|depressed|unhappy|lonely|cry|tears|sorry|unfortunately)\b/.test(lowerText)) {
    return "sad";
  }
  if (/\b(angry|mad|frustrated|annoyed|furious|hate|upset)\b/.test(lowerText)) {
    return "angry";
  }
  if (/\b(confused|unsure|don't understand|what|lost|unclear)\b/.test(lowerText)) {
    return "confused";
  }
  if (/\b(tired|exhausted|sleepy|drained|worn out)\b/.test(lowerText)) {
    return "sleepy";
  }

  // Neutral/thinking
  if (/\b(think|consider|maybe|perhaps|hmm|wondering|let me)\b/.test(lowerText)) {
    return "smart";
  }

  // Questions indicate focused listening
  if (/\?$/.test(text.trim())) {
    return "focused";
  }

  return "neutral";
}

export function VoiceModeModal({
  isOpen,
  onClose,
  onSwitchToChat,
  userId,
  onTranscription,
  onEmotionChange,
  initialEmotion = "neutral",
}: VoiceModeModalProps) {
  // Connection state
  const [connectionState, setConnectionState] = useState<VoiceModeState>("disconnected");
  const [error, setError] = useState<string | null>(null);

  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isBondhuSpeaking, setIsBondhuSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Blob emotion
  const [emotion, setEmotion] = useState<BlobEmotion>(initialEmotion);

  // Transcription
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");

  // Refs
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any | null>(null);

  // Track if we are currently handling a connection attempt to avoid race conditions
  const isConnectingRef = useRef(false);

  // Update emotion and notify parent
  const updateEmotion = useCallback((newEmotion: BlobEmotion) => {
    setEmotion(newEmotion);
    onEmotionChange?.(newEmotion);
  }, [onEmotionChange]);

  // Auto-scroll transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, currentTranscript]);

  // Define addTranscript first (used by connectVoice)
  const addTranscript = useCallback((text: string, isUser: boolean, isFinal: boolean) => {
    const entry: TranscriptEntry = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      isUser,
      timestamp: new Date(),
      isFinal,
    };
    setTranscripts((prev) => [...prev, entry]);

    // Analyze sentiment and update emotion
    if (isFinal) {
      const detectedEmotion = analyzeTextSentiment(text);
      updateEmotion(detectedEmotion);

      // Notify parent for storage
      onTranscription?.(text, isUser);
    }
  }, [onTranscription, updateEmotion]);

  // Define disconnectVoice (used by useEffect)
  const disconnectVoice = useCallback(() => {
    // Stop any pending connection attempts
    isConnectingRef.current = false;

    if (clientRef.current) {
      if (typeof clientRef.current.stop === 'function') {
        clientRef.current.stop();
      } else if (typeof clientRef.current.disconnect === 'function') {
        clientRef.current.disconnect();
      }
      clientRef.current = null;
    }
    setConnectionState("disconnected");
    setIsUserSpeaking(false);
    setIsBondhuSpeaking(false);
    setAudioLevel(0);
    updateEmotion("neutral");
  }, [updateEmotion]);

  // Define connectVoice (used by useEffect)
  const connectVoice = useCallback(async () => {
    // Prevent starting if already connecting or connected
    if (clientRef.current || isConnectingRef.current) return;

    isConnectingRef.current = true;
    setConnectionState("connecting");
    setError(null);

    try {
      // Initialize Vapi Client
      const { BondhuVapiClient } = await import("@/lib/vapi");

      // Check if aborted during import
      if (!isConnectingRef.current || !isOpen) {
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

      if (!publicKey || !assistantId) {
        setError("Voice mode is not configured. Please contact support.");
        setConnectionState("error");
        return;
      }

      const client = new BondhuVapiClient(publicKey, assistantId, {
        onConnecting: () => setConnectionState("connecting"),
        onConnected: () => {
          setConnectionState("connected");
          updateEmotion("focused");
        },
        onDisconnected: () => {
          setConnectionState("disconnected");
          setIsUserSpeaking(false);
          setIsBondhuSpeaking(false);
          // Clear ref on valid disconnect
          if (clientRef.current === client) {
            clientRef.current = null;
          }
        },
        onError: (err: any) => {
          console.error("Vapi error:", err);
          if (clientRef.current === client) {
            setError("Connection error. Please try again.");
            setConnectionState("error");
          }
        },
        onSpeechStart: () => {
          setIsUserSpeaking(true);
          setIsBondhuSpeaking(false);
          updateEmotion("focused");
        },
        onSpeechEnd: () => {
          setIsUserSpeaking(false);
        },
        onMessage: (msg: any) => {
          if (msg.type === "transcript") {
            const isUser = msg.role === "user";
            if (isUser) {
              setIsUserSpeaking(false);
            } else {
              setIsBondhuSpeaking(true);
              setTimeout(() => setIsBondhuSpeaking(false), 3000);
            }

            addTranscript(msg.message, isUser, true);
          }
        },
        onVolumeLevel: (volume: number) => {
          if (!isMuted) {
            setAudioLevel(volume);
          }
        }
      });

      // Final check before starting
      if (!isConnectingRef.current || !isOpen) {
        return;
      }

      // Check if race condition created a client in the meantime
      if (clientRef.current) {
        return;
      }

      clientRef.current = client;
      await client.start();

    } catch (err) {
      console.error("Failed to connect voice:", err);
      if (isOpen && isConnectingRef.current) {
        setConnectionState("error");
        setError(err instanceof Error ? err.message : "Failed to connect to voice service.");
        updateEmotion("sad");
        clientRef.current = null;
      }
    } finally {
      isConnectingRef.current = false;
    }
  }, [addTranscript, updateEmotion, isMuted, isOpen]);

  // Connect to voice service when modal opens (after callbacks are defined)
  useEffect(() => {
    let mounted = true;

    if (isOpen) {
      // Small delay to ensure previous effect cleanup has run in Strict Mode
      const timer = setTimeout(() => {
        if (mounted) connectVoice();
      }, 100);
      return () => {
        mounted = false;
        clearTimeout(timer);
        // CRITICAL: Disconnect when unmounting or re-running effect to prevent orphan connections
        disconnectVoice();
      };
    } else {
      disconnectVoice();
    }
  }, [isOpen, connectVoice, disconnectVoice]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (clientRef.current && typeof clientRef.current.setMuted === 'function') {
      clientRef.current.setMuted(newMutedState);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted((prev) => !prev);
    // Vapi web SDK handles output audio automatically
  };

  const handleEndCall = () => {
    disconnectVoice();
    onClose();
  };

  const handleSwitchToChat = () => {
    disconnectVoice();
    onSwitchToChat();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col bg-background"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <VoiceActivityIndicator
                isActive={connectionState === "connected"}
                isSpeaking={isBondhuSpeaking}
              />
              <span className="text-sm font-medium">
                {connectionState === "connecting" && "Connecting..."}
                {connectionState === "connected" && "Voice Mode"}
                {connectionState === "disconnected" && "Disconnected"}
                {connectionState === "error" && "Connection Error"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Bondhu Blob - Center Stage */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative"
            >
              <BondhuBlob
                emotion={emotion}
                size="xl"
                isListening={connectionState === "connected" && !isMuted}
                isSpeaking={isBondhuSpeaking}
                animated={true}
              />

              {/* User speaking indicator around blob */}
              {isUserSpeaking && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -inset-8 rounded-full border-2 border-primary/30 animate-ping"
                  style={{ animationDuration: "1.5s" }}
                />
              )}
            </motion.div>

            {/* Audio Visualizer */}
            <div className="mt-8 h-12">
              <AudioVisualizer
                isActive={connectionState === "connected" && !isMuted}
                audioLevel={audioLevel}
                variant="wave"
              />
            </div>

            {/* Connection Status */}
            {connectionState === "connecting" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-muted-foreground"
              >
                Establishing connection...
              </motion.p>
            )}
          </div>

          {/* Transcription Panel */}
          <div className="h-32 border-t border-border/50 bg-muted/30 overflow-y-auto">
            <div className="p-4 space-y-2">
              {transcripts.length === 0 && connectionState === "connected" && (
                <p className="text-sm text-muted-foreground text-center">
                  Start speaking to see transcription here...
                </p>
              )}
              {transcripts.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "text-sm px-3 py-1.5 rounded-lg max-w-[80%]",
                    entry.isUser
                      ? "ml-auto bg-primary/10 text-foreground"
                      : "mr-auto bg-muted text-foreground"
                  )}
                >
                  <span className={cn(!entry.isFinal && "text-muted-foreground")}>
                    {entry.text}
                  </span>
                </div>
              ))}
              {currentTranscript && (
                <div className="ml-auto text-sm px-3 py-1.5 rounded-lg bg-primary/5 text-muted-foreground max-w-[80%]">
                  {currentTranscript}...
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-4">
              {/* Mute Mic */}
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={toggleMute}
                disabled={connectionState !== "connected"}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>

              {/* End Call */}
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-7 h-7" />
              </Button>

              {/* Mute Speaker */}
              <Button
                variant={isSpeakerMuted ? "destructive" : "outline"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={toggleSpeaker}
                disabled={connectionState !== "connected"}
              >
                {isSpeakerMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
            </div>

            {/* Switch to Chat */}
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwitchToChat}
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Switch to Chat
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

