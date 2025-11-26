// FIX: An explicit side-effect import is needed to ensure TypeScript loads the
// global type augmentations for custom elements from 'types.ts'.
import React, { useState, useMemo } from 'react';
import { ComparisonItem, Viewer, Asset } from '../types';
import { Placeholder } from './Placeholder';
import { SpinnerIcon, TagIcon, CloseIcon } from './icons';

interface ComparisonViewProps {
  items: ComparisonItem[];
  isLoading: boolean;
  viewers: Viewer[];
  onVote: (itemKey: string, category: string, vote: string) => void;
  onTagsUpdate: (itemKey: string, tags: string[]) => void;
  comparisonItems: ComparisonItem[];
  hasActiveFilters: boolean;
  voteCategories: string[];
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
                {/* @ts-ignore */}
                <model-viewer
                    src={asset.url}
                    alt={altText}
                    camera-controls
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

const TagEditor: React.FC<{ 
    tags: string[], 
    onTagsUpdate: (newTags: string[]) => void,
    allTags: string[] 
}> = ({ tags, onTagsUpdate, allTags }) => {
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
    
    const suggestionTags = useMemo(() => {
        const combined = new Set([...PREDEFINED_TAGS, ...allTags]);
        return Array.from(combined).filter(t => !tags.includes(t)).sort();
    }, [tags, allTags]);

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
            {suggestionTags.length > 0 && (
                <div className="mt-2 max-h-28 overflow-y-auto p-2 border border-gray-200 rounded-md bg-white/50 flex flex-wrap gap-1.5">
                    {suggestionTags.map(tag => (
                        <button key={tag} onClick={() => addTag(tag)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300">
                            + {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const FilterControls: React.FC<{
    allTags: string[];
    activeTagFilters: string[];
    onTagFilterChange: (tag: string) => void;
    viewers: Viewer[];
    activeVoteFilter: string | null;
    onVoteFilterChange: (vote: string) => void;
    onClear: () => void;
}> = ({ allTags, activeTagFilters, onTagFilterChange, viewers, activeVoteFilter, onVoteFilterChange, onClear }) => {
    const hasActiveFilters = activeTagFilters.length > 0 || activeVoteFilter !== null;
    if (allTags.length === 0 && viewers.length === 0) return null;
    
    const isOrLogic = activeTagFilters.length > 0 && activeVoteFilter !== null;

    return (
        <div className="p-4 bg-white/60 rounded-lg shadow-sm border border-gray-200 space-y-4">
            {allTags.length > 0 && (
                <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Filter by Tag:</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => onTagFilterChange(tag)}
                                className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                                    activeTagFilters.includes(tag)
                                        ? 'bg-sky-500 text-white shadow'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
             <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">Filter by Vote (Any Category):</h3>
                <div className="flex flex-wrap items-center gap-2">
                    {viewers.map(viewer => (
                        <button
                            key={viewer.id}
                            onClick={() => onVoteFilterChange(viewer.id)}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                                activeVoteFilter === viewer.id
                                ? 'bg-sky-500 text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {viewer.title}
                        </button>
                    ))}
                    <button
                        onClick={() => onVoteFilterChange('all_bad')}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                            activeVoteFilter === 'all_bad'
                            ? 'bg-red-500 text-white shadow'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        All Bad
                    </button>
                </div>
            </div>

            {hasActiveFilters && (
                 <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    {isOrLogic ? (
                         <p className="text-xs text-gray-500 italic">Showing items that match all tags OR the selected vote.</p>
                    ) : (
                        <span></span>
                    )}
                    <button onClick={onClear} className="text-sm font-semibold text-gray-600 hover:text-sky-600 transition-colors">
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
};


interface ComparisonCardProps {
    item: ComparisonItem;
    viewers: Viewer[];
    onVote: (itemKey: string, category: string, vote: string) => void;
    onTagsUpdate: (itemKey: string, tags: string[]) => void;
    allTags: string[];
    voteCategories: string[];
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ item, viewers, onVote, onTagsUpdate, allTags, voteCategories }) => {
    const gridStyle = {
      gridTemplateColumns: viewers.length > 0 ? viewers.map(v => `${v.flex}fr`).join(' ') : '1fr'
    };
    
    // Calculate border color based on votes.
    // If any vote is 'all_bad', red. If any vote is valid viewer, blue.
    // If mixed, prefer blue.
    let voteStatusBorder = 'border-l-4 border-transparent';
    const hasAnyVote = Object.keys(item.votes).length > 0;
    
    if (hasAnyVote) {
        const votes = Object.values(item.votes);
        const hasGood = votes.some(v => v !== 'all_bad');
        if (hasGood) {
            voteStatusBorder = 'border-l-4 border-sky-500';
        } else {
            voteStatusBorder = 'border-l-4 border-red-500';
        }
    }

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
                            isTall={is3DModel(item.assets[index]?.path)}
                        />
                    </div>
                ))}
            </div>
             <div className="p-4 bg-gray-50/70 border-t border-gray-200 space-y-6">
                <div>
                    <h5 className="text-sm font-semibold mb-3 text-gray-600">Voting:</h5>
                    <div className="space-y-3">
                        {voteCategories.map(category => (
                            <div key={category} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 w-32 uppercase tracking-wide">{category}</span>
                                <div className="flex flex-wrap items-center gap-2 flex-1">
                                    {viewers.map(viewer => (
                                        <button
                                            key={viewer.id}
                                            onClick={() => onVote(item.key, category, viewer.id)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                                item.votes[category] === viewer.id
                                                ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-700'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {viewer.title}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => onVote(item.key, category, 'all_bad')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                            item.votes[category] === 'all_bad'
                                            ? 'bg-red-500 text-white shadow-sm ring-1 ring-red-600'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        All Bad
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h5 className="text-sm font-semibold mb-2 text-gray-600">Tags:</h5>
                    <TagEditor 
                        tags={item.tags || []} 
                        onTagsUpdate={(newTags) => onTagsUpdate(item.key, newTags)}
                        allTags={allTags}
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
    comparisonItems,
    hasActiveFilters,
    voteCategories
}) => {
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        comparisonItems.forEach(item => {
            (item.tags || []).forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [comparisonItems]);
    
    // Count items that have at least one vote
    const votedCount = comparisonItems.filter(i => Object.keys(i.votes).length > 0).length;
    
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
    
    const hasAnyFiles = viewers.some(v => v.files && v.files.length > 0);
    if (!hasAnyFiles) {
        return (
             <div className="text-center p-10 mt-8 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">Ready to Compare</h3>
                <p className="mt-2 text-gray-600">Upload a directory into one of the viewers to begin.</p>
            </div>
        );
    }

  return (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-2xl font-bold text-gray-900">Comparison Results</h2>
            <div className="text-lg font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
                Voted: <span className="font-bold text-gray-900">{votedCount}</span> / {comparisonItems.length}
            </div>
        </div>
        
        {items.length === 0 && hasActiveFilters && (
            <div className="text-center p-10 mt-2 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">No Results Found</h3>
                <p className="mt-2 text-gray-600">No items match the selected filter(s). Try clearing the filters.</p>
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
                    allTags={allTags}
                    voteCategories={voteCategories}
                />
            ))}
        </div>
    </div>
  );
};
