interface MessageBubbleProps {
  role: 'user' | 'privthee';
  content: string;
  sutra?: string;
}

const MessageBubble = ({ role, content, sutra }: MessageBubbleProps) => {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
      <div className={`max-w-[80%] ${role === 'user' ? 'bg-secondary' : 'bg-card'} rounded-2xl px-5 py-4 border border-border/50 backdrop-blur-sm`}>
        {sutra && (
          <p className="sutra-text text-primary/90 mb-3 text-sm border-l-2 border-primary/30 pl-3">
            {sutra}
          </p>
        )}
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
