package com.example.damiProd.service;

import com.example.damiProd.domain.Route;
import com.example.damiProd.repository.RouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<Route> getRoutesByCounty(String county) {
        List<Route> routes = routeRepository.findByCounty(county);
        // Force loading of tasks for each route
        routes.forEach(route -> route.getTasks().size());
        return routes;
    }

    public Route createRoute(Route route) {
        return routeRepository.save(route);
    }

    public void deleteRoute(Long id) {
        routeRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public Route getRouteById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ruta nu a fost găsită"));
        // Force loading of tasks (triggers lazy loading within transaction)
        route.getTasks().size();
        return route;
    }

    @Transactional(readOnly = true)
    public List<Route> getRoutesByEmployeeId(Long employeeId) {
        List<Route> routes = routeRepository.findByEmployee_Id(employeeId);
        // Force loading of tasks for each route
        routes.forEach(route -> route.getTasks().size());
        return routes;
    }
}