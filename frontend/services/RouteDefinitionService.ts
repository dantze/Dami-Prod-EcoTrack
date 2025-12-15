import { API_BASE_URL } from '../constants/ApiConfig';

export interface RouteDefinition {
    id?: number;
    name: string;
    city: string;
}

export const RouteDefinitionService = {
    getAllRouteDefinitions: async (): Promise<RouteDefinition[]> => {
        const response = await fetch(`${API_BASE_URL}/route-definitions`);
        if (!response.ok) {
            throw new Error('Eșec la preluarea rutelor');
        }
        return await response.json();
    },

    createRouteDefinition: async (routeDefinition: RouteDefinition): Promise<RouteDefinition> => {
        const response = await fetch(`${API_BASE_URL}/route-definitions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(routeDefinition),
        });

        if (!response.ok) {
            throw new Error('Eșec la crearea rutei');
        }
        return await response.json();
    }
};
