#!/bin/bash

# Ce script teste les points d'accès du microservice ms-order.
# Il est autonome : il crée un utilisateur et des produits temporaires pour ses tests,
# puis les nettoie à la fin.
# Assurez-vous que l'environnement Docker est en cours d'exécution.
# Nécessite 'jq' (sudo apt-get install jq).

BASE_URL_MEMBERSHIP="http://localhost/api/membership/api/v1"
BASE_URL_PRODUCT="http://localhost/api/product/api/v1"
BASE_URL_ORDER="http://localhost/api/order/api/v1"

echo "=================================================="
echo "================= TESTING ms-order ================"
echo "=================================================="

# --- SETUP : Création des dépendances (utilisateur et produits) ---
echo -e "\n--- SETUP : Création d'un utilisateur et de produits temporaires ---"
USER_PAYLOAD='{"firstName": "Order", "lastName": "Test", "email": "ordertest'$$'@example.com"}'
USER_ID=$(curl -s -X POST -H "Content-Type: application/json" -d "$USER_PAYLOAD" "$BASE_URL_MEMBERSHIP/users" | jq -r '.id')

PRODUCT_PAYLOAD_1='{"name": "Test Product 1", "price": 10.00, "stock": 20, "category": "BOOKS"}'
PRODUCT_ID_1=$(curl -s -X POST -H "Content-Type: application/json" -d "$PRODUCT_PAYLOAD_1" "$BASE_URL_PRODUCT/products" | jq -r '.id')

PRODUCT_PAYLOAD_2='{"name": "Test Product 2", "price": 25.50, "stock": 15, "category": "HOME"}'
PRODUCT_ID_2=$(curl -s -X POST -H "Content-Type: application/json" -d "$PRODUCT_PAYLOAD_2" "$BASE_URL_PRODUCT/products" | jq -r '.id')


if [ -z "$USER_ID" ] || [ "$USER_ID" == "null" ] || [ -z "$PRODUCT_ID_1" ] || [ "$PRODUCT_ID_1" == "null" ] || [ -z "$PRODUCT_ID_2" ] || [ "$PRODUCT_ID_2" == "null" ]; then
    echo "Erreur : Impossible de créer les données de test (utilisateur/produits). Arrêt."
    # Nettoyage partiel si nécessaire
    [ ! -z "$USER_ID" ] && [ "$USER_ID" != "null" ] && curl -s -X DELETE "$BASE_URL_MEMBERSHIP/users/$USER_ID"
    [ ! -z "$PRODUCT_ID_1" ] && [ "$PRODUCT_ID_1" != "null" ] && curl -s -X DELETE "$BASE_URL_PRODUCT/products/$PRODUCT_ID_1"
    [ ! -z "$PRODUCT_ID_2" ] && [ "$PRODUCT_ID_2" != "null" ] && curl -s -X DELETE "$BASE_URL_PRODUCT/products/$PRODUCT_ID_2"
    exit 1
fi

echo "Données de test créées : User ID: $USER_ID, Product IDs: $PRODUCT_ID_1, $PRODUCT_ID_2"


# --- DÉBUT DES TESTS POUR MS-ORDER ---

# 1. Créer une nouvelle commande
echo -e "\n\n--- 1. Création d'une nouvelle commande ---"
ORDER_PAYLOAD='{"userId": '$USER_ID', "shippingAddress": "123 Rue du Test, 75001 Paris", "items": [{"productId": '$PRODUCT_ID_1', "quantity": 1}, {"productId": '$PRODUCT_ID_2', "quantity": 2}]}'
CREATED_ORDER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$ORDER_PAYLOAD" "$BASE_URL_ORDER/orders")
echo "Réponse du serveur : $CREATED_ORDER_RESPONSE"
ORDER_ID=$(echo "$CREATED_ORDER_RESPONSE" | jq -r '.id')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" == "null" ]; then
    echo "Erreur : Impossible de créer la commande. Arrêt des tests pour ms-order."
else
    echo "Commande créée avec l'ID : $ORDER_ID"

    # 2. Récupérer toutes les commandes
    echo -e "\n\n--- 2. Récupération de toutes les commandes ---"
    curl -s -X GET "$BASE_URL_ORDER/orders" | jq .

    # 3. Récupérer la commande par ID
    echo -e "\n\n--- 3. Récupération de la commande avec l'ID $ORDER_ID ---"
    curl -s -X GET "$BASE_URL_ORDER/orders/$ORDER_ID" | jq .

    # 4. Mettre à jour le statut de la commande
    echo -e "\n\n--- 4. Mise à jour du statut de la commande $ORDER_ID ---"
    curl -s -X PUT -H "Content-Type: application/json" -d '{"status": "SHIPPED"}' "$BASE_URL_ORDER/orders/$ORDER_ID/status" | jq .

    # 5. Récupérer les commandes par utilisateur
    echo -e "\n\n--- 5. Récupération des commandes pour l'utilisateur $USER_ID ---"
    curl -s -X GET "$BASE_URL_ORDER/orders/user/$USER_ID" | jq .

    # 6. Annuler la commande (suppression logique)
    echo -e "\n\n--- 6. Annulation de la commande $ORDER_ID ---"
    curl -s -X DELETE "$BASE_URL_ORDER/orders/$ORDER_ID"
    echo -e "\nCommande annulée (statut passé à CANCELLED)."
fi

# --- DÉBUT DES TESTS DE VALIDATION NÉGATIVE ---
echo -e "\n\n--------------------------------------------------"
echo "----------- DÉBUT DES TESTS DE VALIDATION NÉGATIVE -----------"
echo "--------------------------------------------------"

# Test 1: Tenter de créer une commande avec un userId inexistant
echo -e "\n\n--- Test 1: Commande avec userId inexistant (attendu: Erreur 404/400) ---"
INVALID_USER_PAYLOAD='{"userId": 999999, "shippingAddress": "123 Rue du Test, 75001 Paris", "items": [{"productId": '$PRODUCT_ID_1', "quantity": 1}]}'
curl -i -s -X POST -H "Content-Type: application/json" -d "$INVALID_USER_PAYLOAD" "$BASE_URL_ORDER/orders"

# Test 2: Tenter de créer une commande sans adresse de livraison
echo -e "\n\n--- Test 2: Commande sans adresse de livraison (attendu: Erreur 400) ---"
NO_ADDRESS_PAYLOAD='{"userId": '$USER_ID', "items": [{"productId": '$PRODUCT_ID_1', "quantity": 1}]}'
curl -i -s -X POST -H "Content-Type: application/json" -d "$NO_ADDRESS_PAYLOAD" "$BASE_URL_ORDER/orders"

# Test 3: Tenter de créer une commande avec une liste d'articles vide
echo -e "\n\n--- Test 3: Commande avec liste d'articles vide (attendu: Erreur 400) ---"
EMPTY_ITEMS_PAYLOAD='{"userId": '$USER_ID', "shippingAddress": "123 Rue du Test, 75001 Paris", "items": []}'
curl -i -s -X POST -H "Content-Type: application/json" -d "$EMPTY_ITEMS_PAYLOAD" "$BASE_URL_ORDER/orders"

echo -e "\n\n--------------------------------------------------"
echo "------------ FIN DES TESTS DE VALIDATION NÉGATIVE ------------"
echo "--------------------------------------------------"


# --- NETTOYAGE ---
echo -e "\n\n--- NETTOYAGE : Suppression des données de test ---"
echo "Suppression de l'utilisateur $USER_ID"
curl -s -X DELETE "$BASE_URL_MEMBERSHIP/users/$USER_ID"
echo "Suppression du produit $PRODUCT_ID_1"
curl -s -X DELETE "$BASE_URL_PRODUCT/products/$PRODUCT_ID_1"
echo "Suppression du produit $PRODUCT_ID_2"
curl -s -X DELETE "$BASE_URL_PRODUCT/products/$PRODUCT_ID_2"
echo -e "\nNettoyage terminé."


echo -e "\n\n=================================================="
echo "============= ORDER TESTS COMPLETED ==============="
echo "=================================================="