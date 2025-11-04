import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Organization not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">The organization you are looking for does not exist or is inactive.</p>
      <div className="mt-6">
        <Link href="/" className="text-primary underline">
          Go back home
        </Link>
      </div>
    </div>
  );
}
