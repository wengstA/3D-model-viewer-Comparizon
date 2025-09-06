import React from 'react';
import { GripVerticalIcon } from './icons';

export const ResizeHandle: React.FC<{ onMouseDown: (e: React.MouseEvent) => void }> = ({ onMouseDown }) => {
    return (
        <div
            className="flex-shrink-0 w-6 h-[288px] flex items-center justify-center group cursor-col-resize"
            onMouseDown={onMouseDown}
            role="separator"
            aria-orientation="vertical"
        >
            <GripVerticalIcon className="w-2 h-8 text-gray-300 group-hover:text-sky-500 transition-colors" />
        </div>
    );
};
