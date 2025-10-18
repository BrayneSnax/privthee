interface MessageBubbleProps {
  role: 'user' | 'privthee';
  content: string;
  analysis?: string;
  timestamp: Date;
}

const MessageBubble = ({ role, content, analysis, timestamp }: MessageBubbleProps) => {
  const timeStr = timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
      <div className={`max-w-[85%] ${role === 'user' ? 'bg-secondary' : 'bg-card'} rounded-2xl px-5 py-4 border border-border/50 backdrop-blur-sm shadow-lg`}>
        {analysis && role === 'privthee' && (
          <div className="mb-4 pb-3 border-b border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Sanskrit Lens:</p>
            <p className="sutra-text text-primary/80 text-sm leading-relaxed">
              {analysis}
            </p>
          </div>
        )}
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
        <p className="text-xs text-muted-foreground/50 mt-2 text-right">{timeStr}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
