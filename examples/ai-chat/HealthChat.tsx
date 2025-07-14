"use client";

import { useState } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Send, User, Bot } from 'lucide-react';

interface HealthChatProps {
  onDoctorRecommendation?: (doctors: any[]) => void;
}

export function HealthChat({ onDoctorRecommendation }: HealthChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/health-chat',
    onFinish: (message) => {
      // Pokud AI doporučila lékaře, zavolej callback
      if (message.content.includes('DOCTORS_RECOMMENDATION')) {
        const doctors = extractDoctorsFromMessage(message.content);
        onDoctorRecommendation?.(doctors);
      }
    }
  });

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Zdravotnický asistent</h3>
            <p>Popište mi vaše zdravotní potřeby a najdu vám vhodného lékaře.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Zdravotnický asistent přemýšlí...</span>
          </div>
        )}
      </CardContent>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Například: 'Potřebuji kardiologa v Praze'"
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}