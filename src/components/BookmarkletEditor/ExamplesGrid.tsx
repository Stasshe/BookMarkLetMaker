// サンプル例一覧
type ExamplesGridProps = {
  examples: Array<{ name: string; file: string }>;
  loadExample: (file: string) => void;
};

export default function ExamplesGrid({ examples, loadExample }: ExamplesGridProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Examples</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {examples.map(example => (
          <button
            key={example.name}
            onClick={() => loadExample(example.file)}
            className="p-3 text-left bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            <div className="font-medium text-sm">{example.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
