## Dami Prod EcoTrack

**Dami Prod EcoTrack** is a comprehensive management application designed to streamline the operations of a portable toilet rental service. It connects sales, technical planning, and drivers to ensure efficient delivery, maintenance, and removal of units.

## Project Purpose

The core objective is to provide visibility and control over the entire lifecycle of portable toilet management for a fleet of approximately 15 drivers. The system addresses the following key workflows:

1.  **Sales & Ordering**: Sales representatives input orders, specifying the type of toilet, required date, and delivery location (e.g., "Standard Toilet, Oct 15, Sesame Street").
2.  **Technical Planning**: The technical department receives orders and organizes them into optimized routes and daily schedules for drivers.
3.  **Driver Operations**: Drivers receive their daily routes and tasks (delivery, cleaning, or removal).
    *   **Location Verification**: Upon arrival, drivers use the app to take a photo of the unit.
    *   **Geotagging**: The app records the *actual* GPS location where the unit was placed/serviced, allowing for comparison with the requested address to resolve location discrepancies.

## Tech Stack

We are using a modern, robust technology stack to ensure reliability and performance.

### **Frontend (Mobile App)**
*   **Framework**: React Native with [Expo](https://expo.dev/) (SDK 54)
*   **Language**: TypeScript
*   **Navigation**: Expo Router
*   **Maps**: React Native Maps (Google Maps integration)
*   **Styling**: Native styling

### **Backend (API)**
*   **Framework**: Spring Boot 3.5.7
*   **Language**: Java 21
*   **Database**: PostgreSQL (Production), H2 (Dev/Testing)
*   **ORM**: Spring Data JPA
*   **Tools**: Gradle, Lombok

