import { useContext, useRef, useState } from "react";
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { SnapCenterToCursor } from "../utils/snapcentermodifier.js";
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom';
import { boxesIntersect, useSelectionContainer } from '@air/react-drag-to-select';
import { AppContext } from "./Layout.jsx";
import { WorksheetPresenterContext } from '../App.jsx';
import { PlateTools } from "./PlateToolbar/PlateTools.jsx";
import WellsBlock from "./WellsBlock.jsx";
import UnplatedAnalysesList from "./UnplatedAnalysesList.jsx";
import PlatedAnalysesList from "./PlatedAnalysesList.jsx";
import { useClickOutside, useDeleteAndBackspace, useSelectAllShortcut, useShiftState } from '../utils/hooks.jsx';



function DragSelectionZone({ presenter, platePanelRef, shiftKeyRef }) {
    const [shiftKeyState, setShiftKeyState] = useState(false);
    const selectableItems = useRef([]);

    useShiftState((val) => {
        setShiftKeyState(val);
        shiftKeyRef.current = val;
    });

    const { DragSelection } = useSelectionContainer({
        selectionProps: {
            style: {
                border: '1px solid #4C85D8',
                background: 'rgba(155, 193, 239, 0.4)',
                opacity: 0.5,
                zIndex: 500,
            },
        },
        isEnabled: shiftKeyState,
        eventsElement: document.getElementById('elements-container'),
        onSelectionChange: (box) => {
            const intersecting = [];
            selectableItems.current.forEach((item, index) => {
                if (boxesIntersect(box, item)) intersecting.push(index + 1);
            });
            const uids = presenter.getAnalysesUidsByWellIndices(intersecting);
            presenter.setSelectedAnalyses(uids);
        },
        onSelectionStart: () => {
            presenter.setSelectedAnalyses([]);
            if (platePanelRef?.current) {
                selectableItems.current = Array.from(platePanelRef.current.children)
                    .filter(el => el.classList.contains("element"))
                    .map(el => el.getBoundingClientRect());
            }
        },
    });

    return <DragSelection />;
}


function Workspace({ rowsCount, colsCount }) {
    const presenter = useContext(WorksheetPresenterContext);
    const plateToolsRef = useRef(null);
    const platePanelRef = useRef(null);
    const sideListPanelRef = useRef(null);
    const sideDrawerPanelRef = useRef(null);
    const activePanel = useRef('list');
    const shiftKeyRef = useRef(false);

    const sensors = [
        PointerSensor.configure({
            activationConstraints: [
                new PointerActivationConstraints.Distance({ value: 5 }),
            ],
        }),
    ];

    const onBeforeDragStart = (event, manager) => {
        if (shiftKeyRef.current) {
            event.preventDefault();
        }
    }

    const onDragStart = (event, manager) => {
        presenter.setNextAction(presenter.assignAnalyses.bind(presenter));
        presenter.setNextAssignments(
            presenter.getSelectedAnalyses().map(uid => ({ uid, wellIdx: presenter.findWellIdxByUid(uid) }))
        );
    };

    const onDragOver = (event, manager) => {

        if (!event.operation.target) {
            presenter.setCurrentPreposition({});
            return;
        };
        const mode = event.operation.source.data.type !== 'well' ? presenter.getPrepositionMode() : 'shift';

        async function doEval() {
            return presenter.getPrepositionedAnalyses({
                targetPos: event.operation.target.id,
                initialPos: event.operation.source.data.idx,
                uidList: presenter.getNextAssignments(),
                prepositionMode: mode,
            });
        };

        doEval().then((prepositioned) => {
            presenter.setCurrentPreposition(prepositioned);
        });
    };

    const onDragEnd = (event, manager) => {
        if (event.operation.target) {
            presenter.setNextAssignments(Object.entries(presenter.getCurrentPreposition()).map(([uid, wellIdx]) => ({ uid, wellIdx })));
            presenter.doNextAction()
        }
        presenter.setCurrentPreposition({});
        presenter.afterDragCleanUp();
    };

    useClickOutside((event) => {
        if (plateToolsRef.current && plateToolsRef.current.contains(event.target)) return;
        if ((activePanel.current === 'plate' && !platePanelRef.current.contains(event.target)) ||
            (activePanel.current === 'list' && !sideListPanelRef.current.contains(event.target)) ||
            (activePanel.current === 'drawer' && !sideDrawerPanelRef.current.contains(event.target)))
            presenter.setSelectedAnalyses([]);
    });

    useSelectAllShortcut(() => {
        if (activePanel.current === "list") {
            sideListPanelRef.current.handleSelectAll();
            return;
        }
        if (activePanel.current === "drawer") {
            sideDrawerPanelRef.current.handleSelectAll();
            return;
        }
        presenter.selectMany(presenter.getAssignedAnalysesUids());
    })

    useDeleteAndBackspace(() => (activePanel.current === "plate" || activePanel.current === "drawer") && presenter.unassignSelected());


    const handleSelection = (uids) => presenter.selectMany(Array.isArray(uids) ? uids : [uids]);
    const handleDeselection = (uids) => presenter.deselectMany(Array.isArray(uids) ? uids : [uids]);

    return (
        <DragDropProvider
            sensors={sensors}
            modifiers={[SnapCenterToCursor]}
            onBeforeDragStart={onBeforeDragStart}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="workspace">
                <div className="workspace-unassigned" onFocus={() => activePanel.current = 'list'} tabIndex={0}>
                    <UnplatedAnalysesList
                        ref={sideListPanelRef}
                        handleSelection={handleSelection}
                        handleDeselection={handleDeselection}
                    />
                </div>
                <div className="workspace-plate" onFocus={() => activePanel.current = 'plate'} tabIndex={0}>
                    <PlateTools ref={plateToolsRef} />
                    <div className="plate-container-wrapper">
                        <DragSelectionZone presenter={presenter} platePanelRef={platePanelRef} shiftKeyRef={shiftKeyRef} />
                        <div id="elements-container" className="plate-container" ref={platePanelRef} >
                            <WellsBlock rowsCount={rowsCount} colsCount={colsCount} />
                        </div>
                    </div>
                </div>
                <div className="workspace-assigned" onFocus={() => activePanel.current = 'drawer'} tabIndex={0}>
                    <PlatedAnalysesList
                        ref={sideDrawerPanelRef}
                        handleSelection={handleSelection}
                        handleDeselection={handleDeselection}
                    />
                </div>
            </div>
            <DragOverlay className="drag-overlay-pointer" />
        </DragDropProvider >
    );
}


export default Workspace;
