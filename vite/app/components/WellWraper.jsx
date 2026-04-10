import { useContext, useEffect, useState, useSyncExternalStore } from "react";
import { useDraggable, useDroppable } from '@dnd-kit/react';
import { pointerIntersection } from '@dnd-kit/collision';
import { isWidget } from "../utils/helpers.js";
import { AppContext } from "../AppContext.js";
import Well from "./Well";


function WidgetWellWrapper({ idx, placedAnalyses }) {
    const { presenter, anchor } = useContext(AppContext);
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
    });

    const onWellClick = () => {
        if (ruleEval) {
            presenter.setNextAction(presenter.placeAnalyses.bind(presenter));
            presenter.setNextAssignments([{ uid: anchor, wellIdx: idx }]);
            presenter.doNextAction();
        }
    };

    return <Well idx={idx} onWellClick={onWellClick} placedAnalyses={placedAnalyses} isAssignable={ruleEval} />;
}

function AppWellWrapper({ idx, isSelectable, isSelected, placedAnalyses, prepositionedItems, selectedAnalyses }) {
    const { presenter } = useContext(AppContext);
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

    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        setShowOverlay(Object.keys(prepositionedItems || {}).length > 0);
    }, [prepositionedItems]);

    const onWellClick = () => {
        const hasNotSelected = !placedAnalyses.every(analysis => selectedAnalyses.includes(analysis.uid));
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
            showOverlay={ showOverlay} 
            prepositionedItems={prepositionedItems}
            prepositionMode={presenter.getPrepositionMode()}
            placedAnalyses={placedAnalyses}
            fieldConfig={fieldConfig}
            ref={node => {
                setDroppableNodeRef(node);
                setDraggableNodeRef(node);
            }}
        >
            {placedAnalyses.map((analysis) => (
                <div
                    key={analysis.uid}
                    className={`well-analyses-list-item ${selectedAnalyses.includes(analysis.uid) ? 'well-analyses-list-item--selected' : ''}`}
                    onClick={(e) => onAnalysisClick(e, analysis.uid)}
                >
                    {Object.entries(analysis).map(([key, value]) => {
                        if (key === 'uid' || !fieldConfig || !fieldConfig[key]?.display_mode.includes('well')) return '';
                        return value
                    }).join(' ').trim()}
                </div>
            ))}
        </Well>
    )
}

function WellWrapper({ idx }) {
    const { presenter, mode } = useContext(AppContext);
    const wellData = useSyncExternalStore((listener) => presenter.subscribeWell(idx, listener), () => presenter.getWellDataSnapshot(idx));

    return isWidget(mode) ?
        <WidgetWellWrapper
            idx={idx}
            placedAnalyses={wellData.placedAnalyses} />
        :
        <AppWellWrapper idx={idx} {...wellData} />;
    ;
}

export default WellWrapper;
