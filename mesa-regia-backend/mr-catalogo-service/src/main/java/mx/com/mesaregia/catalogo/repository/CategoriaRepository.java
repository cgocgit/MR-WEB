package mx.com.mesaregia.catalogo.repository;

import mx.com.mesaregia.catalogo.domain.entity.Categoria;
import mx.com.mesaregia.catalogo.domain.enums.AmbitoCategoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findAllByOrderByAmbitoAscNombreAsc();
    boolean existsByAmbitoAndNombreIgnoreCase(AmbitoCategoria ambito, String nombre);
    boolean existsByAmbitoAndNombreIgnoreCaseAndIdNot(AmbitoCategoria ambito, String nombre, Long id);
}
