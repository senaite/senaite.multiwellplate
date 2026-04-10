import { useContext, useSyncExternalStore } from 'react';
import { AppContext } from '../../AppContext';

function ExternalLabels() {
    const { presenter } = useContext(AppContext);
    const analysesList = useSyncExternalStore(presenter.subscribe, () => presenter.getAnalysesListSnapshot());

    Object.entries(analysesList).map(([uid, item]) => ({ uid, ...item })).forEach((item) => {
        const el = document.getElementById(item.uid);
        if (el) el.innerHTML = item?.wellIdx !== null ? item.wellIdx : '&nbsp;';
    });

    return null;
}

export default ExternalLabels;