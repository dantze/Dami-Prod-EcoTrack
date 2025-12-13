package com.example.damiProd.controller;

import com.example.damiProd.domain.Order;
import com.example.damiProd.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/clients/{clientId}/orders")
    public ResponseEntity<Order> createOrder(@PathVariable("clientId") Long clientId, @RequestBody Order order) {
        Order savedOrder = orderService.createOrder(clientId, order);
        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/clients/{clientId}/orders")
    public ResponseEntity<List<Order>> getOrdersByClient(@PathVariable("clientId") Long clientId) {
        List<Order> orders = orderService.getOrdersByClient(clientId);
        return ResponseEntity.ok(orders);
    }

    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable("orderId") Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
}
