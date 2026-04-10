import AbstractWorksheetApiService from './AbstractWorksheetApiService';

let WorksheetMockObject = {
    rowsCount: 8,
    colsCount: 12,
    worksheetId: 'worksheet-123',
    fields: {
        "uid": {
            "sortable": false,
            "keyword": "uid",
            "title": "UID",
            "filterable": false,
            "groupable": false,
            "value": "obj.UID()"
        },
        "keyword": {
            "sortable": true,
            "keyword": "keyword",
            "title": "Service Keyword",
            "filterable": true,
            "groupable": true,
            "value": "obj.Keyword"
        },
        "sampleId": {
            "sortable": true,
            "keyword": "sampleId",
            "title": "Sample ID",
            "filterable": true,
            "groupable": true,
            "value": "obj.getRequest().getId()"
        },
        "clientId": {
            "sortable": true,
            "keyword": "clientId",
            "title": "Client ID",
            "filterable": true,
            "groupable": true,
            "value": "obj.getRequest().getClient().getClientID()"
        },
        "serviceTitle": {
            "sortable": false,
            "keyword": "serviceTitle",
            "title": "Service Title",
            "filterable": true,
            "groupable": false,
            "value": "obj.getService().Title()"
        },
        "clientName": {
            "sortable": true,
            "keyword": "clientName",
            "title": "Client Name",
            "filterable": true,
            "groupable": true,
            "value": "obj.getRequest().getClient().getClientTitle()"
        },
        "hidden": {
            "sortable": true,
            "keyword": "hiddem",
            "title": "Hidden Field",
            "filterable": true,
            "groupable": true,
            "value": "obj.getRequest().getClient().getClientTitle()"
        }

    },
    rules: [],
    analyses: {
        'uid-1': { wellIdx: 1, data: { keyword: 'kwrd-1', title: 'Lab Test 1', sampleType: 'epithelium', sampleId: 'S-001', clientId: 'AAA', clientName: 'Coca-Cola' } },
        'uid-2': { wellIdx: 48, data: { keyword: 'kwrd-1', title: 'Lab Test 1', sampleType: 'blood', sampleId: 'S-010', clientId: 'BBB', clientName: 'Apple' } },
        'uid-3': { wellIdx: 96, data: { keyword: 'kwrd-3', title: 'Lab Test 3', sampleType: 'blood', sampleId: 'S-017', clientId: 'BBB', clientName: 'Apple' } },
        'uid-4': { wellIdx: 20, data: { keyword: 'kwrd-3', title: 'Lab Test 3', sampleType: 'epithelium', sampleId: 'S-025', clientId: 'CCC', clientName: 'BMW' } },
        'uid-5': { wellIdx: 55, data: { keyword: 'kwrd-2', title: 'Lab Test 2', sampleType: 'blood', sampleId: 'S-010', clientId: 'CCC', clientName: 'BMW' } },
        'uid-6': { wellIdx: 77, data: { keyword: 'kwrd-2', title: 'Lab Test 2', sampleType: 'epithelium', sampleId: 'S-001', clientId: 'AAA', clientName: 'Coca-Cola' } },
        'uid-7': { wellIdx: 5, data: { keyword: 'kwrd-3', title: 'Lab Test 3', sampleType: 'epithelium', sampleId: 'S-001', clientId: 'AAA', clientName: 'Coca-Cola' } },
        'uid-8': { wellIdx: 33, data: { keyword: 'kwrd-5', title: 'Lab Test 5', sampleType: 'blood', sampleId: 'S-151', clientId: 'DDD', clientName: 'Subaru' } },
        'uid-9': { wellIdx: 88, data: { keyword: 'kwrd-5', title: 'Lab Test 5', sampleType: 'epithelium', sampleId: 'S-152', clientId: 'DDD', clientName: 'Subaru' } },
        'uid-10': { data: { keyword: 'kwrd-4', title: 'Lab Test 4', sampleType: 'epithelium', sampleId: 'S-001', clientId: 'AAA', clientName: 'Coca-Cola' } },
        'uid-11': { wellIdx: 12, data: { keyword: 'kwrd-7', title: 'Lab Test 7', sampleType: 'blood', sampleId: 'S-280', clientId: 'EEE', clientName: '7Eleven' } },
        'uid-12': { wellIdx: 64, data: { keyword: 'kwrd-8', title: 'Lab Test 8', sampleType: 'blood', sampleId: 'S-280', clientId: 'EEE', clientName: '7Eleven' } },
        'uid-13': { data: { keyword: 'kwrd-3', title: 'Lab Test 3', sampleType: 'blood', sampleId: 'S-280', clientId: 'EEE', clientName: '7Eleven' } },
        'uid-14': { data: { keyword: 'kwrd-4', title: 'Lab Test 4', sampleType: 'blood', sampleId: 'S-280', clientId: 'EEE', clientName: '7Eleven' } },
        'uid-15': { data: { keyword: 'kwrd-3', title: 'Lab Test 3', sampleType: 'epithelium', sampleId: 'S-281', clientId: 'EEE', clientName: '7Eleven' } },
        'uid-16': { data: { keyword: 'kwrd-4', title: 'Lab Test 4', sampleType: 'blood', sampleId: 'S-281', clientId: 'EEE', clientName: '7Eleven' } },
        'uid-17': { data: { keyword: 'kwrd-1', title: 'Lab Test 1', sampleType: 'blood', sampleId: 'S-300', clientId: 'FFF', clientName: 'Microsoft' } },
        'uid-18': { data: { keyword: 'kwrd-2', title: 'Lab Test 2', sampleType: 'blood', sampleId: 'S-300', clientId: 'FFF', clientName: 'Microsoft' } },
        'uid-19': { data: { keyword: 'kwrd-3', title: 'Lab Test 3', sampleType: 'blood', sampleId: 'S-300', clientId: 'FFF', clientName: 'Microsoft' } },
        'uid-20': { data: { keyword: 'kwrd-1', title: 'Lab Test 1', sampleType: 'epithelium', sampleId: 'S-301', clientId: 'FFF', clientName: 'Microsoft' } },
        'uid-21': { data: { keyword: 'kwrd-1', title: 'Lab Test 1', sampleType: 'blood', sampleId: 'S-302', clientId: 'FFF', clientName: 'Microsoft' } },
        'uid-22': { data: { keyword: 'kwrd-2', title: 'Lab Test 2', sampleType: 'blood', sampleId: 'S-302', clientId: 'FFF', clientName: 'Microsoft' } },
        'uid-23': { data: { keyword: 'kwrd-3', title: 'Lab Test 3', sampleType: 'epithelium', sampleId: 'S-310', clientId: 'GGG', clientName: 'Boeing' } },
        'uid-24': { data: { keyword: 'kwrd-4', title: 'Lab Test 4', sampleType: 'epithelium', sampleId: 'S-310', clientId: 'GGG', clientName: 'Boeing' } },
        'uid-25': { data: { keyword: 'kwrd-5', title: 'Lab Test 5', sampleType: 'epithelium', sampleId: 'S-310', clientId: 'GGG', clientName: 'Boeing' } },
        'uid-26': { data: { keyword: 'kwrd-6', title: 'Lab Test 6', sampleType: 'epithelium', sampleId: 'S-310', clientId: 'GGG', clientName: 'Boeing' } },
        'uid-27': { data: { keyword: 'kwrd-7', title: 'Lab Test 7', sampleType: 'epithelium', sampleId: 'S-310', clientId: 'GGG', clientName: 'Boeing' } },
        'uid-28': { data: { keyword: 'kwrd-8', title: 'Lab Test 8', sampleType: 'epithelium', sampleId: 'S-310', clientId: 'GGG', clientName: 'Boeing' } },
        'uid-29': { data: { keyword: 'kwrd-1', title: 'Lab Test 1', sampleType: 'blood', sampleId: 'S-310', clientId: 'GGG', clientName: 'Boeing' } },
        'uid-30': { data: { keyword: 'kwrd-5', title: 'Lab Test 5', sampleType: 'blood', sampleId: 'S-500', clientId: 'HHH', clientName: 'TOYOTA' } },
        'uid-31': { data: { keyword: 'kwrd-5', title: 'Lab Test 5', sampleType: 'blood', sampleId: 'S-505', clientId: 'HHH', clientName: 'TOYOTA' } },
        'uid-32': { data: { keyword: 'kwrd-7', title: 'Lab Test 7', sampleType: 'blood', sampleId: 'S-505', clientId: 'HHH', clientName: 'TOYOTA' } },
        'uid-33': { data: { keyword: 'kwrd-8', title: 'Lab Test 8', sampleType: 'blood', sampleId: 'S-510', clientId: 'HHH', clientName: 'TOYOTA' } },
        'uid-34': { data: { keyword: 'kwrd-8', title: 'Lab Test 8', sampleType: 'blood', sampleId: 'S-510', clientId: 'HHH', clientName: 'TOYOTA' } },
        'uid-35': { data: { keyword: 'kwrd-5', title: 'Lab Test 5', sampleType: 'epithelium', sampleId: 'S-001', clientId: 'AAA', clientName: 'Coca-Cola' } },
        'uid-36': { data: { keyword: 'kwrd-6', title: 'Lab Test 6', sampleType: 'epithelium', sampleId: 'S-001', clientId: 'AAA', clientName: 'Coca-Cola' } },
        'uid-37': { data: { keyword: 'kwrd-7', title: 'Lab Test 7', sampleType: 'epithelium', sampleId: 'S-001', clientId: 'AAA', clientName: 'Coca-Cola' } },
        'uid-38': { data: { keyword: 'kwrd-8', title: 'Lab Test 8', sampleType: 'epithelium', sampleId: 'S-001', clientId: 'AAA', clientName: 'Coca-Cola' } },
    },
}

class MockWorksheetApiService extends AbstractWorksheetApiService {
    constructor() {
        super();
        this.baseUrl = '';
    }

    async fetch() {
        return Promise.resolve(WorksheetMockObject);
    }

    async write_plate_data() {
        return Promise.resolve();
    }

    async unassign_analyses(analyses) {
        const uids_to_remove = Object.keys(analyses);
        const response = { success: true, analyses: Object.fromEntries(Object.entries(WorksheetMockObject.analyses).filter(([uid]) => !uids_to_remove.includes(uid)) ) };
        console.log('Mock unassigning analyses:', response);
        return Promise.resolve();
    }

}

export default MockWorksheetApiService;
