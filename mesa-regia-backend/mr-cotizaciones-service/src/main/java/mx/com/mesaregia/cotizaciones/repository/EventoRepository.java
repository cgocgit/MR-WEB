package mx.com.mesaregia.cotizaciones.repository;

import mx.com.mesaregia.cotizaciones.domain.entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface EventoRepository extends JpaRepository<Evento, Long> {
  Optional<Evento> findByIdCotizacion(Long id);
}