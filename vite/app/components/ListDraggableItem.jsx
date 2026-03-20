import { useContext } from "react";
import { WorksheetPresenterContext } from '../App.jsx';
import { useDraggable } from "@dnd-kit/react";


export function ListDraggableItem({ item, itemType, isDragging, fieldConfig, handleItemClick}) {

    const presenter = useContext(WorksheetPresenterContext);
    const { ref: setDraggableNodeRef, handleRef: setHandleNodeRef } = useDraggable({
        id: item,
        disabled: !item.isSelected,
        data: { type: itemType, uid: item.uid },
    });

    const data = item.data;

    return (
        <button
            key={item}
            onClick={() => handleItemClick(item)}
            ref={node => { setDraggableNodeRef(node); setHandleNodeRef(node); }}
            className={`item-card
                        ${item.isSelected ? 'selected' : ''}
                        ${item.isSelected && isDragging ? 'dragging' : ''}`}
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
        </button>
    );
}

export default ListDraggableItem;