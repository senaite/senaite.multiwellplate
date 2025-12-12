import { useState } from 'react';
import { isOpen, isWidget } from '../utils/helpers';

function AppControls({ onClose, toggleAppMode, mode }) {
    const [isHoveringControls, setIsHoveringControls] = useState(false);

    return (
        <div
            className="title-bar"
            onMouseEnter={() => setIsHoveringControls(true)}
            onMouseLeave={() => setIsHoveringControls(false)}
        >
            <div className="traffic-lights">

                <button
                    onClick={onClose}
                    className="traffic-light traffic-light-close"
                    aria-label="Close"
                >
                    {isHoveringControls && (
                        <svg
                            className="traffic-light-icon icon-close"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    )}
                </button>
                <button
                    onClick={toggleAppMode}
                    className="traffic-light traffic-light-fullscreen"
                    aria-label="Fullscreen"
                >
                    <svg
                        className="traffic-light-icon icon-fullscreen"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isOpen(mode) && !isWidget(mode) ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 9L4 4m0 0v5m0-5h5m5 11l5 5m0 0v-5m0 5h-5"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                            />
                        )}
                    </svg>
                </button>
            </div>
            <div className="plate-title">
                <h2>Multiwell Plate</h2>
            </div>

            {/* Spacer for centering */}
            <div className="title-spacer"></div>
        </div>
    );

}

export default AppControls;
