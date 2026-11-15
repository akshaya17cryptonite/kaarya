"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCheck,
  Check,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { sendBookingMessageAction } from "@/modules/chat/actions";
import { type ChatMessageItem } from "@/modules/chat/service";

interface BookingChatProps {
  bookingId: string;
  partnerName: string;
  initialMessages: ChatMessageItem[];
  currentUserId: string;
}

const QUICK_SUGGESTIONS = [
  "I have arrived at the apartment gate.",
  "Please share landmark or tower number.",
  "Running ~10 minutes late, apologies!",
  "Service is completed, thank you!",
];

export function BookingChat({
  bookingId,
  partnerName,
  initialMessages,
  currentUserId,
}: BookingChatProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [inputContent, setInputContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputContent;
    if (!text.trim()) return;

    setError(null);
    setInputContent("");

    // Optimistic local message
    const optimisticMessage: ChatMessageItem = {
      id: `local_${Date.now()}`,
      bookingId,
      senderId: currentUserId,
      receiverId: "receiver",
      content: text.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      senderName: "You",
      isMe: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("bookingId", bookingId);
      formData.set("content", text.trim());

      const res = await sendBookingMessageAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to deliver message.");
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <Card className="border shadow-sm flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <CardHeader className="py-3 px-5 border-b bg-muted/20 flex flex-row items-center justify-between shrink-0 space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border">
            {partnerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-bold text-foreground">{partnerName}</CardTitle>
              <Badge variant="success" className="text-[9px] py-0 px-1">
                Active
              </Badge>
            </div>
            <CardDescription className="text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified LocConnect Messaging
            </CardDescription>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px]">
          {messages.length} messages
        </Badge>
      </CardHeader>

      {/* Messages Stream */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-primary" />
            <p className="text-xs font-medium">No messages yet.</p>
            <p className="text-[11px] mt-0.5">
              Send a note to coordinate timings, tools, or location landmarks.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.isMe;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none border"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                </div>

                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-muted-foreground">
                  <span>{formatTime(msg.createdAt)}</span>
                  {isMe && (
                    <span>
                      {msg.isRead ? (
                        <CheckCheck className="w-3 h-3 text-primary inline" />
                      ) : (
                        <Check className="w-3 h-3 inline" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Quick Suggestions & Input Footer */}
      <div className="p-3 border-t bg-card space-y-2 shrink-0">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-muted-foreground text-[10px] flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick:
          </span>
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(suggestion)}
              disabled={isPending}
              className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border text-[11px] shrink-0 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-destructive font-medium px-1">{error}</p>}

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={`Message ${partnerName}...`}
            className="text-xs h-9"
            disabled={isPending}
          />
          <Button
            type="submit"
            size="sm"
            variant="brand"
            disabled={isPending || !inputContent.trim()}
            className="h-9 px-3 gap-1.5 shrink-0"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
