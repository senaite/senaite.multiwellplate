import { useState, useRef } from 'react';
import MultiSelectDropdown from './MultiSelectDropdown.jsx';
import { useClickOutsideRef } from '../../utils/hooks.jsx';


function FilterPanel({ filters, setFilters, fieldConfig }) {

    const filterPanelRef = useRef(null);
    const buttonRef = useRef(null);
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = filters?.analyses?.sortBy?.length > 0 || filters?.analyses?.groupBy?.length > 0;

    useClickOutsideRef(filterPanelRef, (e) => {
        if (buttonRef.current && buttonRef.current.contains(e.target)) return;
        setShowFilters(false)
    });

    return (
        <div className="filter-panel">
            <div className="filter-panel__row">
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
                    ref={buttonRef}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`filter-toggle${showFilters ? ' filter-toggle--open' : ''}${hasActiveFilters ? ' filter-toggle--active' : ''}`}
                    aria-expanded={showFilters}
                >
                    <span className="filter-label">Filters</span>
                    <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {hasActiveFilters && <span className="filter-active-dot" />}
                    <svg className={`chevron-icon${showFilters ? ' chevron-icon--open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            <div ref={filterPanelRef} className={`filters-panel${showFilters ? ' filters-panel--open' : ''}`}>
                <div className="filters-panel__inner">
                    <div className="filter-group">
                        <label className="filter-label">Sort By</label>
                        <div className="filter-row">
                            <MultiSelectDropdown
                                options={fieldConfig && Object.entries(fieldConfig)
                                    .filter(([, cfg]) => cfg.sortable)
                                    .map(([field, cfg]) => ({ value: field, label: cfg.title || field }))}
                                value={filters.analyses.sortBy}
                                onChange={(newSortBy) => setFilters(prev => ({
                                    ...prev,
                                    analyses: { ...prev.analyses, sortBy: newSortBy }
                                }))}
                                placeholder="None"
                            />
                            {filters?.analyses?.sortBy.length > 0 && (
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
                            options={fieldConfig && Object.entries(fieldConfig)
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
            </div>
        </div>
    );
}

export default FilterPanel;