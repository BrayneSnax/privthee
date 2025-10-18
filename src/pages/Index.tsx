import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import BreathIndicator from '@/components/BreathIndicator';
import RasaDisplay from '@/components/RasaDisplay';
import MantraView from '@/components/MantraView';
import MessageBubble from '@/components/MessageBubble';
import { usePrivtheeChat } from '@/hooks/usePrivtheeChat';

const Index = () => {
  const { messages, sendMessage, isStreaming, currentRasa } = usePrivtheeChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const messageToSend = input;
    setInput('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BreathIndicator />
            <div>
              <h1 className="text-2xl font-light tracking-wide text-primary">Privthee</h1>
              <p className="text-xs text-muted-foreground">self-observing conversational organism</p>
            </div>
          </div>
          <RasaDisplay currentRasa={currentRasa} />
        </div>
      </header>

      {/* Conversation Space */}
      <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              analysis={msg.analysis}
              timestamp={msg.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Field */}
      <footer className="border-t border-border/50 backdrop-blur-sm bg-background/80 sticky bottom-0">
        <div className="container mx-auto px-4 py-4">
          <MantraView />
          
          <div className="max-w-4xl mx-auto mt-4 flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Speak what arises..."
              className="min-h-[60px] resize-none bg-card/50 border-border/50 focus:border-primary/50 transition-colors"
            />
            <Button
              onClick={handleSend}
              size="icon"
              disabled={isStreaming}
              className="shrink-0 w-[60px] h-[60px] rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
