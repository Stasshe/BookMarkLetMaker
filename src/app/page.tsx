'use client';

import { BookmarkletEditor } from '@/components/BookmarkletEditor';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Bookmarklet Creator</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, edit, and test JavaScript bookmarklets with our professional code editor.
            Automatically minifies and encapsulates your code for optimal performance.
          </p>
        </header>

        <BookmarkletEditor />
      </div>
    </div>
  );
}
