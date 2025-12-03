package com.example.damiProd.bootstrap;

import com.example.damiProd.domain.Product;
import com.example.damiProd.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataLoader(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            loadProducts();
        }
    }

    private void loadProducts() {
        for (int i = 1; i <= 12; i++) {
            Product product = new Product(
                    "Pachet servicii " + i,
                    "Description for packet " + i,
                    (double) ((i * 50) + 100));
            productRepository.save(product);
        }
        System.out.println("Loaded 12 Service Packets");
    }
}
