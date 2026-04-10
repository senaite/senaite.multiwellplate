import { Fragment, useContext, useMemo, useSyncExternalStore } from 'react';
import { AppContext } from '../AppContext.js';
import ListDraggableItem from './List/ListDraggableItem.jsx';
import ListWrapper from './List/ListWrapper.jsx';


function UnplatedAnalysesList({ ref, handleSelection, handleDeselection }) {

    const { presenter } = useContext(AppContext);
    const analysesList = useSyncExternalStore(presenter.subscribeUnplaced, () => presenter.getUnplacedListSnapshot());

    const selectedCount = useMemo(
        () => Object.values(analysesList).filter(item => item.isSelected).length,
        [analysesList]
    );

    const handleUnassignSelected = () => {
        const selectedUids = Object.entries(analysesList)
            .filter(([, item]) => item.isSelected)
            .map(([uid]) => uid);
        presenter.unassignAnalyses(selectedUids);
    };

    return (
        <>
            <ListWrapper ref={ref} title="Unplated" sourceItems={analysesList} handleSelection={handleSelection} handleDeselection={handleDeselection}>
                {({ sortedAndGroupedItems, handleItemClick, handleGroupClick, fieldConfig }) =>
                    [...sortedAndGroupedItems].map(([keyStr, items]) => {
                        const groups = JSON.parse(keyStr);
                        const content = items.map(item => (
                            <ListDraggableItem
                                key={item.uid}
                                item={item}
                                fieldConfig={fieldConfig}
                                handleItemClick={handleItemClick}
                            />
                        ));
                        return (groups.length ? (
                            <div key={keyStr} className={groups.length ? 'group-section' : ''}>
                                {groups.length > 0 && (
                                    <div className="group-header" onClick={() => handleGroupClick(keyStr)}>
                                        <div className="group-title">{groups.join(' › ')}</div>
                                        <div className="group-count">{items.length}</div>
                                    </div>
                                )}
                                {content}
                            </div>) : (<Fragment key={keyStr}>{content}</Fragment>)
                        );
                    })
                }
            </ListWrapper>
            <div className={`list-selection-toolbar${selectedCount > 0 ? ' list-selection-toolbar--visible' : ''}`}>
                <span className="list-selection-toolbar__count">{selectedCount} selected</span>
                <button
                    className="list-selection-toolbar__btn list-selection-toolbar__btn--danger"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={handleUnassignSelected}
                    title="Unassign selected analyses from worksheet">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Unassign
                </button>
            </div>
        </>
    );
}

export default UnplatedAnalysesList;
