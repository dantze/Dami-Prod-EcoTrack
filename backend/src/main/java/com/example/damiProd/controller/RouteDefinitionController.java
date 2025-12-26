package com.example.damiProd.controller;

import com.example.damiProd.domain.Order;
import com.example.damiProd.domain.RouteDefinition;
import com.example.damiProd.service.OrderService;
import com.example.damiProd.service.RouteDefinitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route-definitions")
public class RouteDefinitionController {

    private final RouteDefinitionService routeDefinitionService;
    private final OrderService orderService;

    public RouteDefinitionController(RouteDefinitionService routeDefinitionService, OrderService orderService) {
        this.routeDefinitionService = routeDefinitionService;
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<RouteDefinition>> getAllRouteDefinitions() {
        return ResponseEntity.ok(routeDefinitionService.getAllRouteDefinitions());
    }

    @PostMapping
    public ResponseEntity<RouteDefinition> createRouteDefinition(@RequestBody RouteDefinition routeDefinition) {
        return ResponseEntity.ok(routeDefinitionService.createRouteDefinition(routeDefinition));
    }

    @GetMapping("/{routeId}/orders")
    public ResponseEntity<List<Order>> getOrdersByRoute(@PathVariable("routeId") Long routeId) {
        return ResponseEntity.ok(orderService.getOrdersByRoute(routeId));
    }
}

