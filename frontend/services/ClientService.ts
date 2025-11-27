import { API_BASE_URL } from '../constants/ApiConfig';

export type ClientType = 'individual' | 'company';

export interface ClientData {
    type: ClientType;
    email: string;
    phone: string;
    address: string;
    name?: string; // For companies
    CUI?: string; // For companies
    adminName?: string; // For companies
}

export const ClientService = {
    /**
     * Fetches all clients from the backend.
     */
    getClients: async () => {
        const response = await fetch(`${API_BASE_URL}/clients`);
        if (!response.ok) {
            throw new Error('Failed to fetch clients');
        }
        return await response.json();
    },

    /**
     * Creates a new client.
     * @param clientData The data for the new client.
     */
    createClient: async (clientData: ClientData) => {
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    }
};
