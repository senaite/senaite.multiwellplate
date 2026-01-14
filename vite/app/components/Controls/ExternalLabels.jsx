import { useContext, useSyncExternalStore } from 'react';
import { WorksheetPresenterContext } from '../../App';


function ExternalLabels() {
    const presenter = useContext(WorksheetPresenterContext);
    const listAssigned = useSyncExternalStore(presenter.subscribe, () => presenter.getAssignedListSnaphot());
    listAssigned.forEach(({uid, wellIdx}) => {
        const el = document.getElementById(uid);
        if (el) el.innerHTML = wellIdx || '&nbsp;';
    })
    return null;
}

export default ExternalLabels;