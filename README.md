# 🚀 Dami Prod EcoTrack Project Guide

This is a **monorepo** containing our mobile application code. We run the Frontend (React Native) and Backend (Spring Boot) concurrently.

## 🛠️ Essential Prerequisites

Make sure you have the following installed **before starting**:

1.  **JDK 21** (or 17) for the Java backend.
2.  **Node.js** (LTS) for the frontend.
3.  **Expo Go App** on your phone/emulator.

---

## 🏃 Project Setup and Run

You must run the backend and frontend in **two separate terminal windows**.

### 1. Start the Backend (Java API)

The API must be running first.

1.  Open **Terminal 1** (in the project root).
2.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
3.  Execute the run command:
    ```bash
    ./gradlew bootRun
    ```
    *Wait until the server confirms it is running on **port 8080**.* **Keep this terminal open.**

### 2. Start the Frontend (React Native App)

1.  Open **Terminal 2**.
2.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
3.  Run the Expo server:
    ```bash
    npx expo start
    ```
    *A **QR code** will display in the terminal and a browser page will open.*

4.  **Connect:** Scan the QR code using the **Expo Go App** on your device or emulator.

---

## 🌐 IMPORTANT: API Connection

The mobile app on your device cannot use `localhost`. All frontend API calls must use your computer's local IP address.

* **Find Your IP:** Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) in a third terminal.
* **Base URL Format:** `http://[YOUR_LOCAL_IP]:8080`

**Example:** `http://192.168.1.5:8080`

---

## 🤝 Working in Parallel (Git Workflow)

* **Branch:** Always work on a new feature branch (`git checkout -b feature/your-feature-name`).
* **Commit:** Commit your changes frequently.
* **Pull Request (PR):** Submit a Pull Request to the `main` branch and require at least one other teammate's review before merging.
