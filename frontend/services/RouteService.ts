import { API_BASE_URL } from '../constants/ApiConfig';

// Definim structura datelor, similar cu entitatea Java
export interface RouteData {
    id?: number;
    date: string; 
    employee: {
        id: number;
        fullName?: string; 
    }; 
}

export const RouteService = {
   
    getAllRoutes: async () => {
        const response = await fetch(`${API_BASE_URL}/routes`);
        if (!response.ok) {
            throw new Error('Eșec la preluarea rutelor');
        }
        return await response.json();
    },

    
    createRoute: async (routeData: RouteData) => {
        const response = await fetch(`${API_BASE_URL}/routes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(routeData),
        });

        if (!response.ok) {
            throw new Error('Eșec la crearea rutei');
        }
        return await response.json();
    }
};