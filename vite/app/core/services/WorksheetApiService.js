

class WorksheetApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async fetch() {
        try {
            const response = await fetch(`${this.baseUrl}/multiwellplate_api`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch plate: ${error.message}`);
        }
    }

    async write_plate_data(analyses) {
        try {
            const response = await fetch(`${this.baseUrl}/multiwellplate_api`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(
                        {
                            method: "write_plate_data",
                            plate_data: {
                                analyses: Object.entries(analyses).reduce((acc, [key, value]) => {
                                    acc[key] = {wellIdx: value.wellIdx}; 
                                    return acc;
                                }, {})
                            }
                        }
                    )
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch plate: ${error.message}`);
        }
    }
}

export default WorksheetApiService;
