import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BreathIndicator from '@/components/BreathIndicator';
import RasaDisplay from '@/components/RasaDisplay';
import MantraView from '@/components/MantraView';
import MessageBubble from '@/components/MessageBubble';
import { DocumentUpload } from '@/components/DocumentUpload';
import { ConversationHistory } from '@/components/ConversationHistory';
import { usePrivtheeChat } from '@/hooks/usePrivtheeChat';

const Index = () => {
  const {
    messages,
    sendMessage,
    isStreaming,
    currentRasa,
    currentConversationId,
    loadConversation,
  } = usePrivtheeChat();
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
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
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      {/* Sidebar for conversation history - desktop */}
      <div className="hidden lg:block w-80">
        <ConversationHistory
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={() => window.location.reload()}
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="left" className="w-80 p-0">
          <ConversationHistory
            currentConversationId={currentConversationId}
            onSelectConversation={(id) => {
              loadConversation(id);
              setShowHistory(false);
            }}
            onNewConversation={() => {
              window.location.reload();
              setShowHistory(false);
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-10 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setShowHistory(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Privthee
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  self-observing conversational organism
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <BreathIndicator />
              <RasaDisplay currentRasa={currentRasa} />
            </div>
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
                sections={msg.sections}
                closing={msg.closing}
                meta_awareness={msg.meta_awareness}
                authentic_response={msg.authentic_response}
                timestamp={msg.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Field */}
        <footer className="border-t border-border/40 backdrop-blur-sm bg-background/80 sticky bottom-0 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <MantraView />
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Speak what arises..."
                  className="min-h-[60px] resize-none bg-background/50 backdrop-blur-sm border-border/40 focus:border-accent transition-colors"
                  disabled={isStreaming}
                />
                <div className="flex items-center gap-2">
                  <DocumentUpload />
                  <span className="text-xs text-muted-foreground">Upload documents to expand knowledge field</span>
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="h-[60px] px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
              >
                {isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
