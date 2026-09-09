package mx.com.mesaregia.seguridad.repository;

import java.util.Optional;
import mx.com.mesaregia.seguridad.domain.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByIdentificador(String identificador);

    boolean existsByIdentificadorAndIdNot(String identificador, Long id);

    long countByRolCodigoAndActivoTrue(String codigoRol);

    @Query("""
            select u
            from Usuario u
            where (:texto is null
                   or lower(u.nombre) like lower(concat('%', :texto, '%'))
                   or lower(u.identificador) like lower(concat('%', :texto, '%')))
              and (:activo is null or u.activo = :activo)
              and (:idRol is null or u.rol.id = :idRol)
            """)
    Page<Usuario> buscar(
            @Param("texto") String texto,
            @Param("activo") Boolean activo,
            @Param("idRol") Long idRol,
            Pageable pageable);
}
