package com.example.damiProd.service;

import com.example.damiProd.domain.RouteDefinition;
import com.example.damiProd.repository.RouteDefinitionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteDefinitionService {

    private final RouteDefinitionRepository routeDefinitionRepository;

    public RouteDefinitionService(RouteDefinitionRepository routeDefinitionRepository) {
        this.routeDefinitionRepository = routeDefinitionRepository;
    }

    public List<RouteDefinition> getAllRouteDefinitions() {
        return routeDefinitionRepository.findAll();
    }

    public RouteDefinition createRouteDefinition(RouteDefinition routeDefinition) {
        return routeDefinitionRepository.save(routeDefinition);
    }
}
