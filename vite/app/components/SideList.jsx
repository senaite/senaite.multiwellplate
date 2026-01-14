import { useContext, useState, useSyncExternalStore } from 'react';
import { useDraggable } from "@dnd-kit/react";
import { AppContext } from './Layout.jsx';
import { WorksheetPresenterContext } from '../App.jsx';


function SideListDraggableItem({ item, isSelected, isDragging, fieldConfig, presenter }) {
    const { ref: setDraggableNodeRef, handleRef: setHandleNodeRef } = useDraggable({
        id: item,
        disabled: !isSelected,
        data: { type: 'unassigned', uid: item },
    });

    const data = item.data;

    const handleItemClick = () => {
        if (isSelected) {
            presenter.deselect(item.uid);
        } else {
            presenter.select(item.uid);
        }
    };

    return (
        <button
            key={item}
            onClick={() => handleItemClick(item)}
            ref={node => { setDraggableNodeRef(node); setHandleNodeRef(node); }}
            className={`item-card
                        ${isSelected ? 'selected' : ''}
                        ${isSelected && isDragging ? 'dragging' : ''}`}
        >
            <div className="item-content">
                <div className="item-info">
                    <div className="item-name">
                        {Object.entries(data).map(([key, value]) => {
                            if (!['both', 'title'].includes(fieldConfig[key]?.display_mode)) return null;
                            return <span key={key} className={`name-${key}`}>{value}&nbsp;</span>
                        })}
                    </div>
                    <div className="item-meta">
                        {Object.entries(data).map(([key, value]) => {
                            if (!['both', 'description'].includes(fieldConfig[key]?.display_mode)) return null;
                            return <span key={key} className={`meta-${key}`}>{value}&nbsp;</span>
                        })}
                    </div>
                </div>
                {isSelected && (
                    <div className="checkmark">
                        <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                )}
            </div>
        </button>
    );
}

function SideList({ ref, onFocus }) {

    const { isDragging } = useContext(AppContext);

    const presenter = useContext(WorksheetPresenterContext);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        analyses: {
            groupBy: '',
            sortBy: '',
            sortOrder: 'asc'
        },
    });

    const listUnassigned = useSyncExternalStore(presenter.subscribe, () => presenter.getUnassignedListSnapshot());

    const fieldConfig = presenter.getConfig().fields;

    // Apply sorting to items
    const getSortedItems = (items) => {
        if (!filters.analyses.sortBy) return items;

        return [...items].sort((a, b) => {
            const aValue = a.data[filters.analyses.sortBy] || '';
            const bValue = b.data[filters.analyses.sortBy] || '';

            const comparison = aValue.toString().localeCompare(bValue.toString(), undefined, { numeric: true });
            return filters.analyses.sortOrder === 'asc' ? comparison : -comparison;
        });
    };

    // Apply grouping to items
    const getGroupedItems = (items) => {
        if (!filters.analyses.groupBy) {
            return { '': items };
        }

        const groups = {};
        items.forEach(item => {
            const groupValue = item.data[filters.analyses.groupBy] || 'Ungrouped';
            if (!groups[groupValue]) {
                groups[groupValue] = [];
            }
            groups[groupValue].push(item);
        });

        console.log('Grouped Items:', groups);
        return groups;
    };

    // Process items: filter, sort, then group
    const filteredItems = listUnassigned.filter(item =>
        presenter.search(filters.search).includes(item.uid)
    );
    const sortedItems = getSortedItems(filteredItems);
    const groupedItems = getGroupedItems(sortedItems);

    return (
        <div className="side-list-wrapper" ref={ref} onFocus={onFocus}>
            <div className="sidelist-header">
                <h3 className="sidelist-title">Analyses</h3>
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
                                <select
                                    value={filters.analyses.sortBy}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        analyses: { ...filters.analyses, sortBy: e.target.value }
                                    })}
                                    className="filter-select"
                                >
                                    <option value="">None</option>
                                    {Object.entries(fieldConfig).filter(([field, config]) => config.sortable).map(([field, config]) => (
                                        <option key={field} value={field}>{config.title || field}</option>
                                    ))}
                                </select>
                                {filters.analyses.sortBy && (
                                    <button
                                        onClick={() => setFilters({
                                            ...filters,
                                            analyses: {
                                                ...filters.analyses,
                                                sortOrder: filters.analyses.sortOrder === 'asc' ? 'desc' : 'asc'
                                            }
                                        })}
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
                            <select
                                value={filters.analyses.groupBy}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    analyses: { ...filters.analyses, groupBy: e.target.value }
                                })}
                                className="filter-select"
                            >
                                <option value="">None</option>
                                {Object.entries(fieldConfig).filter(([field, config]) => config.groupable).map(([field, config]) => (
                                    <option key={field} value={field}>{config.title || field}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
            <div className="side-list">
                <div className="items-count">
                    {filteredItems.length} found
                </div>
                {Object.entries(groupedItems).map(([groupName, items]) => (
                    <div key={groupName} className="group-section">
                        {groupName && (
                            <div className="group-header">
                                <div className="group-title">{groupName}</div>
                                <div className="group-count">{items.length}</div>
                            </div>
                        )}
                        {items.map(item => (
                            <SideListDraggableItem
                                key={item.uid}
                                item={item}
                                isSelected={item.isSelected}
                                isDragging={isDragging.current}
                                fieldConfig={fieldConfig}
                                presenter={presenter}
                            />
                        ))}
                    </div>
                ))}

            </div>
        </div>
    );
}

export default SideList;