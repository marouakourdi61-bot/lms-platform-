# LMS API

API REST de gestion de formation en ligne (Learning Management System), développée avec **Node.js, Express 5, MongoDB et Mongoose**.

La plateforme permet à trois rôles principaux de collaborer :

Frontend developers: start with the [React API contract](docs/react-api-contract.md)
for endpoint cards, authentication, response formats, demo setup and integration gaps.
Reviewers can use the [contract handoff](docs/react-api-contract-handoff.md)
for the backend comparison, verification evidence and remaining delivery steps.
Brief 3 review tracking: see the [cross-review evidence register](docs/cross-review-evidence.md)
for PR references, evidence gaps and the pre-merge review checkpoints.
The [review delivery status](docs/delivery-review-status.md) records the verified
result and remaining acceptance gaps.

Les développeurs frontend peuvent commencer par le [contrat API React](docs/react-api-contract.md). Les relecteurs peuvent consulter le [handoff du contrat](docs/react-api-contract-handoff.md).

---

## 1. Technologies principales

- Node.js 20
- Express 5
- MongoDB 7 et Mongoose
- JWT pour l'authentification
- bcrypt pour le hachage des mots de passe
- Zod pour la validation des requêtes
- Multer pour l'envoi de fichiers
- node-cron pour les tâches planifiées
- Nodemailer pour l'envoi d'emails
- Jest et Supertest pour les tests
- Swagger/OpenAPI pour la documentation interactive

## 2. Architecture du projet

Le serveur suit une architecture MVC légère.

```text
Requête HTTP
    |
    v
routes/          Sélection des endpoints et middlewares
    |
    v
validators/      Validation des données avec Zod
    |
    v
controllers/     Gestion des requêtes et des réponses
    |
    v
services/        Logique métier
    |
    v
models/          Schémas et modèles Mongoose
    |
    v
MongoDB
```

### Principaux dossiers et fichiers

| Dossier / fichier | Responsabilité |
|---|---|
| `app.js` | Construction de l'application Express, montage des routes et Swagger |
| `server.js` | Connexion MongoDB, démarrage du serveur et du scheduler |
| `config/` | Configuration de la base de données |
| `routes/` | Définition des endpoints et middlewares |
| `controllers/` | Traitement des requêtes HTTP |
| `validators/` | Validation des données avec Zod |
| `services/` | Logique métier, progression, emails, notifications et jobs |
| `models/` | Modèles et schémas Mongoose |
| `middlewares/` | Authentification, autorisations, validation et gestion des erreurs |
| `scripts/` | Déclenchement manuel des jobs en ligne de commande |
| `templates/email/` | Modèles HTML des emails |
| `tests/` | Tests unitaires et d'intégration |
| `seed/` | Données de démonstration |
| `uploads/` | Fichiers téléversés localement |
| `docs/` | Documentation API, contrats et documents de vérification |

Les commentaires Swagger sont placés à proximité des routes. Le fichier `docs/swagger.js` collecte les blocs `@swagger` présents dans `routes/*.js`.

## 3. Prérequis

Avant de démarrer le projet, installer :

- Node.js 20 ou une version compatible.
- npm.
- MongoDB accessible localement ou via Docker.
- Docker Desktop si le projet est lancé avec Docker Compose.

## 4. Installation et démarrage local

### 4.1 Installation des dépendances

Depuis la racine du projet :

```bash
npm ci
```

Créer le fichier `.env` à partir du fichier d'exemple :

```powershell
Copy-Item .env.example .env
```

Si un fichier `.env` existe déjà, le conserver et mettre à jour uniquement les valeurs nécessaires.

### 4.2 Configuration des variables d'environnement

Configurer les variables suivantes dans `.env` :

| Variable | Utilisation |
|---|---|
| `PORT` | Port HTTP de l'API, 3000 par défaut |
| `MONGO_URI` | URI de connexion à la base MongoDB |
| `MONGO_TEST_URI` | URI de connexion à la base réservée aux tests |
| `JWT_SECRET` | Secret de signature et de vérification des tokens JWT |
| `JWT_EXPIRES_IN` | Durée de validité du token, par exemple `1h` ou `1d` |
| `SEED_DEMO_PASSWORD` | Mot de passe des comptes de démonstration |
| `SMTP_HOST` | Serveur SMTP |
| `SMTP_PORT` | Port SMTP |
| `SMTP_USER` | Identifiant SMTP |
| `SMTP_PASS` | Mot de passe SMTP |
| `EMAIL_FROM` | Adresse expéditrice des emails |

Exemples d'URI MongoDB :

```env
MONGO_URI=mongodb://localhost:27018/lms
MONGO_TEST_URI=mongodb://127.0.0.1:27018/lms_test
```

**Important :**
- Ne jamais committer le fichier `.env`.
- Utiliser un secret JWT suffisamment long et aléatoire.
- Ne jamais publier les identifiants SMTP.
- La base de test doit être différente de la base de développement.

### 4.3 Démarrer l'application

Avec redémarrage automatique pendant le développement :

```bash
npm run dev
```

Sans redémarrage automatique :

```bash
npm start
```

L'API est disponible à :

```text
http://localhost:3000
```

La documentation Swagger est disponible à :

```text
http://localhost:3000/api-docs
```

## 5. Authentification et parcours d'apprentissage

### 5.1 Création d'un compte

Endpoint :

```http
POST /api/auth/register
```

Corps de la requête :

```json
{
  "name": "Test Learner",
  "email": "learner@example.com",
  "password": "Password123!"
}
```

L'inscription crée un compte avec le rôle `learner`. Le mot de passe est haché avant son stockage.

### 5.2 Connexion

Endpoint :

```http
POST /api/auth/login
```

La connexion retourne un token JWT.

Pour les routes protégées, ajouter l'en-tête :

```http
Authorization: Bearer <token>
```

Dans Swagger, utiliser le bouton **Authorize** pour renseigner le token.

### 5.3 Parcours de l'apprenant

Le parcours standard est le suivant :

1. Créer un compte apprenant.
2. Se connecter et récupérer le token JWT.
3. Consulter les cours publiés.
4. S'inscrire à un cours publié.
5. Consulter les modules publiés.
6. Consulter les ressources des modules.
7. Marquer les ressources comme consultées.
8. Compléter les modules dans l'ordre requis.
9. Consulter la progression ou les informations de reprise.

### 5.4 Calcul de la progression

La progression prend en compte les modules publiés et les ressources appartenant à ces modules.

Chaque module publié et chaque ressource de ces modules ont le même poids.

```text
percentage =
    (completed modules + consulted resources)
    / (published modules + their resources)
    * 100
```

Le résultat est arrondi à deux décimales.

- Un cours vide retourne une progression de 0 %.
- Les ressources doivent être consultées avant la validation du module.
- Lorsqu'un module précédent existe, il doit être complété avant le suivant.
- La lecture de la progression ou des informations de reprise recalcule et enregistre le pourcentage.
- L'inscription passe au statut `completed` lorsque la progression atteint 100 %.

### 5.5 Rôles et autorisations

La plateforme utilise trois rôles :

| Rôle | Responsabilités principales |
|---|---|
| `learner` | Consulter les cours, s'inscrire, consulter les ressources et suivre sa progression |
| `trainer` | Gérer ses cours, modules et ressources, et suivre ses apprenants |
| `admin` | Gérer la configuration globale et les tâches administratives |

Il n'existe pas d'endpoint public permettant de promouvoir un utilisateur vers un autre rôle. Les comptes formateurs et administrateurs doivent exister avant de pouvoir utiliser leurs fonctionnalités.

## 6. Routes API principales

La documentation Swagger décrit les corps des requêtes, paramètres, réponses et exigences d'authentification.

Les routes ci-dessous correspondent aux endpoints décrits dans le contrat actuel.

### 6.1 Authentification

| Méthode | Endpoint | Accès |
|---|---|---|
| POST | `/api/auth/register` | Public : inscription |
| POST | `/api/auth/login` | Public : connexion |
| GET | `/api/auth/me` | Authentifié : profil connecté |

### 6.2 Cours

| Méthode | Endpoint | Accès |
|---|---|---|
| GET | `/api/courses` | Public : catalogue des cours publiés |
| GET | `/api/courses/:id` | Public : détail d'un cours |
| POST | `/api/courses` | Formateur : création d'un cours brouillon |
| PUT | `/api/courses/:id` | Formateur propriétaire : modification |
| DELETE | `/api/courses/:id` | Formateur propriétaire : suppression |
| PATCH | `/api/courses/:id/:status` | Formateur propriétaire : changement de statut |

Le catalogue accepte notamment les filtres de catégorie, niveau, mot-clé et tri `sortBy`.

### 6.3 Modules

| Méthode | Endpoint | Accès |
|---|---|---|
| GET | `/api/courses/:id/modules` | Apprenant inscrit activement : modules publiés |
| POST | `/api/courses/:courseId/modules` | Formateur : création |
| PUT | `/api/courses/modules/:moduleId` | Formateur : modification |
| DELETE | `/api/courses/modules/:moduleId` | Formateur : suppression |
| PATCH | `/api/courses/modules/:moduleId/status/:status` | Formateur propriétaire : changement de statut |

### 6.4 Ressources

| Méthode | Endpoint | Accès |
|---|---|---|
| GET | `/api/modules/:id/resources` | Consultation publique |
| POST | `/api/modules/:id/resources` | Formateur : création d'une ressource URL |
| PUT | `/api/modules/:id/resources/:resourceId` | Formateur : modification |
| DELETE | `/api/modules/:id/resources/:resourceId` | Formateur : suppression |
| POST | `/api/modules/:id/resources/upload` | Formateur propriétaire : téléversement |

Le téléversement accepte les fichiers PDF, JPEG et PNG jusqu'à 5 MiB.

Les URL des fichiers téléversés correspondent à des chemins de stockage locaux. Aucune route de téléchargement dédiée n'est exposée dans le contrat actuel.

### 6.5 Inscriptions

| Méthode | Endpoint | Accès |
|---|---|---|
| POST | `/api/courses/:courseId/enroll` | Utilisateur authentifié |
| GET | `/api/enrollments/me` | Authentifié : propres inscriptions |

### 6.6 Progression et reprise

| Méthode | Endpoint | Accès |
|---|---|---|
| POST | `/api/modules/:resourceId/consult` | Apprenant inscrit activement |
| POST | `/api/modules/:moduleId/complete` | Apprenant inscrit activement |
| GET | `/api/courses/:courseId/progress` | Inscription active ou terminée |
| GET | `/api/courses/:courseId/resume` | Inscription active ou terminée |

### 6.7 Espace formateur

| Méthode | Endpoint | Accès |
|---|---|---|
| GET | `/api/trainer/courses` | Formateur : ses cours |
| GET | `/api/trainer/courses/:courseId/learners` | Formateur propriétaire |
| GET | `/api/trainer/courses/:courseId/learners/:learnerId/progress` | Formateur propriétaire |

La liste des cours du formateur accepte un filtre optionnel par statut.

### 6.8 Quiz, feedback et configuration

Les fonctionnalités de quiz, tentatives, feedbacks, configuration des notifications et gestion des jobs sont également présentes dans le projet.

Pour leurs endpoints, paramètres et permissions exacts, consulter Swagger :

```text
http://localhost:3000/api-docs
```

### 6.9 Endpoints de diagnostic

Les endpoints suivants sont publics :

```http
GET /
GET /api/modules/test
```

Ils retournent des messages de diagnostic et ne constituent pas des vérifications complètes de l'état de MongoDB.

## 7. Comportements et limites actuels de l'API

Les points suivants sont importants pour les développeurs frontend et les personnes qui intègrent l'API.

- La création, la modification et la suppression des modules vérifient le rôle formateur, mais ne vérifient pas systématiquement la propriété du cours.
- La création d'un module ne vérifie pas l'existence du cours.
- La création, la modification et la suppression des ressources URL vérifient le rôle formateur sans vérification systématique de propriété.
- La modification du statut d'un module utilise actuellement le validateur de création, qui exige un corps complet.
- La suppression d'un cours est bloquée lorsqu'il possède des modules ou des inscriptions.
- La suppression d'une ressource est bloquée lorsqu'une progression apprenant existe.
- La suppression d'un module ne possède pas de vérification des dépendances ni de nettoyage en cascade.
- La consultation, la validation et la liste des modules exigent une inscription active.
- La progression et la reprise acceptent une inscription active ou terminée.

### Gestion des erreurs et formats de réponse

Le gestionnaire d'erreurs accepte `error.statusCode` et `error.status`.

Les erreurs attendues de progression, reprise et suivi formateur conservent leurs statuts 403 ou 404 lorsqu'ils sont déclarés. Les erreurs serveur inattendues retournent un message générique.

Les formats de réponse ne sont pas uniformes dans toutes les routes :

- La majorité des réponses encapsulent les résultats dans `data`.
- La création d'une inscription utilise `enrollment`.
- La liste des propres inscriptions retourne directement un tableau.

Le frontend doit donc respecter les formats définis par chaque endpoint dans Swagger et dans le contrat API.

## 8. Notifications et tâches planifiées

La configuration des notifications et des jobs est stockée dans MongoDB dans un document `NotificationConfig` identifié par :

```text
key: "global"
```

### 8.1 Configuration des notifications

Les principaux paramètres sont :

| Paramètre | Rôle |
|---|---|
| `notifications.enabled` | Active ou désactive globalement les emails |
| `notifications.emailDriver` | Sélectionne le driver email |
| `jobs.<job>.enabled` | Active ou désactive la programmation du job |
| `jobs.<job>.frequency` | Expression cron de la fréquence |
| `jobs.inactiveLearnerReminder.inactiveDays` | Seuil d'inactivité des apprenants |

La configuration globale est créée automatiquement si elle n'existe pas. Les valeurs par défaut du modèle sont utilisées lors de cette création.

### 8.2 Drivers email

Trois valeurs sont déclarées dans le modèle :

| Driver | Fonctionnement |
|---|---|
| `log` | Affiche les informations de l'email dans la console |
| `sandbox` | Utilise Nodemailer et une connexion SMTP de test, par exemple Mailtrap |
| `smtp` | Valeur déclarée dans le modèle, mais non prise en charge actuellement par `emailService.js` |

Le driver est sélectionné par `notifications.emailDriver` dans MongoDB. La variable `EMAIL_DRIVER` du fichier `.env` ne remplace pas cette configuration dans le service actuel.

Le driver `sandbox` utilise les variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` et `EMAIL_FROM`.

**Attention :** les emails du driver `log` sont uniquement journalisés dans le terminal. Pour tester Mailtrap, sélectionner `sandbox` dans la configuration globale et vérifier les identifiants SMTP.

### 8.3 Jobs disponibles

| Job | Fréquence par défaut | Fonction |
|---|---|---|
| `inactiveLearnerReminder` | `0 9 * * *` | Rappel des apprenants inactifs |
| `trainerSummary` | `0 10 * * 1` | Résumé périodique des formateurs |
| `statsRefresh` | `0 * * * *` | Actualisation des statistiques |

Les jobs utilisent le fuseau horaire :

```text
Africa/Casablanca
```

L'ordonnanceur programme uniquement les jobs dont le champ `enabled` vaut `true`.

### 8.4 Déclenchement manuel des jobs

Les commandes CLI disponibles sont :

```bash
npm run jobs:inactive-reminders
npm run jobs:trainer-summary
npm run jobs:stats
```

Les routes HTTP manuelles sont réservées aux administrateurs :

```http
POST /api/jobs/inactive-reminders/run
POST /api/jobs/trainer-summary/run
POST /api/jobs/stats/run
```

Les préfixes `/api/jobs/` et `/api/admin/jobs/` exposent les routes protégées décrites dans le projet.

La route générique accepte les noms internes :

```text
inactiveLearnerReminder
trainerSummary
statsRefresh
```

### 8.5 Historique des exécutions

Chaque job passe par le service `jobExecutionService`.

MongoDB conserve les informations dans le modèle `JobExecution` :

- Nom du job.
- Statut : `running`, `success` ou `failed`.
- Date de début et date de fin.
- Résultat métier en cas de succès.
- Message d'erreur en cas d'échec.

Les logs utilisent les préfixes :

```text
[JOB START]
[JOB SUCCESS]
[JOB FAILED]
```

Les routes HTTP et les scripts CLI utilisent le même wrapper métier `runJob`.

L'historique est consultable par les administrateurs :

```http
GET /api/config/job-executions?limit=20
```

Une modification de configuration via `PATCH /api/config/notifications` déclenche un rafraîchissement du scheduler.

## 9. Docker

Le projet peut être lancé avec Docker Compose depuis la racine.

### 9.1 Démarrage

Configurer `.env`, puis exécuter :

```bash
docker compose up -d --build
```

Ports exposés :

| Service | Port |
|---|---|
| API | 3000 |
| MongoDB depuis l'hôte | 27018 |

Dans le réseau Docker Compose, l'API utilise :

```text
mongodb://mongo:27017/lms
```

Depuis l'hôte, par exemple avec MongoDB Compass ou une API lancée localement :

```text
mongodb://localhost:27018/lms
```

### 9.2 Reconstruire l'API

Le code source n'est pas monté directement dans le conteneur API. Après une modification du code ou de Swagger, reconstruire l'image :

```bash
docker compose up -d --build --no-deps api
```

### 9.3 Consulter les logs

```bash
docker compose ps
docker compose logs --tail=100 api
docker compose logs --tail=100 mongo
```

### 9.4 Arrêter les services

```bash
docker compose down
```

Les données MongoDB sont conservées dans le volume `mongo_data`.

**Attention :** les fichiers uploadés ne disposent pas actuellement d'un volume Docker configuré. Ils peuvent donc être perdus lors de la recréation du conteneur API.

**Configuration SMTP dans Docker :** les variables SMTP doivent être transmises au conteneur dans `docker-compose.yml` ou injectées dans son environnement. Leur présence dans le `.env` de l'hôte ne garantit pas qu'elles soient accessibles au conteneur.

## 10. Tests

Les tests utilisent une base MongoDB distincte de la base de développement.

Base de test par défaut :

```text
lms_test
```

Avec MongoDB Compose actif, sous PowerShell :

```powershell
$env:MONGO_TEST_URI = "mongodb://localhost:27018/lms_test"
npm test
```

Pour exécuter uniquement les tests d'inscription :

```bash
npm test -- tests/enrollment.test.js
```

Autres suites ciblées :

```bash
npm test -- tests/jobScheduler.test.js
npm test -- tests/jobExecutionService.test.js
npm test -- tests/jobRoutes.test.js
npm test -- tests/trainerSummary.test.js
npm test -- tests/notificationConfig.test.js
npm test -- tests/notificationConfigService.test.js
```

Les tests nécessitent MongoDB et `JWT_SECRET`.

Ils créent et suppriment les données de test dans `lms_test`. Ne jamais utiliser la base de développement comme base de test.

Pour les tests de jobs, vérifier également la présence de `JWT_SECRET` dans l'environnement.

## 11. Données de démonstration (Seed)

Le seed est destiné aux environnements locaux et n'est pas exécuté automatiquement au démarrage.

Commande :

```bash
npm run seed
```

Il nécessite :

- `SEED_DEMO_PASSWORD`, avec au moins huit caractères.
- Une valeur `MONGO_URI` pointant volontairement vers la base de développement sélectionnée.

Le seed crée ou met à jour les comptes de démonstration apprenant, formateur et administrateur.

Il réinitialise leurs mots de passe et remplace les cours d'exemple du formateur de démonstration ainsi que les données d'apprentissage associées.

**Attention :** les identifiants des cours peuvent changer après une réinitialisation du seed. Vérifier les conséquences avant de l'exécuter sur une base contenant des données à conserver.

Consulter le guide [Demo setup and replay](docs/react-api-contract.md#5-demo-setup-and-replay) pour les comptes de démonstration, les impacts et les dépendances d'intégration.

## 12. Modèles MongoDB principaux

Les principaux modèles Mongoose du projet sont :

| Modèle | Responsabilité |
|---|---|
| `User` | Comptes et rôles des utilisateurs |
| `Course` | Formations |
| `Module` | Modules des cours |
| `Resource` | Ressources pédagogiques |
| `Enrollment` | Inscriptions aux cours |
| `ModuleProgress` | Progression des modules |
| `ResourceProgress` | Consultation des ressources |
| `Quiz` | Évaluations |
| `QuizAttempt` | Tentatives et réponses aux quiz |
| `Feedback` | Retours et commentaires |
| `NotificationConfig` | Configuration globale des notifications et jobs |
| `TrainerSummaryPreference` | Préférences des résumés formateurs |
| `JobExecution` | Historique des exécutions des jobs |

## 13. Dépannage courant

### MongoDB n'est pas accessible

Vérifier que MongoDB fonctionne et que le port utilisé correspond au mode de lancement :

- MongoDB local : généralement `27017`.
- MongoDB Compose depuis l'hôte : `27018`.
- MongoDB depuis le conteneur API : `mongo:27017`.

### Les routes protégées retournent 401

Vérifier :

- La présence de l'en-tête `Authorization`.
- Le format `Bearer <token>`.
- La validité du token JWT.
- La cohérence de `JWT_SECRET` entre la génération et la vérification du token.

### Les emails n'arrivent pas dans Mailtrap

Vérifier :

1. `notifications.enabled` dans le document `NotificationConfig`.
2. `notifications.emailDriver` doit être `sandbox`.
3. Les variables SMTP dans `.env`.
4. La validité des identifiants SMTP Mailtrap.
5. La bonne inbox Mailtrap.
6. La présence des variables SMTP dans l'environnement Docker si l'application tourne dans un conteneur.

Le driver `log` affiche uniquement les informations dans le terminal et n'envoie pas d'email via SMTP.

### Les jobs planifiés ne démarrent pas

Vérifier :

- Que le job possède `enabled: true`.
- Que l'expression cron est valide.
- Que le serveur est démarré.
- Que le scheduler a été actualisé après une modification de configuration.
- Que le fuseau `Africa/Casablanca` correspond à l'horaire attendu.

Les scripts manuels peuvent déclencher les handlers même lorsque le job est désactivé. Le handler `inactiveLearnerReminder` vérifie lui-même son activation avant de créer les rappels.

### Docker échoue au démarrage

Consulter :

```bash
docker compose ps
docker compose logs --tail=100 api
docker compose logs --tail=100 mongo
```

Vérifier ensuite les ports, `MONGO_URI`, `JWT_SECRET` et les variables nécessaires aux services.

---

## 14. Documentation complémentaire

Les documents suivants complètent ce README :

- [Contrat API React](docs/react-api-contract.md) : endpoints, authentification, formats de réponse et intégration frontend.
- [Handoff du contrat API](docs/react-api-contract-handoff.md) : comparaison backend/frontend, preuves de vérification et étapes restantes.
- [Swagger UI](http://localhost:3000/api-docs) : documentation interactive des routes disponibles.

---

## 15. Fonctionnalités principales

### Comptes et accès
- Inscription et authentification JWT.
- Hachage sécurisé des mots de passe avec bcrypt.
- Gestion des rôles apprenant, formateur et administrateur.
- Protection des routes par authentification et autorisations.

### Gestion des formations
- Création et gestion des cours.
- Publication et changement de statut.
- Gestion des modules.
- Gestion des ressources URL et fichiers.
- Inscription des apprenants aux cours publiés.

### Apprentissage et progression
- Consultation des ressources.
- Validation des modules.
- Calcul de progression.
- Gestion du point de reprise.
- Suivi des inscriptions et de leur statut.

### Évaluations et feedback
- Gestion des quiz et des tentatives.
- Calcul des scores.
- Stockage des réponses.
- Gestion des retours et commentaires.

### Suivi formateur
- Consultation des cours du formateur.
- Suivi des apprenants inscrits.
- Consultation de leur progression.
- Préférences personnelles pour les résumés formateurs.

### Notifications et statistiques
- Configuration globale des notifications.
- Emails de bienvenue et notifications métier selon les événements configurés.
- Rappels des apprenants inactifs.
- Résumés périodiques des formateurs.
- Actualisation des statistiques.
- Exécution automatique par cron ou manuelle par HTTP et CLI.
- Traçabilité des exécutions dans MongoDB.

---

**LMS API — Backend REST pour une plateforme de formation en ligne.**