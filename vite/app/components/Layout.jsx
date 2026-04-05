import { createContext, useContext, useRef, useState } from 'react';
import { WorksheetPresenterContext } from '../App.jsx';
import {
    DEFAULT_LAYOUT_MODE,
    APP_LAYOUT_MODE, WIDGET_LAYOUT_MODE, HIDDEN_LAYOUT_MODE
} from '../config.js';
import AppControls from './AppControls.jsx';
import WellsBlock from './WellsBlock.jsx';
import Workspace from './Workspace.jsx';
import { useClickOutsideRef, useEscape, useAnchorClick } from '../utils/hooks.jsx';
import { isWidget, isOpen, isContainered } from '../utils/helpers.js'

export const AppContext = createContext({})


function Layout({ startMode }) {
    const presenter = useContext(WorksheetPresenterContext);
    const [mode, setMode] = useState(startMode || DEFAULT_LAYOUT_MODE);
    const [anchor, setAnchor] = useState(null);
    const containerRef = useRef(null);

    const toggleAppMode = () => {
        const nextMode = isWidget(mode) ? APP_LAYOUT_MODE : WIDGET_LAYOUT_MODE;
        presenter.deselectAllWells();
        setMode(nextMode);
    };

    const onClose = () => {
        setMode(HIDDEN_LAYOUT_MODE);
        setAnchor(null);
        presenter.deselectAllWells();
    }

    const onEscape = () => {
        if (isOpen(mode) && !isContainered(mode)) onClose();
    }

    const onAnchorClick = (event) => {
        setAnchor(event.detail.uid);
        setMode(WIDGET_LAYOUT_MODE);
    }

    useAnchorClick(onAnchorClick);
    useClickOutsideRef(containerRef, !isContainered(mode) ? onClose : () => { });
    useEscape(onEscape);

    const { rowsCount, colsCount } = presenter.model;
    const layoutClass = mode === 'hidden' ? 'layout-default' : `layout-${mode}`;
    const mainClass = mode === 'app' ? 'main main--fullscreen' : 'main';
    const layoutStyle = {
        '--rows': rowsCount, '--cols': colsCount,
        ...(anchor && { positionAnchor: `--${anchor}` })
    };

    const appContext = { mode, anchor};


    return (
        isOpen(mode) && (
            <AppContext.Provider value={appContext}>
                <div className={`layout ${layoutClass}`} style={layoutStyle} ref={containerRef}>
                    <div className={mainClass}>
                        {!isContainered(mode) &&
                            <AppControls title={presenter.getWorksheetId()} onClose={onClose} toggleAppMode={toggleAppMode} mode={mode} />
                        }
                        {isWidget(mode) ?
                            <>
                                <div className="plate-container widget">
                                    <WellsBlock rowsCount={rowsCount} colsCount={colsCount} />
                                </div>
                            </>
                            : <Workspace rowsCount={rowsCount} colsCount={colsCount} />}
                    </div>
                </div>
            </AppContext.Provider>
        ));
}

export default Layout;