import { useContext, useEffect } from "react";
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { isWidget } from "../utils/helpers.js";
import { WorksheetPresenterContext } from '../App.jsx';
import { AppContext } from "./Layout.jsx";
import Well from "./Well";


function WidgetWellWrapper({ idx }) {
    const presenter = useContext(WorksheetPresenterContext);
    const hasAnalyses = presenter.getWellIdsWithAnalyses()?.includes(idx);
    const onWellClick = () => {
        if (presenter.getNextAssignments().length == 1) {
            const assigmnet = { ...presenter.getNextAssignments()[0], wellIdx: idx };
            presenter.doNextAction([assigmnet]);
        }
    }

    return <Well idx={idx} onWellClick={onWellClick} hasAnalyses={hasAnalyses} />;
}

function AppWellWrapper({ idx }) {
    const presenter = useContext(WorksheetPresenterContext);
    const { isDragging, currentPreposition, shiftHeld } = useContext(AppContext);
    const isSelectable = presenter.getWellIdsWithAnalyses()?.includes(idx);
    const isSelected = presenter.getSelectedWellsForView()?.has(idx);
    const hasAnalyses = presenter.getWellIdsWithAnalyses()?.includes(idx);
    const isDroppable = !isSelectable;
    const isPrepositioned = Object.values(currentPreposition).includes(idx);

    const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform } = useDraggable({
        id: idx,
        disabled: !isSelected,
        data: { type: 'well', idx },
    });

    const { setNodeRef: setDroppableNodeRef } = useDroppable({
        id: idx,
        disabled: !isDroppable,
    });

    const onWellClick = () => {
        if (isSelectable && !shiftHeld) presenter.setSelectedWells([idx]);
        if (isSelectable && shiftHeld) presenter.selectWell(idx);
        if (isSelected && shiftHeld) presenter.deselectWell(idx);
        if (!isSelectable) presenter.setSelectedWells();
    }

    return (
        <Well
            idx={idx}
            onWellClick={onWellClick}
            hasAnalyses={hasAnalyses}
            isSelected={isSelected}
            isDroppable={isDroppable}
            isDragging={isDragging}
            isPrepositioned={isPrepositioned}
            ref={node => {
                setDraggableNodeRef(node);
                setDroppableNodeRef(node);
            }}
            listeners={listeners}
            attributes={attributes}
        />
    )
}

function WellWrapper({ idx }) {
    const { mode } = useContext(AppContext);
    return isWidget(mode) ? <WidgetWellWrapper idx={idx} /> : <AppWellWrapper idx={idx} />;
}

export default WellWrapper;
