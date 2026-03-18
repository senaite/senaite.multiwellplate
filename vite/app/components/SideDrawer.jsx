import { useContext, useEffect, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { WorksheetPresenterContext } from '../App.jsx';
import SideDrawerDraggableItem from './SideDrawerDraggableItem.jsx';
import MultiSelectDropdown from './Controls/MultiSelectDropdown.jsx';
import { pipe } from '../core/helpers/utilities.js';



function wellLabel(wellIdx, colsCount) {
    const row = Math.floor((wellIdx - 1) / colsCount) + 1;
    const col = ((wellIdx - 1) % colsCount) + 1;
    return String.fromCharCode(64 + row) + col;
}


function SideDrawer({ ref, handleSelection, handleDeselection }) {

    const domRef = useRef(null);

    const presenter = useContext(WorksheetPresenterContext);
    const analysesList = useSyncExternalStore(presenter.subscribeAssigned, () => presenter.getAssignedListSnapshot());

    const { fields: fieldConfig, colsCount } = presenter.getConfig();

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        analyses: {
            groupBy: [],
            sortBy: [],
            sortOrder: 'asc',
        },
    });

    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const searchResultSet = useMemo(
        () => new Set(presenter.search(debouncedSearch)),
        [debouncedSearch, analysesList]
    );

    const assignedList = useMemo(
        () => Object.entries(analysesList).map(([uid, item]) => ({ uid, ...item })),
        [analysesList]
    );

    const filteredItems = useMemo(
        () => assignedList.filter(item => searchResultSet.has(item.uid)),
        [assignedList, searchResultSet]
    );

    const sortItems = (items) => {
        if (!filters.analyses.sortBy.length) return items;
        return [...items].sort((a, b) => {
            for (const field of filters.analyses.sortBy) {
                const aVal = (a.data[field] ?? '').toString();
                const bVal = (b.data[field] ?? '').toString();
                const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
                if (cmp !== 0) return filters.analyses.sortOrder === 'asc' ? cmp : -cmp;
            }
            return 0;
        });
    };

    const groupItems = (items) => {
        const groups = new Map();

        if (!filters.analyses.groupBy.length) {
            return groups.set('[]', items);
        }

        items.forEach(item => {
            const key = filters.analyses.groupBy.flatMap(field => item.data[field] ?? 'Ungrouped');
            const keyStr = JSON.stringify(key);
            if (!groups.has(keyStr)) groups.set(keyStr, []);
            groups.get(keyStr).push(item);
        });

        return groups;
    };

    const sortGroups = (groupedItems) => {
        return new Map([...groupedItems.entries()].toSorted(([keyStrA], [keyStrB]) => {
            const keyA = JSON.parse(keyStrA);
            const keyB = JSON.parse(keyStrB);
            return Array.from({ length: Math.max(keyA.length, keyB.length) }, (_, i) =>
                (keyA[i] ?? '').toString().localeCompare((keyB[i] ?? '').toString())
            ).find(cmp => cmp !== 0) ?? 0;
        }));
    };

    const groupedItems = useMemo(
        () => pipe(sortItems, groupItems, sortGroups)(filteredItems),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filteredItems, filters.analyses.sortBy, filters.analyses.sortOrder, filters.analyses.groupBy]
    );

    const handleItemClick = (item) => {
        item.isSelected ? handleDeselection(item.uid) : handleSelection(item.uid);
    };

    const handleGroupClick = (keyStr) => {
        const items = groupedItems.get(keyStr);
        const allSelected = items.every(item => item.isSelected);
        const uids = items.map(item => item.uid);
        allSelected ? handleDeselection(uids) : handleSelection(uids);
    };

    const handleWellClick = (wellItems) => {
        const allSelected = wellItems.every(item => item.isSelected);
        allSelected ? handleDeselection(wellItems.map(item => item.uid)) : handleSelection(wellItems.map(item => item.uid));
    };

    useImperativeHandle(ref, () => ({
        handleSelectAll: () => {
            handleSelection(filteredItems.map(item => item.uid))
        },
        contains: (node) => domRef.current?.contains(node),
    }), [filteredItems]);

    return (
        <div className="side-drawer" ref={domRef} tabIndex={0}>
            <div className="side-drawer__header">
                <h3 className="sidelist-title">Plate Contents</h3>
                <span className="side-drawer__total">{assignedList.length}</span>
            </div>
            <div className="search-section">
                <div className="search-wrapper">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search Analyses..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="search-input"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="filter-toggle"
                >
                    <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showFilters ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        )}
                    </svg>
                    <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Advanced Filters
                </button>

                {showFilters && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <label className="filter-label">Sort By</label>
                            <div className="filter-row">
                                <MultiSelectDropdown
                                    options={Object.entries(fieldConfig)
                                        .filter(([, cfg]) => cfg.sortable)
                                        .map(([field, cfg]) => ({ value: field, label: cfg.title || field }))}
                                    value={filters.analyses.sortBy}
                                    onChange={(newSortBy) => setFilters(prev => ({
                                        ...prev,
                                        analyses: { ...prev.analyses, sortBy: newSortBy }
                                    }))}
                                    placeholder="None"
                                />
                                {filters.analyses.sortBy.length > 0 && (
                                    <button
                                        onClick={() => setFilters(prev => ({
                                            ...prev,
                                            analyses: {
                                                ...prev.analyses,
                                                sortOrder: prev.analyses.sortOrder === 'asc' ? 'desc' : 'asc'
                                            }
                                        }))}
                                        className="sort-order-toggle"
                                        aria-label="Toggle sort order"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            {filters.analyses.sortOrder === 'asc' ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                            )}
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Group By</label>
                            <MultiSelectDropdown
                                options={Object.entries(fieldConfig)
                                    .filter(([, cfg]) => cfg.groupable)
                                    .map(([field, cfg]) => ({ value: field, label: cfg.title || field }))}
                                value={filters.analyses.groupBy}
                                onChange={(newGroupBy) => setFilters(prev => ({
                                    ...prev,
                                    analyses: { ...prev.analyses, groupBy: newGroupBy }
                                }))}
                                placeholder="None"
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="side-drawer__list">
                <div className="items-count">
                    {filteredItems.length} found
                </div>
                {groupedItems.size === 0 ? (
                    <div className="side-drawer__empty">No analyses assigned</div>
                ) : (
                    [...groupedItems].map(([keyStr, items]) => {
                        const groupKey = JSON.parse(keyStr);
                        return (
                            <div key={keyStr} className="side-drawer__well">
                                {groupKey.length > 0 && (
                                    <div className="side-drawer__group-label" onClick={() => handleGroupClick(keyStr)}>
                                        {
                                            groupKey.join(' › ')
                                        }
                                        {items.length > 1 && (
                                            <span className="side-drawer__well-count">×{items.length}</span>
                                        )}
                                    </div>
                                )}

                                {Object.entries(
                                    items.reduce((wells, item) => {
                                        (wells[item.wellIdx] ??= []).push(item);
                                        return wells;
                                    }, {})
                                ).sort(([a], [b]) => a - b).map(([wellIdx, wellItems]) => (
                                    <div key={wellIdx} className="side-drawer__well">

                                        <div className="side-drawer__well-label" onClick={() => handleWellClick(wellItems)}>
                                            {wellLabel(Number(wellIdx), colsCount)}
                                            {wellItems.length > 1 && (
                                                <span className="side-drawer__well-count">×{wellItems.length}</span>
                                            )}
                                        </div>

                                        {wellItems.map((item) => (
                                            <SideDrawerDraggableItem
                                                key={item.uid}
                                                item={item}
                                                isSelected={item.isSelected}
                                                fieldConfig={fieldConfig}
                                                presenter={presenter}
                                                handleItemClick={handleItemClick}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default SideDrawer;
