import { useContext, useMemo, useSyncExternalStore } from 'react';
import { AppContext } from '../AppContext.js';
import ListDraggableItem from './List/ListDraggableItem.jsx';
import ListWrapper from './List/ListWrapper.jsx';


function wellLabel(wellIdx, colsCount) {
    const row = Math.floor((wellIdx - 1) / colsCount) + 1;
    const col = ((wellIdx - 1) % colsCount) + 1;
    return String.fromCharCode(64 + row) + col;
}

function groupByWell(items) {
    return Object.entries(
        items.reduce((wells, item) => { (wells[item.wellIdx] ??= []).push(item); return wells; }, {})
    ).sort(([a], [b]) => a - b);
}


function PlatedAnalysesList({ ref, handleSelection, handleDeselection }) {

    const { presenter } = useContext(AppContext);
    const analysesList = useSyncExternalStore(presenter.subscribePlaced, () => presenter.getPlacedListSnapshot());

    const { colsCount } = presenter.getConfig();

    const selectedCount = useMemo(
        () => Object.values(analysesList).filter(item => item.isSelected).length,
        [analysesList]
    );

    const handleRemoveSelected = () => {
        const selectedUids = Object.entries(analysesList)
            .filter(([, item]) => item.isSelected)
            .map(([uid]) => uid);
        presenter.removeMany(selectedUids);
    };

    const getOrderedUids = (groupedItems) =>
        [...groupedItems.values()].flatMap(items =>
            groupByWell(items).flatMap(([, wellItems]) => wellItems.map(item => item.uid))
        );

    const handleWellClick = (wellItems) => {
        const allSelected = wellItems.every(item => item.isSelected);
        allSelected ? handleDeselection(wellItems.map(item => item.uid)) : handleSelection(wellItems.map(item => item.uid));
    };

    return (
        <>
            <ListWrapper ref={ref} title="Plated" sourceItems={analysesList} handleSelection={handleSelection} handleDeselection={handleDeselection} getOrderedUids={getOrderedUids}>
                {({ sortedAndGroupedItems, handleItemClick, handleGroupClick, fieldConfig }) =>
                  (
                        [...sortedAndGroupedItems].map(([keyStr, items]) => {
                            const groups = JSON.parse(keyStr);
                            return (
                                <div key={keyStr} className={groups.length ? 'group-section' : ''}>
                                    {groups.length > 0 && (
                                        <div className="group-title" onClick={() => handleGroupClick(keyStr)}>
                                            {groups.join(' › ')}
                                            {items.length > 1 && <span className="group-count">×{items.length}</span>}
                                        </div>
                                    )}
                                    {groupByWell(items).map(([wellIdx, wellItems]) => (
                                        <div key={wellIdx} className="well-section">
                                            <div className="well-title" onClick={() => handleWellClick(wellItems)}>
                                                {wellLabel(Number(wellIdx), colsCount)}
                                                {wellItems.length > 1 && <span className="well-count">×{wellItems.length}</span>}
                                            </div>
                                            {wellItems.map((item) => (
                                                <ListDraggableItem
                                                    key={item.uid}
                                                    item={item}
                                                    fieldConfig={fieldConfig}
                                                    handleItemClick={handleItemClick}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            );
                        })
                    )
                }
            </ListWrapper>
            <div className={`list-selection-toolbar${selectedCount > 0 ? ' list-selection-toolbar--visible' : ''}`}>
                <span className="list-selection-toolbar__count">{selectedCount} selected</span>
                <button
                    className="list-selection-toolbar__btn list-selection-toolbar__btn--warning"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={handleRemoveSelected}
                    title="Remove selected analyses from plate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                </button>
            </div>
        </>
    );
}

export default PlatedAnalysesList;
