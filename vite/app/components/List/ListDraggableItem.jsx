import { useState } from 'react';
import { useDragDropMonitor, useDraggable } from "@dnd-kit/react";
import { cleanAndJoinClasses } from '../../utils/helpers.js';


export function ListDraggableItem({ item, itemType, fieldConfig, handleItemClick }) {

    const { ref: setDraggableNodeRef, handleRef: setHandleNodeRef } = useDraggable({
        id: item,
        disabled: !item.isSelected,
        data: { type: itemType, uid: item.uid },
    });

    const data = item.data;

    const [isDragging, setIsDragging] = useState(false);

    useDragDropMonitor({
        onDragStart() {
            item.isSelected && setIsDragging(true);
        },
        onDragEnd() {
            item.isSelected && setIsDragging(false);
        },
        onDragCancel() {
            item.isSelected && setIsDragging(false);
        },
    }
    );

    const itemClasses = [
        'item-card', 
        item.isSelected ? 'selected' : '', 
        item.isSelected && isDragging ? 'dragging' : ''
    ]

    return (
        <div
            key={item}
            onClick={() => handleItemClick(item)}
            ref={node => { setDraggableNodeRef(node); setHandleNodeRef(node); }}
            className={cleanAndJoinClasses(itemClasses)}
        >
            <div className="item-content">
                <div className="item-info">
                    <div className="item-name">
                        {Object.entries(data).map(([key, value]) => {
                            if (!fieldConfig[key]?.display_mode.includes('title')) return null;
                            return <span key={key} className={`name-${key}`}>{value}&nbsp;</span>
                        })}
                    </div>
                    <div className="item-meta">
                        {Object.entries(data).map(([key, value]) => {
                            if (!fieldConfig[key]?.display_mode.includes('description')) return null;
                            return <span key={key} className={`meta-${key}`}>{value}&nbsp;</span>
                        })}
                    </div>
                </div>
                {item.isSelected && (
                    <div className="checkmark">
                        <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListDraggableItem;