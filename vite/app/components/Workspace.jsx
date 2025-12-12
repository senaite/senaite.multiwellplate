import { useContext, useRef } from "react";
import {
    DragOverlay,
    DndContext,
    PointerSensor, pointerWithin,
    useDndMonitor, useSensor, useSensors
} from '@dnd-kit/core';
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { AppContext } from "./Layout.jsx";
import { WorksheetPresenterContext } from '../App.jsx';
import { isWidget } from "../utils/helpers.js";
import { useClickOutside } from "../utils/hooks.jsx";
import { PlateTools } from "./Toolbar.jsx";
import PlateView from "./PlateView.jsx";
import SideList from "./SideList.jsx";
import SideDrawer from "./SideDrawer.jsx";


function DndController({ platePanelRef }) {
    const presenter = useContext(WorksheetPresenterContext);
    const { isDragging, setIsDragging,
        currentPreposition, setCurrentPreposition, prepositionMode
    } = useContext(AppContext);

    useDndMonitor({
        onDragStart(event) {
            const dragOpType = event.active.data.current?.type;
            presenter.setNextAction(presenter.assignAnalyses.bind(presenter));
            presenter.setNextAssignments(
                dragOpType === 'unassigned' ?
                    presenter.getSelectedUnassigned().map(uid => ({ uid, wellIdx: null }))
                    :
                    Array.from(
                        presenter.getSelectedWellsForView()).map(wellIdx => {
                            const uid = presenter.findUidByWellIdx(wellIdx);
                            return { uid, wellIdx };
                        }));
            setIsDragging(dragOpType || true);
        },
        onDragMove(event) {
            if (!event.over
                && !platePanelRef.current.contains(event.target)
                && Object.keys(currentPreposition).length > 0) {
                setCurrentPreposition({});
            }
        },
        onDragOver(event) {
            if (event.over?.id) {
                const mode = isDragging === 'unassigned' ? prepositionMode : 'shift';
                setCurrentPreposition(presenter.getPrepositionedAnalyses(
                    {
                        targetPos: event.over.id,
                        initialPos: event.active.data.current?.idx,
                        uidList: presenter.getNextAssignments(),
                        prepositionMode: mode,
                    }));
            }
        },
        onDragEnd(event) {
            if (event.over?.id) {
                presenter.setNextAssignments(Object.entries(currentPreposition).map(([uid, wellIdx]) => ({ uid, wellIdx })));
                presenter.doNextAction()
                presenter.afterDragCleanUp();
            }
            setIsDragging(false);
            setCurrentPreposition({});
            presenter.afterDragCleanUp();
        },
        onDragCancel(event) { console.log('drag cancel', event); },
    });

    return (
        <DragOverlay zIndex={100} className="dnd-overlay--dragging" />
    )
}

function AppWorkspace() {
    const presenter = useContext(WorksheetPresenterContext);
    const plateToolsRef = useRef(null);
    const platePanelRef = useRef(null);
    const sideListPanelRef = useRef(null);
    const activePanel = useRef('list');

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useClickOutside((event) => {
        if (plateToolsRef.current && plateToolsRef.current.contains(event.target)) return;
        if (!platePanelRef.current.contains(event.target)) presenter.deselectAllWells();
        if (!sideListPanelRef.current.contains(event.target)) presenter.setSelectedUnassigned([]);
    });

    return (
        <DndContext sensors={sensors} collisionDetection={pointerWithin} modifiers={[snapCenterToCursor]}>
            <DndController platePanelRef={platePanelRef} sideListPanelRef={sideListPanelRef} />
            <SideList ref={sideListPanelRef} onFocus={() => activePanel.current = 'list'} isActive={activePanel.current === 'list'} />
            <div className="panel center">
                <PlateTools ref={plateToolsRef} />
                <PlateView ref={platePanelRef} onFocus={() => activePanel.current = 'plate'} isActive={activePanel.current === 'plate'} />
            </div>
            <SideDrawer />
        </DndContext>
    );
}


function Workspace({ mode }) {

    return (
        <div className="workspace">
            {isWidget(mode) ? <PlateView /> : <AppWorkspace />}
        </div>
    );

}

export default Workspace;
