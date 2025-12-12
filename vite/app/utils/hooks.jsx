import { useEffect } from 'react';


export const useClickOutsideRef = (ref, handleOnClickOutside) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handleOnClickOutside(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handleOnClickOutside]);
}

export const useClickOutside = (handleOnClickOutside) => {
    useEffect(() => {
        const listener = (event) => {
            handleOnClickOutside(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [handleOnClickOutside]);
}


export const useSelectAllShortcut = (handleSelectAllShortcut) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
                    handleSelectAllShortcut(event);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSelectAllShortcut]);
}

export const useShiftState = (handleShift) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Shift') {
                handleShift(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'Shift') {
                handleShift(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleShift]);
}


export const useEscape = (onEscape) => {
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') onEscape();
        };

        window.addEventListener('keydown', handleEscape);

        return () => { window.removeEventListener('keydown', handleEscape); };
    }, [onEscape]);
}


export const useDeleteAndBackspace = (handleDeleteAndBackspace) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Backspace' || e.key === 'Delete') handleDeleteAndBackspace();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDeleteAndBackspace]);
}


export const useAnchorClick = (onAnchorClick) => {
        useEffect(() => {
        const handleAnchorClick = (event) => {
            onAnchorClick(event);
        };

        document.addEventListener('senaite:multiwellplate:anchor-item-click', handleAnchorClick);

        return () => {
            document.removeEventListener('senaite:multiwellplate:anchor-item-click', handleAnchorClick);
        };
    }, [onAnchorClick]);
}
