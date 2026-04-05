import { useContext, useSyncExternalStore } from 'react';
import { WorksheetPresenterContext } from '../App.jsx';
import ListDraggableItem from './List/ListDraggableItem.jsx';
import ListWrapper from './List/ListWrapper.jsx';


function UnplatedAnalysesList({ ref, handleSelection, handleDeselection }) {

    const presenter = useContext(WorksheetPresenterContext);
    const analysesList = useSyncExternalStore(presenter.subscribeUnassigned, () => presenter.getUnassignedListSnapshot());

    return (
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
                    return ( groups.length ? (
                        <div key={keyStr} className={groups.length ? 'group-section' : ''}>
                            {groups.length > 0 && (
                                <div className="group-header" onClick={() => handleGroupClick(keyStr)}>
                                    <div className="group-title">{groups.join(' › ')}</div>
                                    <div className="group-count">{items.length}</div>
                                </div>
                            )}
                            {content}
                        </div>) : (<>{content}</>)
                    );
                })
            }
        </ListWrapper>
    );
}

export default UnplatedAnalysesList;
