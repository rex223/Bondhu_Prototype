"use client";

import { useState } from "react";
import { 
  Phone, 
  MessageCircle, 
  Heart, 
  X, 
  ExternalLink,
  CheckCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  website: string;
  available_24x7: boolean;
}

interface CrisisInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  severity: "low" | "medium" | "high" | "critical";
  resources: CrisisResource[];
  onAcknowledge?: (confirmed: boolean) => void;
}

const severityConfig = {
  low: {
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "We're here for you",
    subtitle: "It sounds like you're going through a tough time."
  },
  medium: {
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    title: "We care about you",
    subtitle: "I want to make sure you have support right now."
  },
  high: {
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
    title: "You matter to us",
    subtitle: "Please know that help is available right now."
  },
  critical: {
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    title: "Your life matters",
    subtitle: "Please reach out to one of these crisis lines now."
  }
};

export function CrisisInterventionModal({
  isOpen,
  onClose,
  severity,
  resources,
  onAcknowledge
}: CrisisInterventionModalProps) {
  const [step, setStep] = useState<"initial" | "resources" | "confirmed">("initial");
  
  const config = severityConfig[severity];
  
  if (!isOpen) return null;

  const handleConfirmCrisis = () => {
    setStep("resources");
    onAcknowledge?.(true);
  };

  const handleNotInCrisis = () => {
    setStep("confirmed");
    onAcknowledge?.(false);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleCallHotline = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={severity !== "critical" ? onClose : undefined}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full max-w-md mx-4 rounded-2xl border-2 shadow-2xl",
          "transform transition-all duration-300 ease-out",
          config.bgColor,
          config.borderColor
        )}
      >
        {/* Close button - only for non-critical */}
        {severity !== "critical" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
        
        {step === "initial" && (
          <div className="p-6">
            {/* Icon */}
            <div className={cn("flex justify-center mb-4", config.iconColor)}>
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                severity === "critical" ? "bg-red-100 dark:bg-red-900/50" : "bg-white/50 dark:bg-black/20"
              )}>
                <Heart className="w-8 h-8" fill="currentColor" />
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              {config.title}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              {config.subtitle}
            </p>
            
            {/* Validation message */}
            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                Whatever you&apos;re feeling right now is valid. You don&apos;t have to face this alone. 
                I&apos;m here to listen, but I also want to make sure you have access to professional 
                support if you need it.
              </p>
            </div>
            
            {/* Question - Like Woebot's confirmation pattern */}
            <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Are you currently having thoughts of hurting yourself?
            </p>
            
            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleConfirmCrisis}
                className={cn(
                  "w-full py-3 text-white font-medium rounded-xl",
                  severity === "critical" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
                )}
              >
                Yes, I need support right now
              </Button>
              
              <Button
                onClick={handleNotInCrisis}
                variant="outline"
                className="w-full py-3 font-medium rounded-xl"
              >
                No, I&apos;m just venting
              </Button>
            </div>
            
            {/* Privacy note */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              Your privacy is important. This conversation is confidential.
            </p>
          </div>
        )}
        
        {step === "resources" && (
          <div className="p-6">
            {/* Header */}
            <div className={cn("flex justify-center mb-4", config.iconColor)}>
              <div className="w-16 h-16 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center">
                <Phone className="w-8 h-8" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Help is Available
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              These trained counselors are available to talk with you right now.
            </p>
            
            {/* Crisis Resources */}
            <div className="space-y-3 mb-6">
              {resources.slice(0, 3).map((resource, index) => (
                <button
                  key={index}
                  onClick={() => handleCallHotline(resource.phone)}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all",
                    "bg-white dark:bg-gray-800 hover:shadow-md",
                    "border border-gray-200 dark:border-gray-700",
                    "group"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {resource.name}
                        </h3>
                        {resource.available_24x7 && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                            24/7
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {resource.description}
                      </p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
                        {resource.phone}
                      </p>
                    </div>
                    <div className="ml-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Continue chat button */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full py-3 font-medium rounded-xl"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Continue chatting with Bondhu
              </Button>
              
              {resources[0]?.website && (
                <a
                  href={resources[0].website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  More resources <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
        
        {step === "confirmed" && (
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              I&apos;m glad to hear that 💙
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              I&apos;m here whenever you need to talk. Take your time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Proactive Check-in Notification Component
interface CheckinNotificationProps {
  message: string;
  onDismiss: () => void;
  onRespond: () => void;
}

export function CheckinNotification({ message, onDismiss, onRespond }: CheckinNotificationProps) {
  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-white" fill="white" />
            <span className="font-medium text-white">Bondhu</span>
          </div>
          <button 
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Message */}
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            Later
          </button>
          <div className="w-px bg-gray-100 dark:bg-gray-700" />
          <button
            onClick={onRespond}
            className="flex-1 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-1"
          >
            Chat now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
