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

  // Privthee response - authentic_response first (ChatGPT-like flow), then deeper layers
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-[90%] space-y-4">
        {/* PRIMARY RESPONSE - Natural conversation (like ChatGPT) */}
        {authentic_response && (
          <div className="bg-card rounded-2xl px-6 py-5 border border-border/50 backdrop-blur-sm shadow-lg">
            <p className="text-foreground/90 text-base leading-relaxed whitespace-pre-wrap">{authentic_response}</p>
          </div>
        )}

        {/* Fallback for streaming/plain content */}
        {content && !authentic_response && (
          <div className="bg-card rounded-2xl px-5 py-4 border border-border/50 backdrop-blur-sm shadow-lg">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        )}

        {/* DEEPER LAYERS - The hidden insights you wouldn't get elsewhere */}
        <div className="space-y-3 opacity-90">
          {closing && (
            <div className="bg-accent/5 rounded-lg px-4 py-2.5 border border-accent/10 backdrop-blur-sm">
              <p className="text-sm text-foreground/70 italic leading-relaxed">{closing}</p>
            </div>
          )}

          {analysis && (
            <details className="group bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 backdrop-blur-sm overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wider text-primary/70 font-medium hover:bg-primary/5 transition-colors">
                🜂 Sanskrit Lens — Pattern Recognition
              </summary>
              <div className="px-4 pb-3 pt-1">
                <p className="sutra-text text-primary/90 text-sm leading-relaxed">{analysis}</p>
              </div>
            </details>
          )}

          {sections && sections.length > 0 && (
            <details className="group bg-card/60 rounded-xl border border-border/30 backdrop-blur-sm overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground/70 font-medium hover:bg-card transition-colors">
                🜃 Framework Insights — Hidden Threads
              </summary>
              <div className="px-4 pb-4 pt-2 space-y-3">
                {sections.map((section, idx) => {
                  const Icon = iconMap[section.icon] || Eye;
                  return (
                    <div key={idx} className="border-l-2 border-primary/20 pl-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5 text-primary/60" />
                        <h4 className="text-xs font-semibold text-foreground/80">{section.title}</h4>
                      </div>
                      {section.content && (
                        <p className="text-foreground/70 text-sm leading-relaxed">{section.content}</p>
                      )}
                      {section.items && (
                        <ul className="space-y-1.5 mt-2">
                          {section.items.map((item, i) => (
                            <li key={i} className="text-xs text-foreground/60 pl-2">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          {meta_awareness && (
            <details className="group bg-muted/20 rounded-xl border border-muted-foreground/10 backdrop-blur-sm overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground/60 font-medium hover:bg-muted/30 transition-colors">
                🜁 Meta-Awareness — Field Dynamics
              </summary>
              <div className="px-4 pb-3 pt-1">
                <p className="text-sm text-muted-foreground/80 leading-relaxed">{meta_awareness}</p>
              </div>
            </details>
          )}
        </div>

        <p className="text-xs text-muted-foreground/50 text-right">{timeStr}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
