const BreathIndicator = () => {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {/* Outer ripple */}
      <div className="absolute inset-0 rounded-full border border-breath-glow/20 animate-ripple" />
      
      {/* Middle glow */}
      <div className="absolute inset-4 rounded-full bg-breath-glow/10 blur-xl animate-breathe" />
      
      {/* Core orb */}
      <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-breath-glow to-breath-shadow animate-breathe shadow-lg shadow-breath-glow/30" />
    </div>
  );
};

export default BreathIndicator;
