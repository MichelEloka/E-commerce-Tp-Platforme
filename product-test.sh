#!/bin/bash

# Ce script teste les points d'accès du microservice ms-product.
# Assurez-vous que l'environnement Docker est en cours d'exécution.
# Nécessite 'jq' (sudo apt-get install jq).

BASE_URL_PRODUCT="http://localhost/api/product/api/v1"

echo "=================================================="
echo "================ TESTING ms-product ================"
echo "=================================================="

# 1. Créer un nouveau produit
echo -e "\n\n--- 1. Création d'un nouveau produit ---"
PRODUCT_PAYLOAD='{"name": "Super Widget", "description": "Un widget vraiment super.", "price": 99.99, "stock": 100, "category": "ELECTRONICS"}'
CREATED_PRODUCT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$PRODUCT_PAYLOAD" "$BASE_URL_PRODUCT/products")
echo "Réponse du serveur : $CREATED_PRODUCT_RESPONSE"
PRODUCT_ID=$(echo "$CREATED_PRODUCT_RESPONSE" | jq -r '.id')

if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" == "null" ]; then
    echo "Erreur : Impossible de créer le produit ou d'extraire l'ID. Arrêt des tests."
    exit 1
fi

echo "Produit créé avec l'ID : $PRODUCT_ID"

# 2. Récupérer tous les produits
echo -e "\n\n--- 2. Récupération de tous les produits ---"
curl -s -X GET "$BASE_URL_PRODUCT/products" | jq .

# 3. Récupérer le produit par ID
echo -e "\n\n--- 3. Récupération du produit avec l'ID $PRODUCT_ID ---"
curl -s -X GET "$BASE_URL_PRODUCT/products/$PRODUCT_ID" | jq .

# 4. Mettre à jour le produit
echo -e "\n\n--- 4. Mise à jour du produit $PRODUCT_ID ---"
UPDATE_PAYLOAD='{"name": "Super Widget MK2", "description": "Une version améliorée.", "price": 129.99, "stock": 99, "category": "ELECTRONICS"}'
curl -s -X PUT -H "Content-Type: application/json" -d "$UPDATE_PAYLOAD" "$BASE_URL_PRODUCT/products/$PRODUCT_ID" | jq .

# 5. Mettre à jour le stock du produit
echo -e "\n\n--- 5. Mise à jour du stock pour le produit $PRODUCT_ID ---"
curl -s -X PATCH -H "Content-Type: application/json" -d '{"stock": 75}' "$BASE_URL_PRODUCT/products/$PRODUCT_ID/stock" | jq .

# 6. Supprimer le produit (nettoyage)
echo -e "\n\n--- 6. Suppression du produit $PRODUCT_ID ---"
# Pour les besoins du test, on ne peut supprimer un produit que s'il n'est dans aucune commande.
# On suppose ici qu'il peut être supprimé.
curl -s -X DELETE "$BASE_URL_PRODUCT/products/$PRODUCT_ID"
echo -e "\nProduit supprimé."


echo -e "\n\n--------------------------------------------------"
echo "----------- DÉBUT DES TESTS DE VALIDATION NÉGATIVE -----------"
echo "--------------------------------------------------"

# 7. Tenter de créer un produit avec un nom trop court
echo -e "\n\n--- 7. Test : Création avec un nom trop court (attendu : Erreur 400) ---"
SHORT_NAME_PAYLOAD='{"name": "S", "description": "Description valide.", "price": 10.0, "stock": 10, "category": "OTHER"}'
curl -i -s -X POST -H "Content-Type: application/json" -d "$SHORT_NAME_PAYLOAD" "$BASE_URL_PRODUCT/products"

# 8. Tenter de créer un produit avec un prix négatif
echo -e "\n\n--- 8. Test : Création avec un prix négatif (attendu : Erreur 400) ---"
NEGATIVE_PRICE_PAYLOAD='{"name": "Produit Pas Cher", "description": "Vraiment pas cher du tout.", "price": -5.0, "stock": 10, "category": "OTHER"}'
curl -i -s -X POST -H "Content-Type: application/json" -d "$NEGATIVE_PRICE_PAYLOAD" "$BASE_URL_PRODUCT/products"

echo -e "\n\n--------------------------------------------------"
echo "------------ FIN DES TESTS DE VALIDATION NÉGATIVE ------------"
echo "--------------------------------------------------"


echo -e "\n\n=================================================="
echo "=========== PRODUCT TESTS COMPLETED ============"
echo "=================================================="
