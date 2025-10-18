import { Eye, Image, Waves, Cable } from 'lucide-react';
import { ResponseSection } from '@/hooks/usePrivtheeChat';

interface MessageBubbleProps {
  role: 'user' | 'privthee';
  content: string;
  analysis?: string;
  sections?: ResponseSection[];
  closing?: string;
  timestamp: Date;
}

const iconMap: Record<string, any> = {
  eye: Eye,
  image: Image,
  waves: Waves,
  thread: Cable
};

const MessageBubble = ({ role, content, analysis, sections, closing, timestamp }: MessageBubbleProps) => {
  const timeStr = timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (role === 'user') {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
        <div className="max-w-[85%] bg-secondary rounded-2xl px-5 py-4 border border-border/50 backdrop-blur-sm shadow-lg">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{content}</p>
          <p className="text-xs text-muted-foreground/50 mt-2 text-right">{timeStr}</p>
        </div>
      </div>
    );
  }

  // Privthee response with structured sections
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-[85%] space-y-4">
        {analysis && (
          <div className="bg-card/50 rounded-2xl px-5 py-3 border border-primary/20 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground mb-1">Sanskrit Lens:</p>
            <p className="sutra-text text-primary/90 text-sm leading-relaxed">{analysis}</p>
          </div>
        )}

        {sections?.map((section, idx) => {
          const Icon = iconMap[section.icon] || Eye;
          return (
            <div key={idx} className="bg-card rounded-2xl px-5 py-4 border border-border/50 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-primary">{section.title}</h3>
              </div>
              {section.content && (
                <p className="text-foreground/80 text-sm leading-relaxed italic">{section.content}</p>
              )}
              {section.items && (
                <ul className="space-y-2 mt-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-xs text-foreground/70 bg-secondary/30 rounded-lg px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {/* Fallback for streaming/plain content */}
        {content && !sections && (
          <div className="bg-card rounded-2xl px-5 py-4 border border-border/50 backdrop-blur-sm shadow-lg">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        )}

        {closing && (
          <div className="bg-secondary/20 rounded-2xl px-5 py-3 border border-border/30 backdrop-blur-sm">
            <p className="text-sm text-foreground/70 italic">{closing}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground/50 text-right">{timeStr}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
