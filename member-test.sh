#!/bin/bash

# Ce script teste les points d'accès du microservice ms-membership.
# Assurez-vous que l'environnement Docker est en cours d'exécution.
# Nécessite 'jq' (sudo apt-get install jq).

BASE_URL_MEMBERSHIP="http://localhost/api/membership/api/v1"

echo "=================================================="
echo "=============== TESTING ms-membership ==============="
echo "=================================================="

# 1. Créer un nouvel utilisateur
echo -e "\n\n--- 1. Création d'un nouvel utilisateur ---"
USER_PAYLOAD='{"firstName": "Test", "lastName": "User", "email": "testuser'$$'@example.com"}'
CREATED_USER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$USER_PAYLOAD" "$BASE_URL_MEMBERSHIP/users")
echo "Réponse du serveur : $CREATED_USER_RESPONSE"
USER_ID=$(echo "$CREATED_USER_RESPONSE" | jq -r '.id')

if [ -z "$USER_ID" ] || [ "$USER_ID" == "null" ]; then
    echo "Erreur : Impossible de créer l'utilisateur ou d'extraire l'ID. Arrêt des tests."
    exit 1
fi

echo "Utilisateur créé avec l'ID : $USER_ID"

# 2. Récupérer tous les utilisateurs
echo -e "\n\n--- 2. Récupération de tous les utilisateurs ---"
curl -s -X GET "$BASE_URL_MEMBERSHIP/users" | jq .

# 3. Récupérer l'utilisateur par ID
echo -e "\n\n--- 3. Récupération de l'utilisateur avec l'ID $USER_ID ---"
curl -s -X GET "$BASE_URL_MEMBERSHIP/users/$USER_ID" | jq .

# 4. Mettre à jour l'utilisateur
echo -e "\n\n--- 4. Mise à jour de l'utilisateur avec l'ID $USER_ID ---"
UPDATED_USER_PAYLOAD='{"firstName": "Updated", "lastName": "User", "email": "updated'$$'@example.com"}'
curl -s -X PUT -H "Content-Type: application/json" -d "$UPDATED_USER_PAYLOAD" "$BASE_URL_MEMBERSHIP/users/$USER_ID" | jq .

# 5. Désactiver l'utilisateur
echo -e "\n\n--- 5. Désactivation de l'utilisateur avec l'ID $USER_ID ---"
curl -s -X PATCH "$BASE_URL_MEMBERSHIP/users/$USER_ID/deactivate" | jq .

# 6. Supprimer l'utilisateur
echo -e "\n\n--- 6. Suppression de l'utilisateur avec l'ID $USER_ID ---"
curl -s -X DELETE "$BASE_URL_MEMBERSHIP/users/$USER_ID"
echo -e "\nUtilisateur supprimé."


echo -e "\n\n--------------------------------------------------"
echo "----------- DÉBUT DES TESTS DE VALIDATION NÉGATIVE -----------"
echo "--------------------------------------------------"

# 7. Tenter de créer un utilisateur avec un email invalide
echo -e "\n\n--- 7. Test : Création avec email invalide (attendu : Erreur 400) ---"
INVALID_EMAIL_PAYLOAD='{"firstName": "Invalid", "lastName": "Email", "email": "not-an-email"}'
curl -i -s -X POST -H "Content-Type: application/json" -d "$INVALID_EMAIL_PAYLOAD" "$BASE_URL_MEMBERSHIP/users"

# 8. Tenter de créer un utilisateur avec un champ manquant (lastName)
echo -e "\n\n--- 8. Test : Création avec champ obligatoire manquant (attendu : Erreur 400) ---"
MISSING_FIELD_PAYLOAD='{"firstName": "Missing", "email": "missing@example.com"}'
curl -i -s -X POST -H "Content-Type: application/json" -d "$MISSING_FIELD_PAYLOAD" "$BASE_URL_MEMBERSHIP/users"

echo -e "\n\n--------------------------------------------------"
echo "------------ FIN DES TESTS DE VALIDATION NÉGATIVE ------------"
echo "--------------------------------------------------"


echo -e "\n\n=================================================="
echo "============ MEMBERSHIP TESTS COMPLETED ============"
echo "=================================================="