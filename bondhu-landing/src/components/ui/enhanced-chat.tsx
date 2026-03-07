"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Sparkles, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAvatar, MiniBlob } from "@/components/ui/chat-avatar";
import { BondhuBlob, type BlobEmotion } from "@/components/ui/bondhu-blob";
import { CrisisInterventionModal, CheckinNotification } from "@/components/ui/crisis-intervention-modal";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/auth";
import type { CrisisResource } from "@/lib/api/chat";
import { chatApi, generateSessionId } from "@/lib/api/chat";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: number;
  sender: 'user' | 'bondhu';
  message: string;
  timestamp: string;
  isTyping?: boolean;
  reactions?: string[];
  mood?: 'happy' | 'caring' | 'thinking' | 'excited';
  hasPersonalityContext?: boolean;
  source?: 'text' | 'voice';
}

interface EnhancedChatProps {
  profile: Profile;
  onEmotionChange?: (emotion: BlobEmotion) => void;
  fullScreen?: boolean;
}

// Simple sentiment analysis for orb emotion
function analyzeMessageSentiment(message: string): BlobEmotion {
  const lowerMessage = message.toLowerCase();
  
  // Positive emotions
  if (/\b(happy|great|amazing|wonderful|excited|love|awesome|fantastic|joy|grateful)\b/.test(lowerMessage)) {
    return "happy";
  }
  if (/\b(excited|can't wait|thrilled|pumped|hyped)\b/.test(lowerMessage)) {
    return "excited";
  }
  
  // Negative emotions
  if (/\b(sad|down|depressed|unhappy|lonely|cry|tears)\b/.test(lowerMessage)) {
    return "sad";
  }
  if (/\b(angry|mad|frustrated|annoyed|furious|hate)\b/.test(lowerMessage)) {
    return "angry";
  }
  if (/\b(confused|unsure|don't understand|what|lost)\b/.test(lowerMessage)) {
    return "confused";
  }
  if (/\b(tired|exhausted|sleepy|drained|worn out)\b/.test(lowerMessage)) {
    return "sleepy";
  }
  
  // Neutral/thinking
  if (/\b(think|consider|maybe|perhaps|hmm|wondering)\b/.test(lowerMessage)) {
    return "smart";
  }
  
  // Questions indicate focused listening
  if (/\?$/.test(message.trim())) {
    return "focused";
  }
  
  return "neutral";
}

export function EnhancedChat({ profile, onEmotionChange, fullScreen = false }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPersonalityContext, setHasPersonalityContext] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  
  // Crisis intervention state
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisData, setCrisisData] = useState<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    resources: CrisisResource[];
  } | null>(null);
  const [checkinNotification, setCheckinNotification] = useState<{
    message: string;
    triggerReason: string;
  } | null>(null);
  
  const sessionId = useRef<string>(generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset quick responses at midnight
  useEffect(() => {
    const checkAndResetQuickResponses = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);

      const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        setShowQuickResponses(true);
        checkAndResetQuickResponses();
      }, timeUntilMidnight);

      return () => clearTimeout(timeout);
    };

    return checkAndResetQuickResponses();
  }, []);

  // Get user ID from Supabase auth
  useEffect(() => {
    const getUserId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  // Load chat history when userId is available
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId) return;

      try {
        setIsLoadingHistory(true);
        const history = await chatApi.getChatHistory(userId, 50, 0);

        if (history.messages && history.messages.length > 0) {
          const historyMessages: Message[] = history.messages.map((item, index) => [
            {
              id: Date.now() - (history.messages.length * 2) + (index * 2),
              sender: 'user' as const,
              message: item.message,
              timestamp: item.created_at,
            },
            {
              id: Date.now() - (history.messages.length * 2) + (index * 2) + 1,
              sender: 'bondhu' as const,
              message: item.response,
              timestamp: item.created_at,
              hasPersonalityContext: item.has_personality_context,
            }
          ]).flat();

          setMessages(historyMessages);
        } else {
          setMessages([{
            id: 1,
            sender: 'bondhu',
            message: `Hey ${profile.full_name?.split(' ')[0] || 'there'}! 👋 How are you feeling today?`,
            timestamp: new Date().toISOString(),
          }]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setMessages([{
          id: 1,
          sender: 'bondhu',
          message: `Hey ${profile.full_name?.split(' ')[0] || 'there'}! 👋 How are you feeling today?`,
          timestamp: new Date().toISOString(),
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [userId, profile.full_name]);
  // Fetch pending proactive check-in notifications
  useEffect(() => {
    if (!userId) return;

    interface ProactiveNotification {
      id: string;
      type: string;
      message: string;
      metadata?: {
        trigger_reason?: string;
      };
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const checkinNotifications = data.notifications?.filter(
            (n: ProactiveNotification) => n.type === 'proactive_checkin'
          ) as ProactiveNotification[] | undefined;
          
          if (checkinNotifications && checkinNotifications.length > 0) {
            // Show the most recent proactive check-in
            const latest = checkinNotifications[0];
            setCheckinNotification({
              message: latest.message,
              triggerReason: latest.metadata?.trigger_reason || 'general',
            });
            
            // Mark notification as read
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'mark_read',
                notification_id: latest.id,
              }),
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    // Analyze user message sentiment and update orb
    const userEmotion = analyzeMessageSentiment(newMessage);
    onEmotionChange?.(userEmotion);

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setShowQuickResponses(false);
    setIsTyping(true);
    setError(null);
    inputRef.current?.focus();

    // Set orb to thinking while waiting for response
    onEmotionChange?.("focused");

    try {
      const response = await chatApi.sendMessage(userId, newMessage, sessionId.current);

      // Check for crisis detection in response
      if (response.crisis_detected && response.crisis_severity) {
        const isSevere = response.crisis_severity === 'high' || response.crisis_severity === 'critical';
        
        if (isSevere && response.crisis_resources) {
          // Show crisis intervention modal for high/critical severity
          setCrisisData({
            severity: response.crisis_severity,
            resources: response.crisis_resources,
          });
          setShowCrisisModal(true);
          
          // Set orb to sad/empathetic emotion during crisis
          onEmotionChange?.("sad");
        }
      }

      // Analyze AI response sentiment
      const responseEmotion = analyzeMessageSentiment(response.response);
      if (!response.crisis_detected) {
        onEmotionChange?.(responseEmotion);
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: 'bondhu',
        message: response.response,
        timestamp: response.timestamp,
        hasPersonalityContext: response.has_personality_context,
      };

      setMessages(prev => [...prev, aiMessage]);
      setHasPersonalityContext(response.has_personality_context);

      // Update activity stats
      try {
        await fetch('/api/activity-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'increment_chat',
            data: { messageCount: 1 }
          })
        });
      } catch (statsError) {
        console.error('Failed to update chat stats:', statsError);
      }

      if (!response.has_personality_context) {
        setError("💡 Complete your personality assessment for more personalized responses!");
      }

      setIsTyping(false);
      inputRef.current?.focus();

      // Refetch chat history
      try {
        const updatedHistory = await chatApi.getChatHistory(userId, 50, 0, true);
        if (updatedHistory.messages && updatedHistory.messages.length > 0) {
          const historyMessages: Message[] = updatedHistory.messages.map((item, index) => [
            {
              id: Date.now() - (updatedHistory.messages.length * 2) + (index * 2),
              sender: 'user' as const,
              message: item.message,
              timestamp: item.created_at,
            },
            {
              id: Date.now() - (updatedHistory.messages.length * 2) + (index * 2) + 1,
              sender: 'bondhu' as const,
              message: item.response,
              timestamp: item.created_at,
              hasPersonalityContext: item.has_personality_context,
            }
          ]).flat();
          setMessages(historyMessages);
        }
      } catch (refetchErr) {
        console.error('Failed to refetch chat history:', refetchErr);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
      onEmotionChange?.("sad");

      setIsTyping(false);

      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'bondhu',
        message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. 🙏",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const quickMessages = [
    { text: "How are you feeling today?", emoji: "💭" },
    { text: "I need some motivation", emoji: "✨" },
    { text: "Let's explore something creative", emoji: "🎨" },
    { text: "Help me stay organized", emoji: "📋" },
  ];

  const handleQuickMessage = (message: string) => {
    setNewMessage(message);
    inputRef.current?.focus();
  };

  const copyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
  };

  const addReaction = (messageId: number, reaction: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
        : msg
    ));
  };

  const reactionEmojis = ['👍', '❤️', '😊'];

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateKey = date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  const formatDateBadge = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (date > oneWeekAgo) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Full screen layout (minimalist)
  if (fullScreen) {
    return (
      <div className="flex flex-col h-full">
        {/* Personality Context Indicator */}
        {hasPersonalityContext && (
          <div className="px-4 py-2 bg-primary/5 text-center border-b border-border/30">
            <p className="text-xs text-primary flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              <span>Personality-aware mode active</span>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-amber-500/10 text-center border-b border-border/30">
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <BondhuBlob emotion="focused" size="lg" />
              <p className="text-sm text-muted-foreground">Loading your conversation...</p>
            </div>
          ) : (
            Object.entries(groupMessagesByDate(messages)).map(([dateKey, dateMessages]) => (
              <div key={dateKey}>
                {/* Date Badge */}
                <div className="flex justify-center my-3">
                  <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                    {formatDateBadge(dateMessages[0].timestamp)}
                  </div>
                </div>

                {/* Messages */}
                {dateMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex mb-3",
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] group",
                        msg.sender === 'user' ? 'order-2' : 'order-1'
                      )}
                    >
                      {msg.sender === 'bondhu' && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <MiniBlob emotion="neutral" />
                          <span className="text-xs text-muted-foreground font-medium">Bondhu</span>
                        </div>
                      )}

                      <div
                        className={cn(
                          "px-4 py-2.5 relative transition-all duration-200",
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                            : 'bg-muted rounded-2xl rounded-bl-md'
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <p className={cn(
                              "text-[10px]",
                              msg.sender === 'user' ? "text-primary-foreground/60" : "text-muted-foreground"
                            )}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {msg.source === 'voice' && (
                              <span className={cn(
                                "text-[9px] italic",
                                msg.sender === 'user' ? "text-primary-foreground/50" : "text-muted-foreground/70"
                              )}>
                                voice
                              </span>
                            )}
                          </div>

                          {msg.sender === 'bondhu' && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => copyMessage(msg.message)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {reactionEmojis.map((emoji) => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-xs"
                                  onClick={() => addReaction(msg.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.from(new Set(msg.reactions)).map((reaction, index) => {
                              const count = msg.reactions!.filter(r => r === reaction).length;
                              return (
                                <span
                                  key={index}
                                  className="text-xs bg-background/50 rounded-full px-1.5 py-0.5"
                                >
                                  {reaction} {count > 1 && count}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="flex items-center gap-2">
                <MiniBlob emotion="focused" />
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        {showQuickResponses && messages.length <= 2 && (
          <div className="px-4 py-3 border-t border-border/30">
            <div className="flex flex-wrap gap-2">
              {quickMessages.map((quick, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-full"
                  onClick={() => handleQuickMessage(quick.text)}
                >
                  <span className="mr-1">{quick.emoji}</span>
                  {quick.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-border/30 bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Message Bondhu..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="pr-10 h-11 bg-muted/50 border-0 rounded-full text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
                disabled={isTyping}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
              >
                <Mic className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isTyping}
              size="sm"
              className="h-11 w-11 p-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Original card layout (kept for backward compatibility)
  return (
    <div className="w-full">
      <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Messages Area */}
        <div className="h-[60vh] max-h-[600px] min-h-[400px] overflow-y-auto p-4 space-y-4 scroll-smooth">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <BondhuBlob emotion="focused" size="lg" />
              <p className="text-sm text-muted-foreground">Loading your conversation...</p>
            </div>
          ) : (
            Object.entries(groupMessagesByDate(messages)).map(([dateKey, dateMessages]) => (
              <div key={dateKey}>
                <div className="flex justify-center my-3">
                  <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                    {formatDateBadge(dateMessages[0].timestamp)}
                  </div>
                </div>

                {dateMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex mb-3",
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn("max-w-[80%]", msg.sender === 'user' ? 'order-2' : 'order-1')}>
                      {msg.sender === 'bondhu' && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <MiniBlob emotion="neutral" />
                          <span className="text-xs text-muted-foreground font-medium">Bondhu</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "px-4 py-2.5",
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                            : 'bg-muted rounded-2xl rounded-bl-md'
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className={cn(
                            "text-[10px]",
                            msg.sender === 'user' ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {msg.source === 'voice' && (
                            <span className={cn(
                              "text-[9px] italic",
                              msg.sender === 'user' ? "text-primary-foreground/50" : "text-muted-foreground/70"
                            )}>
                              voice
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="flex items-center gap-2">
                <MiniBlob emotion="focused" />
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/30">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Message Bondhu..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="h-11 rounded-full"
              disabled={isTyping}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isTyping}
              size="sm"
              className="h-11 w-11 p-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Crisis Intervention Modal */}
      {showCrisisModal && crisisData && (
        <CrisisInterventionModal
          isOpen={showCrisisModal}
          onClose={() => setShowCrisisModal(false)}
          severity={crisisData.severity}
          resources={crisisData.resources}
          onAcknowledge={async (confirmed) => {
            // Log the acknowledgment via API
            try {
              await fetch('/api/crisis/acknowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  confirmed,
                  severity: crisisData.severity,
                  timestamp: new Date().toISOString(),
                }),
              });
            } catch (err) {
              console.error('Failed to log crisis acknowledgment:', err);
            }
            setShowCrisisModal(false);
            setCrisisData(null);
          }}
        />
      )}

      {/* Proactive Check-in Notification */}
      {checkinNotification && (
        <CheckinNotification
          message={checkinNotification.message}
          onDismiss={() => setCheckinNotification(null)}
          onRespond={() => {
            // Open chat to continue conversation
            setNewMessage("I'd like to talk about how I'm feeling...");
            setCheckinNotification(null);
          }}
        />
      )}
    </div>
  );
}
