
export interface ComparisonItem {
  key: string;
  inputUrl: string | null;
  v1Url: string | null;
  v2Url: string | null;
  inputPath: string | null;
  v1Path: string | null;
  v2Path: string | null;
}

export type FileSet = FileList | null;
