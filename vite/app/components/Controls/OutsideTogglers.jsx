import { useContext } from 'react';
import { WorksheetPresenterContext } from '../../App';


function OutsideTogglers() {
    const { model } = useContext(WorksheetPresenterContext);
    Object.entries(model.analyses).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (el) el.innerHTML = value?.wellIdx || '&nbsp;';
    })
    return null;
}

export default OutsideTogglers;