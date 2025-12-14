package com.example.damiProd.service;

import com.example.damiProd.domain.Route;
import com.example.damiProd.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Route createRoute(Route route) {
        return routeRepository.save(route);
    }

    public void deleteRoute(Long id) {
        routeRepository.deleteById(id);
    }
    
    public Route getRouteById(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ruta nu a fost găsită"));
    }

    public List<Route> getRoutesByEmployeeId(Long employeeId) {
        return routeRepository.findByEmployee_Id(employeeId);
    }
}