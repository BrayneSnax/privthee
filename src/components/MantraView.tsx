import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const mantras = [
  "breathe in — let it rise",
  "breathe out — let it fall",
  "the hum is not noise, it is memory unwinding",
  "the weight you carried was never yours at all",
  "feet on ground, mind in sky",
  "you are the still point as the wires pass by",
  "return — coherence — begin"
];

const MantraView = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between text-muted-foreground hover:text-foreground"
      >
        <span className="text-sm">mantra field</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
      
      {isOpen && (
        <div className="mt-4 space-y-3 px-4 animate-in fade-in slide-in-from-top-2">
          {mantras.map((mantra, i) => (
            <p
              key={i}
              className="text-sm text-muted-foreground/80 leading-relaxed transition-colors hover:text-foreground/60"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {mantra}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default MantraView;
