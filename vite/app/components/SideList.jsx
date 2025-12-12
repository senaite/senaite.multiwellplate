import { useContext, useEffect, useRef, useState } from 'react';
import { useDraggable } from "@dnd-kit/core";
import { AppContext } from './Layout.jsx';
import { WorksheetPresenterContext } from '../App.jsx';
import { useSelectAllShortcut } from '../utils/hooks.jsx';
import { cleanAndJoinClasses } from '../utils/helpers.js';


function SideList({ ref, onFocus, isActive }) {

    const { isDragging } = useContext(AppContext);

    const presenter = useContext(WorksheetPresenterContext);
    const [activeTab, setActiveTab] = useState('analyses');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        analyses: {
            groupBy: '',
            sortBy: '',
            sortOrder: 'asc'
        },
        substances: {
        }
    });

    const currentData = activeTab === 'analyses' ? presenter.getAnalysesUids() : [];
    const fieldConfig = presenter.getConfig().fields;

    const getUniqueValues = (key) => {
        return [...new Set(currentData.map(item => item[key]))];
    };

    const listItems = presenter.getAnalysesUids();
    const isSelected = (uid) => presenter.getSelectedUnassigned().includes(uid);
    const isAssigned = (uid) => !presenter.getUnassignedAnalysesUids().includes(uid)

    const handleItemClick = (uid) => {
        if (isSelected(uid)) {
            const arr = new Set(presenter.getSelectedUnassigned());
            arr.delete(uid);
            presenter.setSelectedUnassigned(arr);
        } else {
            presenter.setSelectedUnassigned(new Set(presenter.getSelectedUnassigned()).add(uid));
        }
    }


    useSelectAllShortcut(() => (isActive && activeTab === 'analyses') && presenter.setSelectedUnassigned(presenter.search(filters.search).filter(uid => !isAssigned(uid))))

    return (
        <div className="side-list-wrapper" ref={ref} onFocus={onFocus}>
            <div className="sidelist-header">
                <h2 className="sidelist-title">Setup</h2>
            </div>
            <div className="tabs-container side-list__tabs-container">
                <button
                    onClick={() => {
                        setActiveTab('analyses');
                        setFilters(prev => ({ ...prev, search: '' }));
                        setShowFilters(false);
                    }}
                    className={`tab-button ${activeTab === 'analyses' ? 'active' : ''}`}
                >
                    <span className="tab-icon">🧪</span>
                    Analyses
                </button>
                <button
                    onClick={() => {
                        setActiveTab('substances');
                        setFilters(prev => ({ ...prev, search: '' }));
                        setShowFilters(false);
                    }}
                    className={`tab-button ${activeTab === 'substances' ? 'active' : ''}`}
                    disabled
                >
                    <span className="tab-icon">⚗️</span>
                    Substances
                </button>
            </div>
            <div className="search-section">
                <div className="search-wrapper">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
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
                        {activeTab === 'analyses' ? (
                            <>
                                <div className="filter-group">
                                    <label className="filter-label">Type</label>
                                    <select
                                        value={filters.analyses.type}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            analyses: { ...filters.analyses, type: e.target.value }
                                        })}
                                        className="filter-select"
                                    >
                                        <option value="all">All Types</option>
                                        {getUniqueValues('type').map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label className="filter-label">Status</label>
                                    <select
                                        value={filters.analyses.status}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            analyses: { ...filters.analyses, status: e.target.value }
                                        })}
                                        className="filter-select"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <div className="filter-group">
                                <label className="filter-label">Category</label>
                                <select
                                    value={filters.substances.category}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        substances: { ...filters.substances, category: e.target.value }
                                    })}
                                    className="filter-select"
                                >
                                    <option value="all">All Categories</option>
                                    {getUniqueValues('category').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="side-list">
                <div className="items-count">
                    {presenter.search(filters.search).filter(uid => !isAssigned(uid)).length} {activeTab} found
                </div>
                {listItems.map(item => {
                    const { attributes, listeners, setNodeRef }
                        = useDraggable({
                            id: item,
                            disabled: !isSelected,
                            data: { type: 'unassigned', uid: item },
                        });
                    const data = presenter.getDataByUid(item);
                    const isFiltered = presenter.search(filters.search).includes(item) && !isAssigned(item)
                    return (
                        <button
                            key={item}
                            onClick={() => handleItemClick(item)}
                            ref={setNodeRef} {...listeners} {...attributes}
                            className={`item-card 
                                        ${isSelected(item) ? 'selected' : ''} 
                                        ${isSelected(item) && isDragging ? 'dragging' : ''}
                                        ${isAssigned(item) || !isFiltered ? 'filtered' : ''}`}
                        >
                            <div className="item-content">
                                <div className="item-info">
                                    {activeTab === 'analyses' ? (
                                        <>
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
                                        </>
                                    ) : (
                                        <>
                                            <div className="item-name">{item.name}</div>
                                            <div className="item-meta">
                                                <span className="badge">{item.category}</span>
                                                <span>{item.concentration}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {presenter.getSelectedUnassigned().includes(item) && (
                                    <div className="checkmark">
                                        <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                }
                )}

            </div>
        </div>
    );
}

export default SideList;