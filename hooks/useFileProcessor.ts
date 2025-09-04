import { useState, useEffect } from 'react';
import type { ComparisonItem, FileSet } from '../types';

const getRelativePath = (path: string): string => {
  const parts = path.split('/');
  if (parts.length <= 1) return path;
  return parts.slice(1).join('/');
};

const getPathWithoutExtension = (path: string): string => {
    const lastDotIndex = path.lastIndexOf('.');
    
    // If no dot, or it's the first character (e.g. ".env"), treat as having no extension.
    if (lastDotIndex <= 0) {
        return path;
    }
    
    let baseName = path.substring(0, lastDotIndex);
    
    // Trim any trailing dots from the base name to handle variations like "file....png" vs "file.glb"
    baseName = baseName.replace(/\.+$/, '');
    
    return baseName;
};


export const useFileProcessor = (
  v1Files: FileSet,
  v2Files: FileSet,
  inputFiles: FileSet
): { comparisonData: ComparisonItem[]; isLoading: boolean } => {
  const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    let objectUrls: string[] = [];
    
    const processFiles = () => {
        if (!v1Files && !v2Files && !inputFiles) {
            setComparisonData([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const createFileMap = (files: FileSet): Map<string, { url: string; path: string }> => {
            const map = new Map<string, { url: string; path: string }>();
            if (!files) return map;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Use a try-catch block for robustness, e.g., if webkitRelativePath is not available
                try {
                    const fullPath = (file as any).webkitRelativePath || file.name;
                    const relativePath = getRelativePath(fullPath);
                    const key = getPathWithoutExtension(relativePath);
                    if (key) {
                        const url = URL.createObjectURL(file);
                        objectUrls.push(url);
                        map.set(key, { url, path: relativePath });
                    }
                } catch (error) {
                    console.error("Error processing file:", file.name, error);
                }
            }
            return map;
        };

        const v1Map = createFileMap(v1Files);
        const v2Map = createFileMap(v2Files);
        const inputMap = createFileMap(inputFiles);

        const allKeys = Array.from(new Set([...v1Map.keys(), ...v2Map.keys(), ...inputMap.keys()]));
        allKeys.sort((a, b) => a.length - b.length); // Sort by length, shortest first

        const canonicalKeyMap = new Map<string, string>();
        const processedKeys = new Set<string>();

        for (const key of allKeys) {
            if (processedKeys.has(key)) {
                continue;
            }

            const canonicalKey = key;
            canonicalKeyMap.set(key, canonicalKey);
            processedKeys.add(key);
            
            for (const otherKey of allKeys) {
                if (processedKeys.has(otherKey)) {
                    continue;
                }
                
                // Group keys where the shorter key is a substring of the longer key.
                // Since keys are sorted by length, `key` is always shorter than or equal to `otherKey`.
                if (otherKey.includes(key)) {
                    canonicalKeyMap.set(otherKey, canonicalKey);
                    processedKeys.add(otherKey);
                }
            }
        }
        
        const finalKeys = Array.from(new Set(canonicalKeyMap.values())).sort();

        const data = finalKeys.map(canonicalKey => {
            const groupKeys: string[] = [];
            canonicalKeyMap.forEach((cKey, oKey) => {
                if (cKey === canonicalKey) {
                    groupKeys.push(oKey);
                }
            });

            const findInMap = (map: Map<string, { url: string; path: string }>) => {
                for (const key of groupKeys) {
                    if (map.has(key)) {
                        return map.get(key);
                    }
                }
                return null;
            };

            const v1Data = findInMap(v1Map);
            const v2Data = findInMap(v2Map);
            const inputData = findInMap(inputMap);

            return {
                key: canonicalKey,
                v1Url: v1Data?.url || null,
                v2Url: v2Data?.url || null,
                inputUrl: inputData?.url || null,
                v1Path: v1Data?.path || null,
                v2Path: v2Data?.path || null,
                inputPath: inputData?.path || null,
            };
        });

        setComparisonData(data);
        setIsLoading(false);
    };
    
    processFiles();

    return () => {
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, [v1Files, v2Files, inputFiles]);

  return { comparisonData, isLoading };
};