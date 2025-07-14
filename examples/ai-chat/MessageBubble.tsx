import { Message } from 'ai';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isUser ? "ml-auto" : "mr-auto"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>
      )}
      
      <div className={cn(
        "rounded-lg px-4 py-2",
        isUser 
          ? "bg-blue-600 text-white ml-auto" 
          : "bg-gray-100 text-gray-900"
      )}>
        <div className="text-sm whitespace-pre-wrap">
          {formatHealthMessage(message.content)}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}

// Formátuje zdravotnické zprávy pro lepší čitelnost
function formatHealthMessage(content: string): string {
  // Odstraní technické značky pro doporučení lékařů
  return content.replace(/DOCTORS_RECOMMENDATION:.*$/g, '').trim();
}