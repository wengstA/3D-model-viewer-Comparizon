import { useState, useEffect } from 'react';
import type { ComparisonItem, Viewer, Asset } from '../types';

const decodeFileName = (name: string): string => {
  try {
    let decoded = decodeURIComponent(name);
    decoded = decoded.replace(/#U([0-9A-F]{4,5})/gi, (match, grp) => {
      return String.fromCodePoint(parseInt(grp, 16));
    });
    return decoded;
  } catch (e) {
    console.error("Failed to decode filename:", name, e);
    return name;
  }
};

const getRelativePath = (path: string): string => {
  const parts = path.split('/');
  if (parts.length <= 1) return path;
  return parts.slice(1).join('/');
};

const getPathWithoutExtension = (path: string): string => {
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex <= 0) {
        return path;
    }
    let baseName = path.substring(0, lastDotIndex);
    baseName = baseName.replace(/\.+$/, '');
    return baseName;
};


export const useFileProcessor = (
  viewers: Viewer[],
  matchConfig: string[] | null
): { comparisonData: ComparisonItem[]; isLoading: boolean } => {
  const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    let objectUrls: string[] = [];
    
    const processFiles = () => {
        // If we have no files and no config, don't do anything (unless we want to show empty rows from config? 
        // For now, let's assume we need at least one viewer or a config to start processing).
        if ((!viewers || viewers.every(v => !v.files)) && !matchConfig) {
            setComparisonData([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const createFileMap = (files: FileList | null): Map<string, Asset> => {
            const map = new Map<string, Asset>();
            if (!files) return map;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    const fullPath = (file as any).webkitRelativePath || file.name;
                    const relativePath = getRelativePath(fullPath);
                    const decodedRelativePath = decodeFileName(relativePath);
                    const key = getPathWithoutExtension(decodedRelativePath);
                    if (key) {
                        const url = URL.createObjectURL(file);
                        objectUrls.push(url);
                        // Store both exact key and potentially others if needed, 
                        // but for now simple key matching.
                        map.set(key, { url, path: relativePath });
                    }
                } catch (error) {
                    console.error("Error processing file:", file.name, error);
                }
            }
            return map;
        };

        const viewerMaps = viewers.map(viewer => createFileMap(viewer.files));
        let finalKeys: string[] = [];
        let canonicalKeyMap = new Map<string, string>();

        if (matchConfig && matchConfig.length > 0) {
            // --- MANIFEST MODE ---
            // Use the provided JSON keys as the source of truth for order and existence.
            finalKeys = matchConfig;
            
            // In manifest mode, we assume the key in the JSON *is* the canonical key.
            // We map it to itself so the lookup works.
            finalKeys.forEach(k => canonicalKeyMap.set(k, k));

        } else {
            // --- AUTO DISCOVERY MODE ---
            const allKeys = Array.from(new Set(viewerMaps.flatMap(map => Array.from(map.keys()))));
            allKeys.sort((a, b) => a.length - b.length);

            const processedKeys = new Set<string>();

            for (const key of allKeys) {
                if (processedKeys.has(key)) continue;

                const canonicalKey = key;
                canonicalKeyMap.set(key, canonicalKey);
                processedKeys.add(key);
                
                for (const otherKey of allKeys) {
                    if (processedKeys.has(otherKey)) continue;
                    
                    if (otherKey.startsWith(key)) {
                        canonicalKeyMap.set(otherKey, canonicalKey);
                        processedKeys.add(otherKey);
                    }
                }
            }
            finalKeys = Array.from(new Set(canonicalKeyMap.values())).sort();
        }

        const data = finalKeys.map(canonicalKey => {
            const groupKeys: string[] = [];
            
            // Find all variations of keys that map to this canonical key
            // (Mostly relevant for Auto Discovery mode, but safe for Manifest mode too)
            canonicalKeyMap.forEach((cKey, oKey) => {
                if (cKey === canonicalKey) {
                    groupKeys.push(oKey);
                }
            });

            // If we are in manifest mode, ensure the key itself is looked up
            if (matchConfig && !groupKeys.includes(canonicalKey)) {
                groupKeys.push(canonicalKey);
            }

            const findInMap = (map: Map<string, Asset>) => {
                for (const key of groupKeys) {
                    if (map.has(key)) return map.get(key);
                }
                return null;
            };

            const assets: (Asset | null)[] = viewers.map((_, index) => {
                const map = viewerMaps[index];
                return findInMap(map) || null;
            });

            return { 
                key: canonicalKey, 
                assets,
                votes: {} // Initialize with empty votes
            };
        });

        setComparisonData(data);
        setIsLoading(false);
    };
    
    processFiles();

    return () => {
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, [viewers, matchConfig]); // Re-run if viewers OR matchConfig changes

  return { comparisonData, isLoading };
};