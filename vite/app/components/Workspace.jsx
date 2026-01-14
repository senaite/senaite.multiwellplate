import { useContext, useEffect, useRef, useState } from "react";
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { SnapCenterToCursor } from "../utils/snapcentermodifier.js";
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom';
import { boxesIntersect, useSelectionContainer } from '@air/react-drag-to-select';
import { AppContext } from "./Layout.jsx";
import { WorksheetPresenterContext } from '../App.jsx';
import { PlateTools } from "./Controls/PlateTools.jsx";
import WellsBlock from "./WellsBlock.jsx";
import SideList from "./SideList.jsx";
import SideDrawer from "./SideDrawer.jsx";
import { useClickOutside, useDeleteAndBackspace, useSelectAllShortcut, useShiftState } from '../utils/hooks.jsx';


function Workspace({ rowsCount, colsCount }) {
    const presenter = useContext(WorksheetPresenterContext);
    const { isDragging } = useContext(AppContext);
    const plateToolsRef = useRef(null);
    const platePanelRef = useRef(null);
    const sideListPanelRef = useRef(null);
    const activePanel = useRef('list');
    const [, setSelectionBox] = useState({});
    const selectableItems = useRef([]);
    const [shiftKeyState, setShiftKeyState] = useState(false);

    const sensors = [
        PointerSensor.configure({
            activationConstraints: [
                new PointerActivationConstraints.Distance({ value: 5 }),
            ],
        }),
    ];

    const onBeforeDragStart = (event, manager) => {
        if (shiftKeyState) {
            event.preventDefault();
        }
    }

    const onDragStart = (event, manager) => {
        const dragOpType = event.operation.source.data.type;
        presenter.setNextAction(presenter.assignAnalyses.bind(presenter));
        presenter.setNextAssignments(
            presenter.getSelectedAnalyses().map(uid => ({ uid, wellIdx: presenter.findWellIdxByUid(uid) }))
        );
        isDragging.current = dragOpType || true;
    };

    const onDragOver = (event, manager) => {
        if (!event.operation.target) {
            presenter.setCurrentPreposition({});
            return;
        };
        const mode = event.operation.source.data.type !== 'well' ? presenter.getPrepositionMode() : 'shift';
        presenter.getPrepositionedAnalyses({
            targetPos: event.operation.target.id,
            initialPos: event.operation.source.data.idx,
            uidList: presenter.getNextAssignments(),
            prepositionMode: mode,
        }).then((prepositioned) => presenter.setCurrentPreposition(prepositioned));
    };

    const onDragEnd = (event, manager) => {
        if (event.operation.target) {
            presenter.setNextAssignments(Object.entries(presenter.getCurrentPreposition()).map(([uid, wellIdx]) => ({ uid, wellIdx })));
            presenter.doNextAction()
        }
        isDragging.current = false;
        presenter.setCurrentPreposition({});
        presenter.afterDragCleanUp();
    };

    useClickOutside((event) => {
        if (plateToolsRef.current && plateToolsRef.current.contains(event.target)) return;
        if ((activePanel.current === 'plate' && !platePanelRef.current.contains(event.target)) ||
            (activePanel.current === 'list' && !sideListPanelRef.current.contains(event.target)))
            presenter.setSelectedAnalyses([]);
    });

    useSelectAllShortcut(() => {
        if (activePanel.current === "plate") {
            presenter.selectAllNonEmptyWells();
            return;
        } else {
            presenter.selectAllUnassignedAnalyses();
        }
    })

    useDeleteAndBackspace(() => (activePanel.current === "plate") && presenter.unassignSelected());

    useShiftState(setShiftKeyState);

    useEffect(() => {
        if (platePanelRef?.current) {
            selectableItems.current = [];
            Array.from(platePanelRef.current.children)
                .filter(element => element.classList.contains("element"))
                .forEach((item) => {
                    const { left, top, width, height } = item.getBoundingClientRect();
                    selectableItems.current.push({ left, top, width, height, });
                });
        }
    }, []);

    const { DragSelection } = useSelectionContainer(
        {
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
                setSelectionBox({ ...box });
                selectableItems.current.forEach((item, index) => {
                    if (boxesIntersect(box, item)) {
                        presenter.selectWell(index + 1)
                    }
                });
            },
            onSelectionStart: () => {
                presenter.setSelectedAnalyses([]);
            },

        }
    );

    return (
        <DragDropProvider
            sensors={sensors}
            modifiers={[SnapCenterToCursor]}
            onBeforeDragStart={onBeforeDragStart}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="workspace-sidelist">
                <SideList ref={sideListPanelRef} onFocus={() => activePanel.current = 'list'} />
            </div>
            <div className="workspace-plate">
                <PlateTools ref={plateToolsRef} />
                <div className="plate-container-wrapper" onFocus={() => activePanel.current = 'plate'} tabIndex={0}>
                    <DragSelection />
                    <div id="elements-container" className="plate-container" ref={platePanelRef} >
                        <WellsBlock rowsCount={rowsCount} colsCount={colsCount} />
                    </div>
                </div>
            </div>
            <div className="workspace-sidedrawer">
                <SideDrawer />
            </div>
            <DragOverlay className="drag-overlay-pointer" />
        </DragDropProvider >
    );
}


export default Workspace;
