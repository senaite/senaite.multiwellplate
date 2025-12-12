import { createContext, useContext, useRef, useState } from 'react';
import { WorksheetPresenterContext } from '../App.jsx';
import {
    DEFAULT_LAYOUT_MODE,
    DEFAULT_PREPOSITION_MODE,
    APP_LAYOUT_MODE, WIDGET_LAYOUT_MODE, HIDDEN_LAYOUT_MODE
} from '../config.js';
import AppControls from './AppControls.jsx';
import Workspace from './Workspace.jsx';
import { useClickOutsideRef, useShiftState, useEscape, useAnchorClick } from '../utils/hooks.jsx';
import { isWidget, isOpen, isContainered } from '../utils/helpers.js'

export const AppContext = createContext({})


function Layout( {startMode} ) {
    const presenter = useContext(WorksheetPresenterContext);
    const [mode, setMode] = useState(startMode || DEFAULT_LAYOUT_MODE);
    const [anchor, setAnchor] = useState(null);
    const containerRef = useRef(null);
    const [shiftHeld, setShiftHeld] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [currentPreposition, setCurrentPreposition] = useState({});
    const [prepositionMode, setPrepositionMode] = useState(DEFAULT_PREPOSITION_MODE);

    const toggleAppMode = () => {
        const nextMode = isWidget(mode) ? APP_LAYOUT_MODE : WIDGET_LAYOUT_MODE;
        presenter.deselectAllWells();
        if (nextMode === WIDGET_LAYOUT_MODE && !presenter.getNextAction()) {
            setMode(HIDDEN_LAYOUT_MODE);
        } else {
            setMode(nextMode);
        }
    };

    const onClose = () => {
        setMode(HIDDEN_LAYOUT_MODE);
        setAnchor(null);
        presenter.deselectAllWells();
        presenter.cleanNextActionsUids();
    }

    const onEscape = () => {
        if (isOpen(mode) && !isContainered(mode)) onClose();
    }

    const onAnchorClick = (event) => {
        setAnchor(`--${event.detail.uid}`);
        presenter.setNextAction(presenter.assignAnalyses.bind(presenter));
        presenter.setNextAssignments([{ uid: event.detail.uid, wellIdx: null }]);
        setMode(WIDGET_LAYOUT_MODE);
    }

    useAnchorClick(onAnchorClick);
    useClickOutsideRef(containerRef, onClose);
    useShiftState(setShiftHeld);
    useEscape(onEscape);

    const layoutClass = mode === 'hidden' ? 'layout-default' : `layout-${mode}`;
    const layoutStyle = {
        '--rows': presenter.model.rowsCount, '--cols': presenter.model.colsCount,
        ...(anchor && { positionAnchor: anchor })
    };

    const appContext = {
        mode, shiftHeld, isDragging, setIsDragging, currentPreposition, setCurrentPreposition,
        prepositionMode, setPrepositionMode
    };

    return (
        isOpen(mode) && (
            <AppContext.Provider value={appContext}>
                <div className={layoutClass} style={layoutStyle} ref={containerRef}>
                    <div className="main">
                        {!isContainered(mode) &&
                            <AppControls onClose={onClose} toggleAppMode={toggleAppMode} mode={mode} />
                        }
                        <Workspace mode={mode} />
                    </div>
                </div>
            </AppContext.Provider>
        ));
}

export default Layout;