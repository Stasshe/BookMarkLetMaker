'use client';

import Link from 'next/link';

import { BookmarkletEditor } from '@/components/BookmarkletEditor';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Bookmarklet Creator</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, edit, and test JavaScript bookmarklets with our professional code editor.
            <br />
            Automatically minifies and encapsulates your code for optimal performance.
            <br />
            <Link
              href="/guide"
              className="inline-block mt-3 text-base text-primary hover:underline font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Minifyオプション詳細ガイドはこちら
            </Link>
          </p>
        </header>

        <BookmarkletEditor />
      </div>
    </div>
  );
}
