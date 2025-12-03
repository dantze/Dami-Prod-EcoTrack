package com.example.damiProd.service;

import com.example.damiProd.domain.Client;
import com.example.damiProd.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public Client saveClient(Client client) {
        return clientRepository.save(client);
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}
