
export interface Asset {
  url?: string; // Optional now, usually we use the file directly
  path: string;
  file: File;
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
  votes: Record<string, string>; // category -> viewerId or 'all_bad'
  tags?: string[];
}
