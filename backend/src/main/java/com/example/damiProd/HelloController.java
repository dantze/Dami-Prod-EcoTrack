package com.example.damiProd;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    // Aceasta metoda raspunde cand intri pe http://localhost:8080/
    @GetMapping("/")
    public String index() {
        return "Salut! Aceasta este prima mea pagina Web cu Spring Boot!";
    }

    // Aceasta metoda raspunde cand intri pe http://localhost:8080/test
    @GetMapping("/test")
    public String test() {
        return "Aici este o alta pagina de test.";
    }
}