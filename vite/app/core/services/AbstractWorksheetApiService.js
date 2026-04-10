class AbstractWorksheetApiService {

    constructor() {
        if (new.target === AbstractWorksheetApiService) {
            throw new Error("Cannot instantiate abstract class 'AbstractWorksheetApiService' directly.");
        }
    }

    transformAnalysesForPlateData(analyses) {
        return Object.entries(analyses).reduce((acc, [key, value]) => {
            acc[key] = { wellIdx: value.wellIdx };
            return acc;
        }, {});
    };

    buildPostData(method, analyses) {
        return {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                method: method,
                data: {
                    analyses: this.transformAnalysesForPlateData(analyses),
                }
            })
        };
    };

    async fetch() {
        throw new Error("Method 'fetch(data)' must be implemented.");
    }

    async write_plate_data() {
        throw new Error("Method 'write_plate_data(analyses)' must be implemented.");
    }

    async unassign_analyses() {
        throw new Error("Method 'unassign_analyses(analyses)' must be implemented.");
    }

    async update_senaite_listing() {
        if (window?.senaite?.core?.listings?.analyses_form) {
            window.senaite.core.listings.analyses_form.on_reload();
        }
    }
}

export default AbstractWorksheetApiService;
