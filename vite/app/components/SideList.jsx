import { useContext, useEffect, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AppContext } from './Layout.jsx';
import { WorksheetPresenterContext } from '../App.jsx';
import ListDraggableItem from './ListDraggableItem';
import MultiSelectDropdown from './Controls/MultiSelectDropdown.jsx';
import { pipe } from '../core/helpers/utilities.js';


function SideList({ ref, handleSelection, handleDeselection }) {

    const domRef = useRef(null);
    const { isDragging } = useContext(AppContext);

    const presenter = useContext(WorksheetPresenterContext);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        analyses: {
            groupBy: [],   
            sortBy: [],    
            sortOrder: 'asc'
        },
    });

    const analysesList = useSyncExternalStore(presenter.subscribeUnassigned, () => presenter.getUnassignedListSnapshot());

    const fieldConfig = presenter.getConfig().fields;

    // Apply multi-field sorting to items (fields are ordered by priority)
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

    // Apply multi-field grouping – group key is the combined values of all groupBy fields
    const groupItems = (items) => {
        const groups = new Map();

        if (!filters.analyses.groupBy.length) {
            return groups.set('[]', items);
        }

        items.forEach(item => {
            const key = filters.analyses.groupBy
                .flatMap(field => item.data[field] ?? 'Ungrouped')
            const keyStr = JSON.stringify(key);
            if (!groups.has(keyStr)) groups.set(keyStr, []);
            groups.get(keyStr).push(item);
        });

        return groups;
    };

    const sortGroups = (groupedItems) => {
        if (!filters.analyses.groupBy.length) return groupedItems;

        return new Map([...groupedItems.entries()].toSorted(([keyStrA], [keyStrB]) => {
            const keyA = JSON.parse(keyStrA);
            const keyB = JSON.parse(keyStrB);
            return Array.from({ length: Math.max(keyA.length, keyB.length) }, (_, i) =>
                (keyA[i] ?? '').localeCompare(keyB[i] ?? '')
            ).find(cmp => cmp !== 0) ?? 0;
        }));
    }

    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const searchResultSet = useMemo(
        () => new Set(presenter.search(debouncedSearch)),
        [debouncedSearch, analysesList]
    );

    const unassignedList = useMemo(
        () => Object.entries(analysesList).map(([uid, item]) => ({ uid, ...item })),
        [analysesList]
    );

    const filteredItems = useMemo(
        () => unassignedList.filter(item => searchResultSet.has(item.uid)),
        [unassignedList, searchResultSet]
    );

    const selectedCount = useMemo(
        () => unassignedList.filter(item => item.isSelected).length,
        [unassignedList]
    );

    const sortedAndGroupedItems = useMemo(
        () => pipe(sortItems, groupItems, sortGroups)(filteredItems),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filteredItems, filters.analyses.sortBy, filters.analyses.sortOrder, filters.analyses.groupBy]
    );

    useEffect(() => {
        const orderedUids = [...sortedAndGroupedItems.values()].flat().map(item => item.uid);
        presenter.setListOrder(orderedUids);
    }, [sortedAndGroupedItems]);

    const selectGroup = (group) => handleSelection(sortedAndGroupedItems.get(group).map(item => item.uid));
    const deselectGroup = (group) => handleDeselection(sortedAndGroupedItems.get(group).map(item => item.uid));;

    const handleItemClick = (item) => {
        if (item.isSelected) {
            handleDeselection(item.uid);
        } else {
            handleSelection(item.uid);
        }
    };

    const handleGroupClick = (group) => {
        const allSelected = sortedAndGroupedItems.get(group).every(item => item.isSelected);
        if (allSelected) {
            deselectGroup(group);
        } else {
            selectGroup(group);
        }
    };

    const handleSelectAll = () => {
        const allSelected = filteredItems.every(item => item.isSelected);
        const uids = filteredItems.map(item => item.uid);
        allSelected ? handleDeselection(uids) : handleSelection(uids);
    };

    useImperativeHandle(ref, () => ({
        handleSelectAll: () => handleSelectAll(),
        contains: (node) => domRef.current?.contains(node),
    }), [filteredItems]);

    return (
        <div className="side-list-wrapper" ref={domRef} >
            <div className="sidelist-header">
                <h3 className="sidelist-title">Unplated</h3>
                <span className="side-drawer__total">{unassignedList.length}</span>
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
            <div className="side-list">
                <div className="sidelist-header">
                    <div className="items-count">
                        {filteredItems.length} found
                    </div>
                    <div onClick={() => handleSelectAll()} className="side_list__select-all-link-btn">
                        Select All
                    </div>
                </div>
                {[...sortedAndGroupedItems].map(([keyStr, items]) => {
                    const groups = JSON.parse(keyStr);
                    return (
                        <div key={keyStr} className="group-section">
                            {groups.length > 0 && (
                                <div className="group-header" onClick={() => handleGroupClick(keyStr)}>
                                    <div className="group-title">{groups.join(' › ')}</div>
                                    <div className="group-count">{items.length}</div>
                                </div>
                            )}
                            {items.map(item => (
                                <ListDraggableItem
                                    key={item.uid}
                                    item={item}
                                    isDragging={isDragging.current}
                                    fieldConfig={fieldConfig}
                                    presenter={presenter}
                                    handleItemClick={handleItemClick}
                                />
                            ))}
                        </div>
                    );
                })}

            </div>
            {/* <div className={`list-selection-toolbar${selectedCount > 0 ? ' list-selection-toolbar--visible' : ''}`}>
                <span className="list-selection-toolbar__count">{selectedCount} selected</span>
                <button className="list-selection-toolbar__btn list-selection-toolbar__btn--danger" onClick={() => 0}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Unassign
                </button>
            </div> */}
        </div>
    );
}

export default SideList;