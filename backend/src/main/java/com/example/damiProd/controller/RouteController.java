package com.example.damiProd.controller;

import com.example.damiProd.domain.Route;
import com.example.damiProd.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @GetMapping("/county/{county}")
    public ResponseEntity<List<Route>> getRoutesByCounty(@PathVariable String county) {
        return ResponseEntity.ok(routeService.getRoutesByCounty(county));
    }

    @PostMapping
    public ResponseEntity<Route> createRoute(@RequestBody Route route) {
        Route savedRoute = routeService.createRoute(route);
        return ResponseEntity.ok(savedRoute);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Long id) {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }

    // Get a specific route by ID (with tasks)
    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(@PathVariable Long id) {
        Route route = routeService.getRouteById(id);
        return ResponseEntity.ok(route);
    }

    // Get all routes for a specific employee (driver)
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Route>> getRoutesByEmployee(@PathVariable Long employeeId) {
        List<Route> routes = routeService.getRoutesByEmployeeId(employeeId);
        return ResponseEntity.ok(routes);
    }
}