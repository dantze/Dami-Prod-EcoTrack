package com.example.damiProd.domain;

public enum TaskStatus {
    NEW,            // Sarcina creată de dispecer, dar neîncepută
    IN_PROGRESS,    // Șoferul a ajuns la locație și lucrează
    COMPLETED,      // Sarcina finalizată cu succes
    CANCELLED       // Sarcina anulată
}