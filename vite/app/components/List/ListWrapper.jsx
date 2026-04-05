import { useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { WorksheetPresenterContext } from '../../App.jsx';
import FilterPanel from './FilterPanel.jsx';
import PanelHeader from './PanelHeader.jsx';
import { pipe } from '../../core/helpers/utilities.js';


function ListWrapper({ ref, title, sourceItems, handleSelection, handleDeselection, getOrderedUids, children }) {

    const domRef = useRef(null);
    const presenter = useContext(WorksheetPresenterContext);
    const fieldConfig = presenter.getConfig().fields;

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

    useEffect(() => {
        if (!filters.search) return;
        const selectedUids = Object.entries(sourceItems)
            .filter(([, item]) => item.isSelected)
            .map(([uid]) => uid);
        if (selectedUids.length) handleDeselection(selectedUids);
    }, [filters.search]);

    const searchResultSet = useMemo(
        () => new Set(presenter.search(debouncedSearch)),
        [debouncedSearch, sourceItems]
    );

    const theList = useMemo(
        () => Object.entries(sourceItems).map(([uid, item]) => ({ uid, ...item })),
        [sourceItems]
    );

    const filteredItems = useMemo(
        () => theList.filter(item => searchResultSet.has(item.uid)),
        [theList, searchResultSet]
    );

    const sortItems = (items) => {
        if (!filters.analyses.sortBy.length) return items;
        return [...items].sort((a, b) => {
            for (const field of filters.analyses.sortBy) {
                const aVal = (a.data[field] ?? '').toString();
                const bVal = (b.data[field] ?? '').toString();
                const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
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
        if (!filters.analyses.groupBy.length) return groupedItems;
        return new Map([...groupedItems.entries()].toSorted(([keyStrA], [keyStrB]) => {
            const keyA = JSON.parse(keyStrA);
            const keyB = JSON.parse(keyStrB);
            return Array.from({ length: Math.max(keyA.length, keyB.length) }, (_, i) =>
                (keyA[i] ?? '').localeCompare(keyB[i] ?? '', undefined, { numeric: true, sensitivity: 'base' })
            ).find(cmp => cmp !== 0) ?? 0;
        }));
    };

    const sortedAndGroupedItems = useMemo(
        () => pipe(sortItems, groupItems, sortGroups)(filteredItems),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filteredItems, filters.analyses.sortBy, filters.analyses.sortOrder, filters.analyses.groupBy]
    );

    useEffect(() => {
        const orderedUids = getOrderedUids
            ? getOrderedUids(sortedAndGroupedItems)
            : [...sortedAndGroupedItems.values()].flat().map(item => item.uid);
        presenter.setListOrder(orderedUids);
    }, [sortedAndGroupedItems]);

    const handleItemClick = (item) => {
        item.isSelected ? handleDeselection(item.uid) : handleSelection(item.uid);
    };

    const handleGroupClick = (keyStr) => {
        const items = sortedAndGroupedItems.get(keyStr);
        const allSelected = items.every(item => item.isSelected);
        const uids = items.map(item => item.uid);
        allSelected ? handleDeselection(uids) : handleSelection(uids);
    };

    const handleSelectAll = () => {
        const allSelected = filteredItems.every(item => item.isSelected);
        const uids = filteredItems.map(item => item.uid);
        allSelected ? handleDeselection(uids) : handleSelection(uids);
    };

    useImperativeHandle(ref, () => ({
        handleSelectAll,
        contains: (node) => domRef.current?.contains(node),
    }), [filteredItems]);

    return (
        <div className="list-wrapper" ref={domRef}>
            <PanelHeader title={title} count={theList.length} />
            <FilterPanel filters={filters} setFilters={setFilters} fieldConfig={fieldConfig} />
            <div className="list-header">
                <div className="items-count">{filteredItems.length} found</div>
                <div onClick={handleSelectAll} className="list__select-all-link-btn">Select All</div>
            </div>
            <div className='list'>
                {children({ sortedAndGroupedItems, handleItemClick, handleGroupClick, fieldConfig })}
            </div>
        </div>
    );
}

export default ListWrapper;
