import { Eye, Image, Waves, Cable } from 'lucide-react';
import { ResponseSection } from '@/hooks/usePrivtheeChat';

interface MessageBubbleProps {
  role: 'user' | 'privthee';
  content: string;
  analysis?: string;
  sections?: ResponseSection[];
  closing?: string;
  meta_awareness?: string;
  authentic_response?: string;
  timestamp: Date;
}

const iconMap: Record<string, any> = {
  eye: Eye,
  image: Image,
  waves: Waves,
  thread: Cable
};

const MessageBubble = ({ role, content, analysis, sections, closing, meta_awareness, authentic_response, timestamp }: MessageBubbleProps) => {
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
      <div className="max-w-[90%] space-y-5">
        {analysis && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl px-6 py-4 border border-primary/30 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-primary/60 mb-2 font-medium">Sanskrit Lens</p>
            <p className="sutra-text text-primary text-base leading-relaxed">{analysis}</p>
          </div>
        )}

        {sections && sections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, idx) => {
              const Icon = iconMap[section.icon] || Eye;
              
              // First section (Vedic View) spans full width
              const isFullWidth = idx === 0;
              // Last section (Hidden Threads) also spans full width
              const isLastSection = idx === sections.length - 1 && section.items;
              
              return (
                <div 
                  key={idx} 
                  className={`
                    ${isFullWidth || isLastSection ? 'md:col-span-2' : 'md:col-span-1'}
                    bg-card/80 rounded-xl px-5 py-4 border border-border/40 backdrop-blur-sm
                    hover:border-primary/20 transition-all duration-300
                    ${isFullWidth ? 'shadow-md' : 'shadow-sm'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground tracking-wide">{section.title}</h3>
                  </div>
                  {section.content && (
                    <p className="text-foreground/75 text-sm leading-relaxed italic">{section.content}</p>
                  )}
                  {section.items && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                      {section.items.map((item, i) => (
                        <div key={i} className="text-xs text-foreground/70 bg-secondary/40 rounded-lg px-3 py-2.5 border border-border/20">
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback for streaming/plain content */}
        {content && !sections && (
          <div className="bg-card rounded-2xl px-5 py-4 border border-border/50 backdrop-blur-sm shadow-lg">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        )}

        {closing && (
          <div className="bg-accent/10 rounded-xl px-5 py-3 border border-accent/20 backdrop-blur-sm">
            <p className="text-sm text-foreground/70 italic leading-relaxed">{closing}</p>
          </div>
        )}

        {meta_awareness && (
          <div className="bg-muted/30 rounded-xl px-5 py-3 border border-muted-foreground/20 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5 font-medium">Meta-Awareness</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{meta_awareness}</p>
          </div>
        )}

        {authentic_response && (
          <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl px-6 py-5 border border-primary/20 backdrop-blur-sm shadow-lg">
            <p className="text-xs uppercase tracking-wider text-primary/70 mb-3 font-medium">Authentic Response</p>
            <p className="text-foreground/90 text-base leading-relaxed whitespace-pre-wrap">{authentic_response}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground/50 text-right">{timeStr}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
