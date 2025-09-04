import React, { useState } from 'react';
import type { ComparisonItem, Viewer, Asset } from '../types';
import { Placeholder } from './Placeholder';
import { SpinnerIcon, TagIcon, CloseIcon } from './icons';

// FIX: The 'model-viewer' global type is now correctly handled in `types.ts`, so the redundant local declaration has been removed.
interface ComparisonViewProps {
  items: ComparisonItem[];
  isLoading: boolean;
  viewers: Viewer[];
  onVote: (itemKey: string, vote: string) => void;
  onTagsUpdate: (itemKey: string, tags: string[]) => void;
  allTags: string[];
  activeFilters: string[];
  onFilterChange: (tag: string) => void;
  onClearFilters: () => void;
}

const is3DModel = (filePath: string | null): boolean => {
    if (!filePath) return false;
    const supportedExtensions = ['.glb', '.gltf'];
    const lowercased = filePath.toLowerCase();
    return supportedExtensions.some(ext => lowercased.endsWith(ext));
};

const RenderableAsset: React.FC<{ 
    asset: Asset | null,
    altText: string, 
    placeholderText: string,
    isTall?: boolean
}> = ({ asset, altText, placeholderText, isTall }) => {
    const aspectRatioClass = isTall ? 'aspect-[4/5]' : 'aspect-square';

    if (!asset) {
        return <Placeholder text={placeholderText} aspectRatioClass={aspectRatioClass} />;
    }

    const wrapperClassNames = `w-full rounded-md ${aspectRatioClass} bg-black/5 backdrop-blur-sm border border-gray-200 overflow-hidden`;
    const innerClassNames = `w-full h-full`;

    if (is3DModel(asset.path)) {
        return (
            <div className={wrapperClassNames}>
                <model-viewer
                    src={asset.url}
                    alt={altText}
                    camera-controls
                    auto-rotate
                    className={innerClassNames}
                />
            </div>
        );
    }

    return (
        <div className={wrapperClassNames}>
            <img src={asset.url} alt={altText} className={`${innerClassNames} object-contain`} />
        </div>
    );
};

const PREDEFINED_TAGS = ["Lighting Issue", "Wrong Color", "Bad Texture", "Model Error", "Good Candidate"];

const TagEditor: React.FC<{ tags: string[], onTagsUpdate: (newTags: string[]) => void }> = ({ tags, onTagsUpdate }) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = (tag: string) => {
        const newTag = tag.trim();
        if (newTag && !tags.includes(newTag)) {
            onTagsUpdate([...tags, newTag]);
        }
        setInputValue('');
    };

    const removeTag = (tagToRemove: string) => {
        onTagsUpdate(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        }
    };
    
    const availablePredefinedTags = PREDEFINED_TAGS.filter(pt => !tags.includes(pt));

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-sky-200">
                            <CloseIcon className="w-3 h-3"/>
                        </button>
                    </span>
                ))}
            </div>
            <div className="relative mt-2">
                 <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add custom tag and press Enter"
                    className="w-full text-sm p-2 pr-8 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                />
                <TagIcon className="absolute top-1/2 right-2.5 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {availablePredefinedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {availablePredefinedTags.map(tag => (
                        <button key={tag} onClick={() => addTag(tag)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300">
                            + {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const TagFilter: React.FC<{
    allTags: string[];
    activeFilters: string[];
    onFilterChange: (tag: string) => void;
    onClear: () => void;
}> = ({ allTags, activeFilters, onFilterChange, onClear }) => {
    if (allTags.length === 0) return null;

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm mb-6 border border-gray-200">
            <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800 flex-shrink-0">Filter by Tag:</h3>
                <div className="flex-grow flex flex-wrap items-center gap-2">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => onFilterChange(tag)}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                                activeFilters.includes(tag)
                                    ? 'bg-sky-500 text-white shadow'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                {activeFilters.length > 0 && (
                    <button onClick={onClear} className="text-sm font-semibold text-gray-600 hover:text-sky-600 transition-colors">
                        Clear Filter
                    </button>
                )}
            </div>
        </div>
    );
};


interface ComparisonCardProps {
    item: ComparisonItem;
    viewers: Viewer[];
    onVote: (itemKey: string, vote: string) => void;
    onTagsUpdate: (itemKey: string, tags: string[]) => void;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ item, viewers, onVote, onTagsUpdate }) => {
    const gridStyle = {
      gridTemplateColumns: `repeat(${viewers.length > 0 ? viewers.length : 1}, minmax(0, 1fr))`
    };
    
    const voteStatusBorder = item.vote
      ? item.vote === 'all_bad'
          ? 'border-l-4 border-red-500'
          : 'border-l-4 border-sky-500'
      : 'border-l-4 border-transparent';

    return (
        <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all ${voteStatusBorder}`}>
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-mono text-cyan-600 break-all" title={item.key}>{item.key}</p>
            </div>
            <div className="grid gap-4 p-4" style={gridStyle}>
                {viewers.map((viewer, index) => (
                    <div key={viewer.id} className="flex flex-col">
                        <h4 className="font-semibold text-center mb-2 text-gray-800 truncate" title={viewer.title}>
                           {viewer.title}
                        </h4>
                        <RenderableAsset
                            asset={item.assets[index]}
                            altText={viewer.title}
                            placeholderText={`No file in "${viewer.title}"`}
                            isTall={!is3DModel(item.assets[index]?.path)}
                        />
                    </div>
                ))}
            </div>
             <div className="p-4 bg-gray-50/70 border-t border-gray-200 space-y-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold mr-2 text-gray-600">Vote:</span>
                        {viewers.map(viewer => (
                            <button
                                key={viewer.id}
                                onClick={() => onVote(item.key, viewer.id)}
                                className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                                    item.vote === viewer.id
                                    ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {viewer.title}
                            </button>
                        ))}
                        <button
                            onClick={() => onVote(item.key, 'all_bad')}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                                item.vote === 'all_bad'
                                ? 'bg-red-500 text-white shadow-md ring-2 ring-red-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            All Bad
                        </button>
                    </div>
                </div>
                <div>
                    <h5 className="text-sm font-semibold mb-2 text-gray-600">Tags:</h5>
                    <TagEditor 
                        tags={item.tags || []} 
                        onTagsUpdate={(newTags) => onTagsUpdate(item.key, newTags)}
                    />
                </div>
            </div>
        </div>
    );
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({ 
    items, 
    isLoading, 
    viewers, 
    onVote, 
    onTagsUpdate,
    allTags,
    activeFilters,
    onFilterChange,
    onClearFilters
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 mt-8 bg-white rounded-lg shadow">
                <SpinnerIcon className="animate-spin h-8 w-8 text-sky-600" />
                <p className="mt-4 text-lg text-gray-700">Processing files...</p>
            </div>
        );
    }

    if (viewers.length === 0) {
        return (
            <div className="text-center p-10 mt-8 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">Workspace is Empty</h3>
                <p className="mt-2 text-gray-600">Click "Add Viewer" to start a new comparison.</p>
            </div>
        );
    }
    
    if (items.length === 0 && activeFilters.length === 0) {
        return (
             <div className="text-center p-10 mt-8 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">Ready to Compare</h3>
                <p className="mt-2 text-gray-600">Upload a directory into one of the viewers to begin.</p>
            </div>
        );
    }

  const votedCount = items.filter(item => !!item.vote).length;

  return (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-2xl font-bold text-gray-900">Comparison Results</h2>
            <div className="text-lg font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
                Voted: <span className="font-bold text-gray-900">{votedCount}</span> / {items.length}
            </div>
        </div>
        
        <TagFilter 
            allTags={allTags}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            onClear={onClearFilters}
        />
        
        {items.length === 0 && activeFilters.length > 0 && (
            <div className="text-center p-10 mt-2 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">No Results Found</h3>
                <p className="mt-2 text-gray-600">No items match the selected filter(s).</p>
            </div>
        )}

        <div className="space-y-6">
            {items.map(item => (
                <ComparisonCard 
                    key={item.key} 
                    item={item} 
                    viewers={viewers}
                    onVote={onVote}
                    onTagsUpdate={onTagsUpdate}
                />
            ))}
        </div>
    </div>
  );
};