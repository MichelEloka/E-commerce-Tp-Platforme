package com.episen.domain.repository;

import com.episen.domain.entity.Product;
import com.episen.domain.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Port d'acces aux donnees produits via Spring Data JPA.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Recherche les produits dont le nom contient le fragment fourni (ignore la casse).
     *
     * @param name fragment de nom
     * @return liste des produits correspondants
     */
    List<Product> findByNameContainingIgnoreCase(String name);

    /**
     * Recupere les produits appartenant a une categorie.
     *
     * @param category categorie cible
     * @return produits de la categorie
     */
    List<Product> findByCategory(Category category);

    /**
     * Liste les produits dont le stock est strictement superieur au seuil donne.
     *
     * @param stock seuil minimal
     * @return produits avec stock superieur
     */
    List<Product> findByStockGreaterThan(Integer stock);

    /**
     * Liste les produits actifs dont le stock est strictement superieur au seuil donne.
     *
     * @param stock seuil minimal
     * @return produits actifs avec stock superieur
     */
    List<Product> findByStockGreaterThanAndActiveTrue(Integer stock);

    /**
     * Verifie l'existence d'un produit par nom, sans tenir compte de la casse.
     *
     * @param name nom a tester
     * @return true si un produit existe deja, false sinon
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Compte les produits dont le stock est inferieur au seuil fourni.
     *
     * @param stock seuil maximal (exclusif)
     * @return nombre de produits sous le seuil
     */
    long countByStockLessThan(Integer stock);
}
