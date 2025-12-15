package com.example.damiProd.controller;

import com.example.damiProd.domain.RouteDefinition;
import com.example.damiProd.service.RouteDefinitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route-definitions")
public class RouteDefinitionController {

    private final RouteDefinitionService routeDefinitionService;

    public RouteDefinitionController(RouteDefinitionService routeDefinitionService) {
        this.routeDefinitionService = routeDefinitionService;
    }

    @GetMapping
    public ResponseEntity<List<RouteDefinition>> getAllRouteDefinitions() {
        return ResponseEntity.ok(routeDefinitionService.getAllRouteDefinitions());
    }

    @PostMapping
    public ResponseEntity<RouteDefinition> createRouteDefinition(@RequestBody RouteDefinition routeDefinition) {
        return ResponseEntity.ok(routeDefinitionService.createRouteDefinition(routeDefinition));
    }
}
