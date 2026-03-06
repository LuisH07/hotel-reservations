package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.exception.notfound.CategoriaNotFoundException;
import com.bd.hotel.reservations.persistence.entity.Categoria;
import com.bd.hotel.reservations.persistence.repository.CategoriaRepository;
import com.bd.hotel.reservations.web.dto.request.CategoriaRequest;
import com.bd.hotel.reservations.web.dto.response.CategoriaResponse;
import com.bd.hotel.reservations.web.mapper.CategoriaMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository repository;
    private final CategoriaMapper mapper;

    public CategoriaResponse criar(CategoriaRequest request) {
        Categoria categoria = mapper.toEntity(request);
        Categoria salva = repository.save(categoria);
        return mapper.toResponse(salva);
    }

    public List<CategoriaResponse> listarTodas() {
        List<Categoria> categorias = repository.findAll();
        return mapper.toResponseList(categorias);
    }

    public CategoriaResponse buscarPorId(Long id) {
        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new CategoriaNotFoundException(id));
        return mapper.toResponse(categoria);
    }

    public CategoriaResponse atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new CategoriaNotFoundException(id));

        categoria.atualizar(request.getPrecoDiaria(), request.getNome(), request.getCapacidade());

        Categoria salva = repository.save(categoria);
        return mapper.toResponse(salva);
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new CategoriaNotFoundException(id);
        }
        repository.deleteById(id);
    }
}