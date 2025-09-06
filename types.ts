// FIX: Using a full import of React makes the JSX namespace available for augmentation.
// FIX: Changed to namespace import for broader tsconfig compatibility.
import * as React from 'react';

export interface Asset {
  url: string;
  path: string;
}

export interface Viewer {
  id: string;
  title: string;
  files: FileList | null;
  directoryName: string | null;
  flex: number;
}

export interface ComparisonItem {
  key: string;
  assets: (Asset | null)[];
  vote?: string | null; // Can be a viewer ID or 'all_bad'
  tags?: string[];
}
