import { useContext, useRef, useState } from 'react';
import { boxesIntersect, useSelectionContainer } from '@air/react-drag-to-select';
import { AppContext } from './Layout.jsx';
import { WorksheetPresenterContext } from '../App.jsx';
import { isWidget } from '../utils/helpers.js';
import Label from './Label';
import WellWrapper from "./WellWraper";
import { useSelectAllShortcut, useDeleteAndBackspace } from '../utils/hooks.jsx';



function WellsBlock({ rowsCount, colsCount }) {
    return (
        <>
            {
                Array.from({ length: (rowsCount + 1) * (colsCount + 1) }, (_, i) => {
                    const row = Math.floor(i / (colsCount + 1));
                    const col = i % (colsCount + 1);
                    const idx = (row - 1) * colsCount + col
                    if (row === 0 && col === 0) { return <div className="label empty-cell" key={0} />; }
                    if (row === 0 || col === 0) { return <Label row={row} col={col} key={-10000 * i} />; }
                    return <WellWrapper idx={idx} key={idx} />;
                })
            }
        </>
    )
}

function AppPlateView({ children , ref, onFocus, isActive }) {
    const presenter = useContext(WorksheetPresenterContext);
    const [, setSelectionBox] = useState({});
    const selectableItems = useRef([]);

    if (ref?.current) {
        selectableItems.current = [];
        Array.from(ref.current.children)
            .filter(element => element.classList.contains("element"))
            .forEach((item) => {
                const { left, top, width, height } = item.getBoundingClientRect();
                selectableItems.current.push({ left, top, width, height, });
            });
    }

    useSelectAllShortcut(() => isActive &&  presenter.selectAllNonEmptyWells())
    useDeleteAndBackspace(() => isActive && presenter.cleanSelectedWells() );

    
    const { DragSelection } = useSelectionContainer(
        {
            eventsElement: document.getElementById('elements-container'),
            onSelectionChange: (box) => {
                setSelectionBox({ ...box });
                const indexesToSelect = new Set();
                selectableItems.current.forEach((item, index) => {
                    if (boxesIntersect(box, item)) {
                        indexesToSelect.add(index + 1);
                    }
                });
                presenter.setSelectedWells(
                    indexesToSelect.intersection(
                        new Set(presenter.getWellIdsWithAnalyses())));
            },
            onSelectionStart: () => {
                presenter.setSelectedWells([]);
            },
            shouldStartSelecting: (target) => {
                return !target.classList.contains('well-inner');
            },

        }
    );

    return (
        <div className="plate-container-wrapper" onFocus={onFocus} tabIndex={0}>
            <DragSelection />
            <div id="elements-container" className="plate-container" ref={ref} >
                {children}
            </div>
        </div>
    );
}


function WidgetPlateView({ children }) {
    return (
        <div className="plate-container">
            {children}
        </div>
    )
}

function PlateView({ref, onFocus, isActive}) {
    const { mode } = useContext(AppContext);
    const presenter = useContext(WorksheetPresenterContext);
    const { rowsCount, colsCount } = presenter.model;

    const BlockWrapper = isWidget(mode) ? WidgetPlateView : AppPlateView;

    return (
        <BlockWrapper ref={ref} onFocus={onFocus} isActive={isActive}>
            <WellsBlock rowsCount={rowsCount} colsCount={colsCount} />
        </BlockWrapper>
    )
}

export default PlateView;
