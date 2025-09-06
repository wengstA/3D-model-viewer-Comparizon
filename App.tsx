import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ViewerCard } from './components/ViewerCard';
import { ComparisonView, FilterControls } from './components/ComparisonView';
import { useFileProcessor } from './hooks/useFileProcessor';
import type { Viewer, ComparisonItem } from './types';
import { PlusIcon, DownloadIcon, UploadCloudIcon, ChartBarIcon } from './components/icons';
import { ResizeHandle } from './components/ResizeHandle';
import { SummaryDrawer } from './components/SummaryDrawer';

const App: React.FC = () => {
  const [viewers, setViewers] = useState<Viewer[]>([
    { id: `viewer-${Date.now()}-1`, title: 'Input Images', files: null, directoryName: null, flex: 1 },
    { id: `viewer-${Date.now()}-2`, title: 'Old Model', files: null, directoryName: null, flex: 1 },
    { id: `viewer-${Date.now()}-3`, title: 'New Model', files: null, directoryName: null, flex: 1 },
  ]);

  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const { comparisonData, isLoading } = useFileProcessor(viewers);
  
  // This effect syncs the processed data from the hook with the component's state,
  // preserving any existing votes and tags when the file data is re-processed.
  useEffect(() => {
    const existingData = new Map(comparisonItems.map(item => [item.key, { vote: item.vote, tags: item.tags }]));
    const newItems = comparisonData.map(item => {
      const data = existingData.get(item.key);
      return {
        ...item,
        vote: data?.vote || null,
        tags: data?.tags || [],
      };
    });
    setComparisonItems(newItems);
  }, [comparisonData]);


  // Drag and Drop State
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  
  // Filtering State
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [activeVoteFilter, setActiveVoteFilter] = useState<string | null>(null);
  
  // Summary Drawer State
  const [isSummaryOpen, setSummaryOpen] = useState(false);
  
  // Import/Export
  const importFileRef = useRef<HTMLInputElement>(null);

  // Resizing State
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const resizingData = useRef<{
    index: number;
    startFlex: number;
    nextFlex: number;
    startWidth: number;
    nextWidth: number;
    startX: number;
  } | null>(null);

  const MIN_VIEWER_FLEX_WIDTH = 150; // min width in pixels

  const addViewer = () => {
    const newViewer: Viewer = {
      id: `viewer-${Date.now()}`,
      title: `Viewer ${viewers.length + 1}`,
      files: null,
      directoryName: null,
      flex: 1,
    };
    setViewers(prev => [...prev, newViewer]);
  };

  const removeViewer = (id: string) => {
    setViewers(prev => prev.filter(v => v.id !== id));
  };

  const updateViewer = (id:string, updates: Partial<Omit<Viewer, 'id'>>) => {
    setViewers(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };
  
  const handleVote = (itemKey: string, voteValue: string) => {
    setComparisonItems(prevItems => 
      prevItems.map(item => {
        if (item.key === itemKey) {
          return { ...item, vote: item.vote === voteValue ? null : voteValue };
        }
        return item;
      })
    );
  };
  
  const handleTagsUpdate = (itemKey: string, newTags: string[]) => {
    setComparisonItems(prevItems =>
      prevItems.map(item => 
        item.key === itemKey ? { ...item, tags: newTags } : item
      )
    );
  };

  const handleTagFilterChange = (tag: string) => {
    setActiveTagFilters(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const handleVoteFilterChange = (vote: string) => {
      setActiveVoteFilter(prev => prev === vote ? null : vote);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    dragItem.current = id;
    setTimeout(() => setDragging(true), 0);
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    dragOverItem.current = id;
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
      const dragItemIndex = viewers.findIndex(v => v.id === dragItem.current);
      const dragOverItemIndex = viewers.findIndex(v => v.id === dragOverItem.current);

      const newViewers = [...viewers];
      const [reorderedItem] = newViewers.splice(dragItemIndex, 1);
      newViewers.splice(dragOverItemIndex, 0, reorderedItem);
      setViewers(newViewers);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(false);
  };

  const handleExport = () => {
    const dataToExport = comparisonItems
        .filter(item => item.vote || (item.tags && item.tags.length > 0))
        .map(({ key, vote, tags }) => ({ key, vote, tags: tags || [] }));

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `comparison-results-${new Date().toISOString()}.json`;
    link.click();
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target?.result as string);
            if (!Array.isArray(importedData)) throw new Error("Invalid format");

            const resultsMap = new Map(importedData.map(item => [item.key, { vote: item.vote, tags: item.tags }]));
            
            setComparisonItems(prev => prev.map(item => {
                if (resultsMap.has(item.key)) {
                    const { vote, tags } = resultsMap.get(item.key)!;
                    return { ...item, vote: vote || null, tags: tags || [] };
                }
                return item;
            }));

        } catch (error) {
            alert("Failed to import file. Make sure it's a valid JSON file exported from this tool.");
            console.error(error);
        }
    };
    reader.readAsText(file);
    // Reset file input to allow importing the same file again
    event.target.value = '';
  };

  const handleResizeMove = (e: MouseEvent) => {
      if (!resizingData.current) return;

      const { index, startFlex, nextFlex, startWidth, nextWidth, startX } = resizingData.current;
      const deltaX = e.clientX - startX;

      const newStartWidth = startWidth + deltaX;
      const newNextWidth = nextWidth - deltaX;
      
      if (newStartWidth < MIN_VIEWER_FLEX_WIDTH || newNextWidth < MIN_VIEWER_FLEX_WIDTH) {
          return;
      }

      const totalFlex = startFlex + nextFlex;
      const totalWidth = startWidth + nextWidth;

      const newStartFlex = (newStartWidth / totalWidth) * totalFlex;
      const newNextFlex = (newNextWidth / totalWidth) * totalFlex;

      setViewers(currentViewers =>
          currentViewers.map((viewer, i) => {
              if (i === index) return { ...viewer, flex: newStartFlex };
              if (i === index + 1) return { ...viewer, flex: newNextFlex };
              return viewer;
          })
      );
  };

  const handleResizeEnd = () => {
      resizingData.current = null;
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
  };
  
  const handleResizeStart = (e: React.MouseEvent, index: number) => {
      e.preventDefault();

      const viewerElements = viewerContainerRef.current?.children;
      if (!viewerElements || !viewerElements[index * 2] || !viewerElements[index * 2 + 2]) return;

      const currentCard = viewerElements[index * 2];
      const nextCard = viewerElements[index * 2 + 2];

      const startWidth = currentCard.getBoundingClientRect().width;
      const nextWidth = nextCard.getBoundingClientRect().width;

      resizingData.current = {
          index,
          startFlex: viewers[index].flex,
          nextFlex: viewers[index + 1].flex,
          startWidth,
          nextWidth,
          startX: e.clientX,
      };

      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
  };


  const filteredItems = useMemo(() =>
    comparisonItems.filter(item => {
      const hasActiveTagFilter = activeTagFilters.length > 0;
      const hasActiveVoteFilter = !!activeVoteFilter;

      if (!hasActiveTagFilter && !hasActiveVoteFilter) {
        return true;
      }

      const tagMatch = hasActiveTagFilter
        ? activeTagFilters.every(filterTag => (item.tags || []).includes(filterTag))
        : false;
      
      const voteMatch = hasActiveVoteFilter
        ? item.vote === activeVoteFilter
        : false;

      if (hasActiveTagFilter && !hasActiveVoteFilter) {
        return tagMatch;
      }

      if (!hasActiveTagFilter && hasActiveVoteFilter) {
        return voteMatch;
      }

      if (hasActiveTagFilter && hasActiveVoteFilter) {
        return tagMatch || voteMatch;
      }

      return false;
    }),
    [comparisonItems, activeTagFilters, activeVoteFilter]
  );
  
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    comparisonItems.forEach(item => {
        (item.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [comparisonItems]);
  
  const clearFilters = () => {
    setActiveTagFilters([]);
    setActiveVoteFilter(null);
  };

  const hasActiveFilters = activeTagFilters.length > 0 || activeVoteFilter !== null;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-gray-900 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="sticky top-0 z-20 bg-[#f7f7f7]/90 backdrop-blur-sm -mx-4 px-4 -mt-8 pt-8 pb-6 mb-8 border-b border-gray-200">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Dynamic Comparison Workspace
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
              Add, remove, and reorder viewers. Upload directories to compare assets side-by-side.
            </p>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <input
              type="file"
              accept=".json"
              ref={importFileRef}
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => importFileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <UploadCloudIcon className="w-5 h-5" />
              Import Results
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <DownloadIcon className="w-5 h-5" />
              Export Results
            </button>
            <button
              onClick={() => setSummaryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <ChartBarIcon className="w-5 h-5" />
              Show Summary
            </button>
          </div>
          <div className="mt-6 max-w-6xl mx-auto">
            <FilterControls 
              allTags={allTags}
              activeTagFilters={activeTagFilters}
              onTagFilterChange={handleTagFilterChange}
              viewers={viewers}
              activeVoteFilter={activeVoteFilter}
              onVoteFilterChange={handleVoteFilterChange}
              onClear={clearFilters}
            />
          </div>
        </header>

        <div className="max-w-full mx-auto p-4 border-b-2 border-gray-200">
          <div ref={viewerContainerRef} className="flex items-start gap-0 overflow-x-auto pb-4">
            {viewers.map((viewer, index) => (
              <React.Fragment key={viewer.id}>
                <ViewerCard
                  viewer={viewer}
                  onRemove={removeViewer}
                  onUpdate={updateViewer}
                  onDragStart={(e) => handleDragStart(e, viewer.id)}
                  onDragOver={(e) => { e.preventDefault(); handleDragEnter(e, viewer.id); }}
                  onDrop={(e) => handleDragEnd(e)}
                  onDragEnd={handleDragEnd}
                  isDragging={dragging && dragItem.current === viewer.id}
                />
                {index < viewers.length - 1 && (
                   <ResizeHandle onMouseDown={(e) => handleResizeStart(e, index)} />
                )}
              </React.Fragment>
            ))}
            <button
              onClick={addViewer}
              className="flex-shrink-0 w-80 h-[288px] bg-white rounded-xl p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 text-gray-500 hover:border-sky-500 hover:text-sky-600 transition-all duration-300"
            >
              <PlusIcon className="h-10 w-10" />
              <span className="mt-2 font-semibold">Add Viewer</span>
            </button>
          </div>
        </div>

        <div className="max-w-full mx-auto">
             <ComparisonView 
                items={filteredItems} 
                isLoading={isLoading} 
                viewers={viewers}
                onVote={handleVote}
                onTagsUpdate={handleTagsUpdate}
                comparisonItems={comparisonItems}
                hasActiveFilters={hasActiveFilters}
              />
        </div>
        
        <SummaryDrawer
            isOpen={isSummaryOpen}
            onClose={() => setSummaryOpen(false)}
            items={comparisonItems}
            viewers={viewers}
        />
      </main>
    </div>
  );
};

export default App;