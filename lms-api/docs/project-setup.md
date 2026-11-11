# Fondations API LMS

## 1. Présentation du projet

Ce projet consiste à mettre en place les fondations d'une API REST pour un Learning Management System (LMS).

L'objectif de cette étape est de préparer l'environnement de développement et la configuration nécessaire pour exécuter l'application.

## 2. Technologies utilisées

- Node.js
- Express.js
- MongoDB
- Docker
- Docker Compose
- npm

## 3. Configuration du projet

Les éléments suivants ont été mis en place :

- Initialisation du projet Node.js.
- Configuration des dépendances dans `package.json`.
- Gestion des dépendances avec `package-lock.json`.
- Création du `Dockerfile` pour construire l'image de l'API.
- Création du fichier `docker-compose.yml` pour gérer les conteneurs de l'API et de MongoDB.
- Configuration des fichiers ignorés par Docker avec `.dockerignore`.
- Préparation de la configuration des variables d'environnement.

## 4. Prérequis

Avant de démarrer le projet, il faut installer :

- Docker Desktop
- Git

## 5. Installation et démarrage

Cloner le dépôt :

```bash
git clone <URL_DU_DEPOT>
```

Entrer dans le dossier du projet :

```bash
cd fondations_API_LMS
```

Construire et démarrer les conteneurs :

```bash
docker compose up -d --build
```

Vérifier l'état des conteneurs :

```bash
docker compose ps
```

Afficher les logs :

```bash
docker compose logs -f
```

Arrêter les conteneurs :

```bash
docker compose down
```

## 6. Configuration de l'environnement

Les variables d'environnement sont utilisées pour configurer l'application, notamment :

- `PORT` : port utilisé par l'API.
- `MONGO_URI` : chaîne de connexion à MongoDB.
- `JWT_SECRET` : clé secrète utilisée pour les fonctionnalités JWT.
- `JWT_EXPIRES_IN` : durée de validité du token.

Les valeurs sensibles ne doivent pas être publiées dans le dépôt Git. Utiliser un fichier `.env` local et fournir uniquement des exemples de configuration dans `.env.example`.

## 7. Objectif de cette étape

Cette branche est consacrée à la mise en place du socle technique du projet. Les fonctionnalités métier de l'API seront développées dans des étapes ultérieures.