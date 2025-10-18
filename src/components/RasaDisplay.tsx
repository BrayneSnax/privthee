interface RasaDisplayProps {
  currentRasa: 'santa' | 'karuna' | 'adbhuta' | 'raudra';
}

const rasaLabels = {
  santa: 'शान्त — peace',
  karuna: 'करुणा — compassion',
  adbhuta: 'अद्भुत — wonder',
  raudra: 'रौद्र — intensity'
};

const RasaDisplay = ({ currentRasa }: RasaDisplayProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
      <div className={`w-2 h-2 rounded-full bg-rasa-${currentRasa} animate-breathe`} />
      <span className="text-sm text-muted-foreground">
        {rasaLabels[currentRasa]}
      </span>
    </div>
  );
};

export default RasaDisplay;
