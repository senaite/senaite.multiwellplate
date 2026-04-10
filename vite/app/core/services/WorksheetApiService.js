import AbstractWorksheetApiService from './AbstractWorksheetApiService';

class WorksheetApiService extends AbstractWorksheetApiService {

    constructor(baseUrl) {
        super();
        this.baseUrl = baseUrl;
    }

    async fetch(data) {
        return await fetch(`${this.baseUrl}/multiwellplate_api`, data);
    }
    
    async write_plate_data(analyses) {
        try {
            const response = await this.fetch(this.buildPostData("write_data", analyses));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch plate: ${error.message}`);
        }
    }

    async unassign_analyses(analyses) {
        try {
            const response = await this.fetch(this.buildPostData("unassign_analyses", analyses));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to unassign analyses: ${error.message}`);
        }
    }

}

export default WorksheetApiService;
