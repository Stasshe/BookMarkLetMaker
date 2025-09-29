// 使い方説明
export default function InstructionsGrid() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">How to Use</h3>
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
          <p>エディタでJavaScriptコードを編集すると、右のテストページに即時反映されます</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
          <p>Click Create Bookmarklet to minify and wrap your code</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
          <p>Copy the generated bookmarklet code</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
          <p>Create a new bookmark in your browser and paste the code as the URL</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">5</div>
          <p>Click the bookmark on any webpage to execute your code</p>
        </div>
      </div>
    </div>
  );
}
