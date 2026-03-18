import { useState, useRef, useEffect } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { move } from '@dnd-kit/helpers';
import { useClickOutside } from '../../utils/hooks';


function Sortable({ id, index, children }) {
    const { ref, handleRef } = useSortable({ id, index, modifiers: [RestrictToVerticalAxis], });

    return (
        <div ref={ref} className="msd-item">
            {children}
            <span ref={handleRef} className="msd-handle">
                <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                    <circle cx="3" cy="2" r="1.2" />
                    <circle cx="7" cy="2" r="1.2" />
                    <circle cx="3" cy="6.5" r="1.2" />
                    <circle cx="7" cy="6.5" r="1.2" />
                    <circle cx="3" cy="11" r="1.2" />
                    <circle cx="7" cy="11" r="1.2" />
                </svg>
            </span>
        </div>)
}

function MultiSelectDropdown({ options, value = [], onChange, placeholder = 'None' }) {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef(null);
    const [selectedValues, setSelectedValues] = useState(value);

    const unselectedValues = options.map(o => o.value).filter(v => !selectedValues.includes(v));

    useClickOutside((event) => {
        if (!isOpen) return;
        if (rootRef.current && !rootRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    });

    const toggleItem = (val) => {
        if (selectedValues.includes(val)) {
            setSelectedValues(selectedValues.filter(v => v !== val));
        } else {
            setSelectedValues([...selectedValues, val]);
        }
    };

    const onDragEnd = (event) => setSelectedValues((prev) => move(prev, event));

    useEffect(() => onChange(selectedValues), [selectedValues]);

    const getTriggerText = () => {
        if (!selectedValues.length) return placeholder;
        const firstName = options.find(o => o.value === selectedValues[0])?.label ?? selectedValues[0];
        if (selectedValues.length === 1) return firstName;
        return `${firstName} +${selectedValues.length - 1}`;
    };

    return (
        <div className="msd-wrapper" ref={rootRef}>
            <button
                type="button"
                className={`msd-trigger${isOpen ? ' msd-trigger--open' : ''}${selectedValues.length ? ' msd-trigger--active' : ''}`}
                onClick={() => setIsOpen(v => !v)}
            >
                <span className="msd-trigger-text">{getTriggerText()}</span>
                {selectedValues.length > 0 && (
                    <span className="msd-count">{selectedValues.length}</span>
                )}
                <svg
                    className={`msd-chevron${isOpen ? ' msd-chevron--open' : ''}`}
                    width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="msd-panel">

                    {/* ── Selected items (draggable, ordered) ── */}
                    {selectedValues.length > 0 && (
                        <DragDropProvider onDragEnd={onDragEnd}>

                            {selectedValues.map((val, idx) => {
                                const opt = options.find(o => o.value === val);
                                return (
                                    <Sortable key={val} id={val} index={idx}>

                                        <input
                                            type="checkbox"
                                            id={`msd-${val}`}
                                            className="msd-checkbox"
                                            checked
                                            onChange={() => toggleItem(val)}
                                        />
                                        <label htmlFor={`msd-${val}`} className="msd-label">
                                            {opt?.label ?? val}
                                        </label>

                                    </Sortable>
                                );
                            })}
                        </DragDropProvider>
                    )}

                    {/* Separator between selected / unselected sections */}
                    {selectedValues.length > 0 && unselectedValues.length > 0 && (
                        <div className="msd-sep" />
                    )}

                    {/* ── Unselected items ── */}
                    {unselectedValues.map(val => {
                        const opt = options.find(o => o.value === val);
                        return (
                            <div key={val} className="msd-item">

                                <input
                                    type="checkbox"
                                    id={`msd-${val}`}
                                    className="msd-checkbox"
                                    checked={false}
                                    onChange={() => toggleItem(val)}
                                />
                                <label htmlFor={`msd-${val}`} className="msd-label">
                                    {opt?.label ?? val}
                                </label>
                            </div>
                        );
                    })}

                    {options.length === 0 && (
                        <div className="msd-empty">No fields available</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MultiSelectDropdown;
