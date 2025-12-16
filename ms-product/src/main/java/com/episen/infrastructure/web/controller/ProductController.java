package com.episen.infrastructure.web.controller;

import com.episen.application.dto.ProductRequestDTO;
import com.episen.application.dto.ProductResponseDTO;
import com.episen.application.dto.StockUpdateRequest;
import com.episen.application.service.ProductService;
import com.episen.domain.enums.Category;
import com.episen.infrastructure.exception.ErrorResponse;
import com.episen.infrastructure.exception.ResourceAlreadyExistsException;
import com.episen.infrastructure.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Controleur REST pour la gestion des produits.
 *
 * Best practices REST :
 * - Utilisation correcte des verbes HTTP (GET, POST, PUT, DELETE, PATCH)
 * - Codes de statut HTTP appropries (200, 201, 204, 404, etc.)
 * - URI RESTful (/api/v1/products, /api/v1/products/{id})
 * - Content negotiation avec MediaType
 * - Documentation OpenAPI/Swagger
 * - Validation des donnees avec @Valid
 * - ResponseEntity pour un controle total de la reponse
 * - Location header pour les ressources creees
 * - Separation des preoccupations (delegation au service)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Operations de gestion des produits")
public class ProductController {

    private final ProductService productService;

    /**
     * GET /api/v1/products
     * Recupere la liste de tous les produits.
     *
     * @return 200 OK avec la liste des produits
     */
    @Operation(summary = "Lister tous les produits",
            description = "Retourne la liste complete de tous les produits")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste recuperee avec succes",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProductResponseDTO.class)))
    })
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        List<ProductResponseDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/v1/products/{id}
     * Recupere un produit par son identifiant.
     *
     * @param id identifiant du produit
     * @return 200 OK si trouve ou 404 NOT FOUND
     */
    @Operation(summary = "Recuperer un produit par identifiant",
            description = "Retourne un produit specifique en fonction de son identifiant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Produit trouve",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProductResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Produit non trouve",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getProductById(
            @Parameter(description = "Identifiant du produit", required = true)
            @PathVariable Long id) {
        try {
            ProductResponseDTO product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (ResourceNotFoundException e) {
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * POST /api/v1/products
     * Cree un nouveau produit.
     *
     * @param request payload de creation
     * @return 201 CREATED avec l'emplacement de la ressource ou 400/409 en cas d'erreur
     */
    @Operation(summary = "Creer un produit",
            description = "Cree un produit avec les donnees fournies")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Produit cree",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProductResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Requete invalide",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflit (doublon ou etat invalide)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createProduct(
            @Valid @RequestBody ProductRequestDTO request) {
        try {
            ProductResponseDTO created = productService.createProduct(request);

            log.info("Création d'un produit: {}", created.getName());
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(created.getId())
                    .toUri();
            return ResponseEntity.created(location).body(created);
        } catch (ResourceAlreadyExistsException e) {
            return buildErrorResponse(HttpStatus.CONFLICT, e.getMessage());
        } catch (IllegalArgumentException e) {
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            return buildErrorResponse(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    /**
     * PUT /api/v1/products/{id}
     * Met a jour un produit existant.
     *
     * @param id identifiant du produit a mettre a jour
     * @param request payload de mise a jour
     * @return 200 OK, 400 BAD REQUEST, 404 NOT FOUND ou 409 CONFLICT
     */
    @Operation(summary = "Mettre a jour un produit",
            description = "Met a jour un produit existant par son identifiant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Produit mis a jour",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProductResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Requete invalide",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Produit non trouve",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflit metier",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateProduct(
            @Parameter(description = "Identifiant du produit", required = true) @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO request) {
        try {
            ProductResponseDTO updated = productService.updateProduct(id, request);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IllegalArgumentException e) {
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            return buildErrorResponse(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    /**
     * DELETE /api/v1/products/{id}
     * Supprime un produit s'il n'est pas lie a une commande.
     *
     * @param id identifiant du produit
     * @return 204 NO CONTENT, 404 NOT FOUND ou 409 CONFLICT
     */
    @Operation(summary = "Supprimer un produit",
            description = "Supprime un produit par identifiant, echoue si utilise dans une commande")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Produit supprime"),
            @ApiResponse(responseCode = "404", description = "Produit non trouve",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflit metier (produit utilise)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteProduct(
            @Parameter(description = "Identifiant du produit", required = true) @PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            log.info("Suppression du produit: {}", id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IllegalStateException e) {
            return buildErrorResponse(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    /**
     * GET /api/v1/products/search
     * Recherche des produits par nom.
     *
     * @param name fragment de nom
     * @return 200 OK avec la liste filtre
     */
    @Operation(summary = "Rechercher des produits par nom",
            description = "Retourne les produits contenant le nom fourni (ignore la casse)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recherche effectuee",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProductResponseDTO.class)))
    })
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(
            @Parameter(description = "Fragment du nom a rechercher", required = true)
            @RequestParam String name) {
        List<ProductResponseDTO> products = productService.searchProductsByName(name);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/v1/products/category/{category}
     * Liste les produits d'une categorie.
     *
     * @param category categorie du produit
     * @return 200 OK avec les produits de la categorie
     */
    @Operation(summary = "Lister les produits par categorie",
            description = "Retourne les produits appartenant a une categorie donnee")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Produits trouves",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProductResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Categorie invalide",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping(value = "/category/{category}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(
            @Parameter(description = "Categorie du produit", required = true)
            @PathVariable Category category) {
        List<ProductResponseDTO> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/v1/products/available
     * Liste les produits avec un stock > 0 et actifs.
     *
     * @return 200 OK avec les produits disponibles
     */
    @Operation(summary = "Lister les produits disponibles",
            description = "Retourne les produits actifs avec un stock superieur a zero")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Produits disponibles",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProductResponseDTO.class)))
    })
    @GetMapping(value = "/available", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProductResponseDTO>> getAvailableProducts() {
        List<ProductResponseDTO> products = productService.getAvailableProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * PATCH /api/v1/products/{id}/stock
     * Met a jour le stock d'un produit.
     *
     * @param id identifiant du produit
     * @param request payload contenant le stock
     * @return 200 OK ou 400/404
     */
    @Operation(summary = "Mettre a jour le stock d'un produit",
            description = "Met a jour la quantite en stock pour un produit donne")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Stock mis a jour",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ProductResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Requete invalide",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Produit non trouve",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PatchMapping(value = "/{id}/stock", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateStock(
            @Parameter(description = "Identifiant du produit", required = true) @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request) {
        try {
            ProductResponseDTO updated = productService.updateStock(id, request.getStock());
            log.info("Mise à jour du stock du produit {} à {}", id, updated.getStock());
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IllegalArgumentException e) {
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Gere les erreurs de type pour les parametres de requete.
     *
     * @param ex exception liee a la conversion
     * @return reponse avec statut 400 et detail de l'erreur
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String parameter = ex.getName();
        Object rejected = ex.getValue();
        String message = String.format("Valeur invalide pour %s : %s", parameter, rejected);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, message);
    }

    /**
     * Construit une reponse d'erreur standardisee.
     *
     * @param status  code HTTP a retourner
     * @param message message explicatif
     * @return entite de reponse avec le corps {@link ErrorResponse}
     */
    private ResponseEntity<ErrorResponse> buildErrorResponse(HttpStatus status, String message) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .build();
        return ResponseEntity.status(status).body(error);
    }
}
