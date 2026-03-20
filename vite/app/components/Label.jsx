import { useContext, useSyncExternalStore } from "react";
import { WorksheetPresenterContext } from '../App.jsx';
import { cleanAndJoinClasses } from "../utils/helpers.js";

function Label({ row, col }) {
    const presenter = useContext(WorksheetPresenterContext);
    const analyses = useSyncExternalStore(presenter.subscribe, () => presenter.getAnalysesListSnapshot());
    const allSelected = (uids) => uids.every(uid => analyses[uid]?.isSelected);

    const handleClick = () => {
        if (row === 0 && col > 0) {
            const uids = presenter.getUidsByColumn(col);
            allSelected(uids) ? presenter.deselectMany(uids) : presenter.selectMany(uids);
        } else if (col === 0 && row > 0) {
            const uids = presenter.getUidsByRow(row);
            allSelected(uids) ? presenter.deselectMany(uids) : presenter.selectMany(uids);
        }
    };

    const uids = row === 0 && col > 0
        ? presenter.getUidsByColumn(col)
        : col === 0 && row > 0
            ? presenter.getUidsByRow(row)
            : [];
    const isAllSelected = uids.length > 0 && allSelected(uids);

    const labelClasses = [
        'label',
        (row === 0) ? 'col-label' : 'row-label',
        isAllSelected ? 'label--all-selected' : '',
    ]

    return (
        <div className={cleanAndJoinClasses(labelClasses)} onClick={handleClick}>
            {(col == 0) ? String.fromCharCode(65 + row - 1) : col}
        </div>
    );
}

export default Label;