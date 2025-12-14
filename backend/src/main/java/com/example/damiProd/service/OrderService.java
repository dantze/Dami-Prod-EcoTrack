package com.example.damiProd.service;

import com.example.damiProd.domain.Client;
import com.example.damiProd.domain.Order;
import com.example.damiProd.domain.Product;
import com.example.damiProd.repository.ClientRepository;
import com.example.damiProd.repository.OrderRepository;
import com.example.damiProd.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ClientRepository clientRepository,
            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.productRepository = productRepository;
    }

    public Order createOrder(Long clientId, Order order) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        order.setClient(client);

        // Link product if present (assuming frontend sends product object with ID)
        if (order.getProduct() != null && order.getProduct().getId() != null) {
            Product product = productRepository.findById(order.getProduct().getId())
                    .orElseThrow(
                            () -> new RuntimeException("Product not found with id: " + order.getProduct().getId()));
            order.setProduct(product);
        }

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByClient(Long clientId) {
        return orderRepository.findByClientId(clientId);
    }

    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
