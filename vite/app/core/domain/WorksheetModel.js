import { Engine } from 'json-rules-engine';


class WorksheetModel {

    constructor() {
        this.analyses = {};
        this.rowsCount = 0;
        this.colsCount = 0;
        this.selectedAnalyses = null;
        this.engine = new Engine([], { cache: true, replaceFactsInEventParams: true });
    }

    setData(data) {
        Object.assign(this, data);
    }

    setWellIdxToAnalysis({ uid, wellIdx }) {
        if (this.analyses[uid]) {
            this.analyses[uid].wellIdx = wellIdx ? wellIdx : null;
        }
    }

    assignAnalysis({ uid, wellIdx }) {
        this.setWellIdxToAnalysis({ uid, wellIdx });
    }

    unassignAnalysis({ uid }) {
        this.setWellIdxToAnalysis({ uid });
    }

    getWellIdsWithAnalyses() {
        return Object.values(this.analyses).filter(value => value.wellIdx).map(value => value.wellIdx);
    }

    getWellIdsEmpty() {
        return Array.from({ length: this.rowsCount * this.colsCount }, (_, i) => i + 1).filter(idx => {
            return !Object.values(this.analyses).some(value => value.wellIdx === idx);
        });
    }

}

export default WorksheetModel;