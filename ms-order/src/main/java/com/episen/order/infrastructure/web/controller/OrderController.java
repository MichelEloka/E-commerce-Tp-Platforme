package com.episen.order.infrastructure.web.controller;

import com.episen.order.application.dto.OrderRequestDTO;
import com.episen.order.application.dto.OrderResponseDTO;
import com.episen.order.application.dto.OrderStatusUpdateRequest;
import com.episen.order.application.service.OrderService;
import com.episen.order.domain.enums.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Operations de gestion des commandes")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Lister toutes les commandes", description = "Recupere la liste de toutes les commandes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des commandes recuperee avec succes")
    })
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        List<OrderResponseDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une commande par ID", description = "Recupere les details d'une commande specifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Commande trouvee"),
            @ApiResponse(responseCode = "404", description = "Commande non trouvee")
    })
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @Parameter(description = "ID de la commande") @PathVariable Long id) {
        OrderResponseDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping
    @Operation(summary = "Creer une nouvelle commande", description = "Cree une nouvelle commande avec verification user/produits et deduction stock")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Commande creee avec succes"),
            @ApiResponse(responseCode = "400", description = "Donnees invalides"),
            @ApiResponse(responseCode = "404", description = "Utilisateur ou produit non trouve"),
            @ApiResponse(responseCode = "409", description = "Stock insuffisant")
    })
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody OrderRequestDTO orderRequestDTO) {
        OrderResponseDTO created = orderService.createOrder(orderRequestDTO);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Mettre a jour le statut d'une commande", description = "Change le statut d'une commande (sauf si DELIVERED ou CANCELLED)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statut mis a jour avec succes"),
            @ApiResponse(responseCode = "400", description = "Statut invalide"),
            @ApiResponse(responseCode = "404", description = "Commande non trouvee"),
            @ApiResponse(responseCode = "409", description = "La commande ne peut pas etre modifiee")
    })
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @Parameter(description = "ID de la commande") @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponseDTO updated = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Annuler une commande", description = "Annule une commande en changeant son statut a CANCELLED")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Commande annulee avec succes"),
            @ApiResponse(responseCode = "404", description = "Commande non trouvee"),
            @ApiResponse(responseCode = "409", description = "La commande ne peut pas etre annulee")
    })
    public ResponseEntity<Void> cancelOrder(
            @Parameter(description = "ID de la commande") @PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Obtenir les commandes d'un utilisateur", description = "Recupere toutes les commandes d'un utilisateur specifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des commandes recuperee avec succes")
    })
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUserId(
            @Parameter(description = "ID de l'utilisateur") @PathVariable Long userId) {
        List<OrderResponseDTO> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Filtrer les commandes par statut", description = "Recupere toutes les commandes avec un statut specifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des commandes recuperee avec succes"),
            @ApiResponse(responseCode = "400", description = "Statut invalide")
    })
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByStatus(
            @Parameter(description = "Statut de la commande") @PathVariable OrderStatus status) {
        List<OrderResponseDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/product/{productId}/exists")
    @Operation(summary = "Verifier si un produit est dans une commande", description = "Endpoint pour le ProductClient pour verifier avant suppression")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification effectuee")
    })
    public ResponseEntity<Boolean> isProductInAnyOrder(
            @Parameter(description = "ID du produit") @PathVariable Long productId) {
        boolean exists = orderService.isProductInAnyOrder(productId);
        return ResponseEntity.ok(exists);
    }
}
