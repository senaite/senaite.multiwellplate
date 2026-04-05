import { isOpen, isWidget } from '../utils/helpers';

function AppControls({ title, onClose, toggleAppMode, mode }) {
    const isWidgetMode = isWidget(mode);
    const isAppMode = isOpen(mode) && !isWidget(mode);

    return (
        <div className={`top-bar ${isWidgetMode ? 'top-bar--widget' : ''}`}>
            <div className="app-controls-left">
                <button
                    onClick={onClose}
                    className="control-button control-button--close"
                    aria-label="Close"
                    title="Close"
                >
                    <svg className="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <button
                    onClick={toggleAppMode}
                    className="control-button control-button--expand"
                    aria-label={isAppMode ? "Minimize" : "Expand"}
                    title={isAppMode ? "Minimize" : "Expand"}
                >
                    <svg className="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isAppMode ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5m5 11l5 5m0 0v-5m0 5h-5" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        )}
                    </svg>
                </button>
            </div>

            <div className="plate-title">
                <h2>{ title }</h2>
            </div>

            <div className="app-controls-right">
                {/* Spacer for symmetry */}
            </div>
        </div>
    );
}

export default AppControls;
