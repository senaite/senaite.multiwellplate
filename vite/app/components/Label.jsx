import { useContext, useSyncExternalStore } from "react";
import { WorksheetPresenterContext } from '../App.jsx';

function Label({ row, col }) {
    const presenter = useContext(WorksheetPresenterContext);
    const analyses = useSyncExternalStore(presenter.subscribe, () => presenter.getAnalysesListSnapshot());

    const handleClick = () => {
        if (row === 0 && col > 0) {
            const uids = presenter.getUidsByColumn(col);
            const allSelected = uids.every(uid => analyses[uid]?.isSelected);
            allSelected ? presenter.deselectMany(uids) : presenter.selectMany(uids);
        } else if (col === 0 && row > 0) {
            const uids = presenter.getUidsByRow(row);
            const allSelected = uids.every(uid => analyses[uid]?.isSelected);
            allSelected ? presenter.deselectMany(uids) : presenter.selectMany(uids);
        }
    };

    return (
        <div className={`label ${(row == 0) ? `col-label` : `row-label`}`} onClick={handleClick}>
            {(col == 0) ? String.fromCharCode(65 + row - 1) : col}
        </div>
    );
}

export default Label;