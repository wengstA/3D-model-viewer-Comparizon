
import React, { useMemo } from 'react';
import type { ComparisonItem, Viewer } from '../types';
import { CloseIcon } from './icons';

interface SummaryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: ComparisonItem[];
    viewers: Viewer[];
    voteCategories: string[];
}

export const SummaryDrawer: React.FC<SummaryDrawerProps> = ({ isOpen, onClose, items, viewers, voteCategories }) => {
    const { voteSummary, totalVotes, breakdown } = useMemo(() => {
        // breakdown: category -> viewerId -> count
        const breakdown = new Map<string, Map<string, number>>();
        
        // Initialize breakdown
        voteCategories.forEach(cat => {
            const map = new Map<string, number>();
            viewers.forEach(v => map.set(v.id, 0));
            map.set('all_bad', 0);
            breakdown.set(cat, map);
        });

        // Overall "Wins" (just summing up total votes across all categories per viewer)
        const summary = new Map<string, number>();
        viewers.forEach(v => summary.set(v.id, 0));
        summary.set('all_bad', 0);
        
        let total = 0;
        
        items.forEach(item => {
            if (Object.keys(item.votes).length > 0) total++;

            Object.entries(item.votes).forEach(([category, val]) => {
                const viewerId = val as string;
                // Update overall summary
                summary.set(viewerId, (summary.get(viewerId) || 0) + 1);

                // Update category breakdown
                if (breakdown.has(category)) {
                     const catMap = breakdown.get(category)!;
                     catMap.set(viewerId, (catMap.get(viewerId) || 0) + 1);
                }
            });
        });

        return { voteSummary: summary, totalVotes: total, breakdown };
    }, [items, viewers, voteCategories]);

    const tagSummary = useMemo(() => {
        const summary = new Map<string, number>();
        items.forEach(item => {
            (item.tags || []).forEach(tag => {
                summary.set(tag, (summary.get(tag) || 0) + 1);
            });
        });
        return Array.from(summary.entries()).sort((a, b) => b[1] - a[1]);
    }, [items]);

    const viewerTitleMap = useMemo(() => {
        const map = new Map<string, string>();
        viewers.forEach(v => map.set(v.id, v.title));
        map.set('all_bad', 'All Bad');
        return map;
    }, [viewers]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                    <div className="relative w-screen max-w-md">
                        <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                            <header className="p-4 sm:p-6 bg-sky-600 text-white sticky top-0 z-10">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-lg font-semibold">
                                        Results Summary
                                    </h2>
                                    <div className="ml-3 h-7 flex items-center">
                                        <button 
                                            onClick={onClose}
                                            className="p-1 rounded-full text-sky-200 hover:text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-white"
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <CloseIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            </header>

                            <div className="relative flex-1 p-4 sm:p-6 space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-3">Overall Vote Count</h3>
                                    <p className="text-sm text-gray-600 mb-4">Items with at least one vote: <span className="font-bold text-gray-900">{totalVotes} / {items.length}</span></p>
                                    <ul className="space-y-2">
                                        {Array.from(voteSummary.entries()).map(([key, count]) => (
                                            <li key={key} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-700 truncate max-w-[200px]" title={viewerTitleMap.get(key)}>{viewerTitleMap.get(key)}:</span>
                                                <span className="font-semibold bg-gray-200 px-2 py-0.5 rounded-full">{count}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Category Breakdown */}
                                {Array.from(breakdown.entries()).map(([cat, counts]) => (
                                     <div key={cat} className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2 mb-3">{cat}</h3>
                                        <ul className="space-y-2">
                                            {Array.from(counts.entries()).map(([key, count]) => {
                                                if (count === 0) return null;
                                                return (
                                                    <li key={key} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600 truncate max-w-[200px]">{viewerTitleMap.get(key)}:</span>
                                                        <span className="font-mono text-xs font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">{count}</span>
                                                    </li>
                                                )
                                            })}
                                            {Array.from(counts.values()).every(c => c === 0) && (
                                                <li className="text-xs text-gray-400 italic">No votes yet</li>
                                            )}
                                        </ul>
                                     </div>
                                ))}
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-3">Tags Summary</h3>
                                    {tagSummary.length > 0 ? (
                                        <ul className="space-y-2 max-h-80 overflow-y-auto">
                                            {tagSummary.map(([tag, count]) => (
                                                <li key={tag} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-700">{tag}:</span>
                                                    <span className="font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">{count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No tags have been added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
