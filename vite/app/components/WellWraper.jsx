import { useContext, useEffect, useState, useSyncExternalStore } from "react";
import { useDraggable, useDroppable } from '@dnd-kit/react';
import { pointerIntersection } from '@dnd-kit/collision';
import { isWidget } from "../utils/helpers.js";
import { WorksheetPresenterContext } from '../App.jsx';
import { AppContext } from "./Layout.jsx";
import Well from "./Well";


function WidgetWellWrapper({ idx, assignedAnalyses, anchor }) {
    const presenter = useContext(WorksheetPresenterContext);
    const [ruleEval, setRuleEval] = useState(null);

    useEffect(() => {
        async function doEval() {
            return presenter.evaluateRules({
                nextIdx: idx,
                uid: anchor,
                prepositioned: {}
            });
        };
        doEval().then((overallPass) => setRuleEval(overallPass));
    }, []);

    const onWellClick = () => {
        if (ruleEval) {
            presenter.setNextAction(presenter.assignAnalyses.bind(presenter));
            presenter.setNextAssignments([{ uid: anchor, wellIdx: idx }]);
            presenter.doNextAction();
        }
    };

    return <Well idx={idx} onWellClick={onWellClick} assignedAnalyses={assignedAnalyses} isAssignable={ruleEval} />;
}

function AppWellWrapper({ idx, isSelectable, isSelected, assignedAnalyses, prepositionedItems, selectedAnalyses }) {
    const presenter = useContext(WorksheetPresenterContext);
    const { isDragging } = useContext(AppContext);
    const isDroppable = !isSelectable;
    const fieldConfig = presenter.getConfig().fields;

    const { ref: setDraggableNodeRef } = useDraggable({
        id: idx,
        disabled: !isSelected,
        data: { type: 'well', idx },
    });

    const { ref: setDroppableNodeRef } = useDroppable({
        id: idx,
        collisionDetector: pointerIntersection,
    });

    const onWellClick = () => {
        const hasNotSelected = !assignedAnalyses.every(analysis => selectedAnalyses.includes(analysis.uid));
        if (isSelectable && hasNotSelected) { presenter.selectWell(idx); return; }
        if (isSelectable && !hasNotSelected) { presenter.deselectWell(idx); return; }
        if (!isSelectable) presenter.setSelectedAnalyses([]);
    };

    const onAnalysisClick = (e, analysisUid) => {
        e.stopPropagation();
        if (selectedAnalyses.includes(analysisUid)) {
            presenter.deselect(analysisUid);
            return;
        }
        presenter.select(analysisUid);
    };

    return (
        <Well
            idx={idx}
            onWellClick={onWellClick}
            isSelected={isSelected}
            isDroppable={isDroppable}
            isDragging={isDragging.current}
            prepositionedItems={prepositionedItems}
            prepositionMode={presenter.getPrepositionMode()}
            assignedAnalyses={assignedAnalyses}
            fieldConfig={fieldConfig}
            ref={node => {
                setDroppableNodeRef(node);
                setDraggableNodeRef(node);
            }}
        >
            {assignedAnalyses.map((analysis) => (
                <div
                    key={analysis.uid}
                    className={`well-analyses-list-item ${selectedAnalyses.includes(analysis.uid) ? 'well-analyses-list-item--selected' : ''}`}
                    onClick={(e) => onAnalysisClick(e, analysis.uid)}
                >
                    {Object.entries(analysis).map(([key, value]) => {
                        if (key === 'uid' || !fieldConfig || !['both', 'title'].includes(fieldConfig[key]?.display_mode)) return '';
                        return value
                    }).join(' ').trim()}
                </div>
            ))}
        </Well>
    )
}

function WellWrapper({ idx }) {
    const presenter = useContext(WorksheetPresenterContext);
    const { mode, anchor } = useContext(AppContext);
    const wellData = useSyncExternalStore(presenter.subscribe, () => presenter.getWellDataSnapshot(idx));

    return isWidget(mode) ?
        <WidgetWellWrapper
            idx={idx}
            assignedAnalyses={wellData.assignedAnalyses}
            anchor={anchor} />
        :
        <AppWellWrapper idx={idx} {...wellData} />;
    ;
}

export default WellWrapper;
