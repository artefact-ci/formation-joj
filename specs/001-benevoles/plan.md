# 001 — Bénévoles : ouvrir un créneau et s'y inscrire : plan

**Statut** : Validé

## 1. Résumé

On construit le module `volunteers` de l'API, qui permet d'ouvrir un créneau de bénévolat pour une discipline et d'y inscrire des bénévoles. À la fin, un responsable ouvre un créneau par l'API, et un bénévole s'y inscrit avec son nom et son email ; l'API refuse toute inscription sur un créneau complet avec `409 SLOT_FULL`, et chaque réponse dit combien de places il reste. Le travail tient en quatre tâches, une par couche : le domaine, les cas d'usage, la base, puis les routes HTTP. La consultation d'un créneau, le refus d'un email déjà inscrit, la désinscription et l'écran sont laissés aux tranches 2 et 3.

Les mots de la spec et leur nom dans le code :

| Dans la spec      | Dans le code        | Ce que c'est                                                  |
| ----------------- | ------------------- | ------------------------------------------------------------- |
| créneau           | `Slot`              | une plage horaire d'une discipline, avec une capacité         |
| capacité          | `capacity`          | le nombre maximal de bénévoles inscrits sur un créneau        |
| inscription       | `Registration`      | un bénévole (nom, email) inscrit sur un créneau               |
| places restantes  | `remainingPlaces`   | la capacité moins le nombre d'inscriptions du créneau         |
| ouvrir un créneau | `OpenSlot`          | le cas d'usage qui crée un créneau                            |
| s'inscrire        | `RegisterVolunteer` | le cas d'usage qui inscrit un bénévole, ou refuse `SLOT_FULL` |

## 2. Fichiers par couche

On crée le module `volunteers`, organisé comme le module Disciplines : un dossier par couche dans `apps/api/src/modules/volunteers/`.

- **shared** : `packages/shared/src/volunteers.ts` contient les schémas Zod : `openSlotSchema` (discipline, début, fin après le début, capacité entière d'au moins 1), `slotSchema`, `slotIdParamsSchema`, `registerVolunteerSchema` (nom non vide, email valide) et `registrationSchema`. Il est exporté par `packages/shared/src/index.ts`.
- **domain** : `domain/volunteers.errors.ts` définit `VolunteerError` et ses codes (section 4). `domain/slot.ts` définit l'entité `Slot` : `Slot.create()` vérifie la capacité et les horaires, `Slot.restore()` la relit avec son nombre d'inscrits, `slot.register()` crée une `Registration` ou lève `SLOT_FULL`, et `slot.remainingPlaces` donne les places restantes. `domain/registration.ts` définit l'entité `Registration` (nom sans espaces autour et non vide, email bien formé). Leurs tests : `domain/slot.spec.ts` et `domain/registration.spec.ts`.
- **application** : `application/slot.repository.ts` est le port `SlotRepository` : `disciplineExists(id)`, `insert(slot)`, `findById(id)` (le créneau avec son nombre d'inscrits) et `addRegistration(registration)`, qui lève `SLOT_FULL` si le créneau s'est rempli entre-temps. `application/testing/in-memory-slot.repository.ts` en est le fake. `application/use-cases/open-slot.ts` et `application/use-cases/register-volunteer.ts` sont les deux cas d'usage. Leur test : `application/volunteers.application.spec.ts`.
- **infra** : `infra/volunteers.schema.ts` déclare les tables `slots` et `registrations`. `infra/slot.mapper.ts` passe d'une ligne à l'entité et inversement. `infra/drizzle-slot.repository.ts` implémente le port ; `addRegistration` verrouille la ligne du créneau dans une transaction, recompte les inscrits, puis insère. Son test : `infra/drizzle-slot.repository.int.spec.ts`.
- **http** : `http/slots.controller.ts` est un controller fin, et `volunteers.module.ts` relie le port à son implémentation Drizzle ; il est ajouté aux `imports` de `apps/api/src/app.module.ts`. Les routes :
  - `POST /api/creneaux` ouvre un créneau ; réponse `201` avec le créneau (`id`, `disciplineId`, `startsAt`, `endsAt`, `capacity`, `remainingPlaces`, `createdAt`).
  - `POST /api/creneaux/:id/inscriptions` inscrit un bénévole ; réponse `201` avec l'inscription (`id`, `slotId`, `name`, `email`, `registeredAt`) et les places restantes du créneau (`remainingPlaces`).
- **web** : rien, l'écran est hors périmètre.

## 3. Données

On stocke les créneaux et les inscriptions. Migration : `pnpm db:generate --name=create_volunteers`.

- `slots` : `id` (uuid, clé primaire), `discipline_id` (uuid, clé étrangère vers `disciplines.id` : un créneau appartient à une discipline existante), `starts_at` et `ends_at` (timestamptz, précision 3), `capacity` (integer), `created_at`. Une contrainte `CHECK` garantit `capacity >= 1` et `ends_at > starts_at`, en plus du domaine.
- `registrations` : `id` (uuid, clé primaire), `slot_id` (uuid, clé étrangère vers `slots.id` : une inscription appartient à un créneau existant), `name` (varchar 100), `email` (varchar 254), `registered_at`. Le nombre d'inscrits d'un créneau se compte sur cette table ; il n'est pas stocké.

## 4. Erreurs

Chaque refus de la spec devient une erreur métier (`VolunteerError`, qui dérive d'`AppError`). Une entrée HTTP invalide est d'abord refusée par le schéma Zod (`400 VALIDATION_FAILED`) ; les codes de validation du domaine protègent les mêmes règles quand le domaine est appelé sans passer par HTTP.

| Code AppError             | Catégorie  | HTTP | Quand                                            | Scénario |
| ------------------------- | ---------- | ---- | ------------------------------------------------ | -------- |
| `SLOT_CAPACITY_INVALID`   | VALIDATION | 400  | la capacité n'est pas un entier d'au moins 1     | AS2      |
| `SLOT_TIME_RANGE_INVALID` | VALIDATION | 400  | la fin n'est pas après le début                  | AS2      |
| `DISCIPLINE_NOT_FOUND`    | NOT_FOUND  | 404  | on ouvre un créneau pour une discipline inconnue | AS3      |
| `SLOT_FULL`               | CONFLICT   | 409  | on inscrit quelqu'un sur un créneau complet      | AS6      |
| `SLOT_NOT_FOUND`          | NOT_FOUND  | 404  | on s'inscrit sur un créneau inconnu              | AS7      |
| `VOLUNTEER_NAME_REQUIRED` | VALIDATION | 400  | le nom est vide ou fait seulement d'espaces      | AS8      |
| `VOLUNTEER_EMAIL_INVALID` | VALIDATION | 400  | l'email est mal formé                            | AS8      |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit, et par un test e2e pour le statut HTTP.

| Scénario | Fichier de test                                              | Niveau             | Ce que le test vérifie                                                                                            |
| -------- | ------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| AS1      | `volunteers.application.spec.ts`, `test/slots.e2e.spec.ts`   | application, e2e   | le créneau est enregistré ; `201` avec ses champs et `remainingPlaces: 2`                                         |
| AS2      | `domain/slot.spec.ts`, `volunteers.application.spec.ts`, e2e | unitaire, app, e2e | capacité 0, -1, 1,5, fin égale ou avant le début refusées ; rien n'est enregistré ; capacité 1 acceptée ; `400`   |
| AS3      | `volunteers.application.spec.ts`, `test/slots.e2e.spec.ts`   | application, e2e   | `DISCIPLINE_NOT_FOUND`, aucun créneau enregistré ; `404`                                                          |
| AS4      | `domain/slot.spec.ts`, `test/slots.e2e.spec.ts`              | unitaire, e2e      | l'inscription est acceptée, 1 place restante ; `201` et `remainingPlaces: 1`                                      |
| AS5      | `domain/slot.spec.ts`, `test/slots.e2e.spec.ts`              | unitaire, e2e      | la dernière inscription est acceptée, 0 place ; `201` et `remainingPlaces: 0`                                     |
| AS6      | `domain/slot.spec.ts`, application, int, e2e                 | tous               | `SLOT_FULL` ; toujours 2 inscrits ; deux inscriptions simultanées sur la dernière place : une seule passe ; `409` |
| AS7      | `volunteers.application.spec.ts`, `test/slots.e2e.spec.ts`   | application, e2e   | `SLOT_NOT_FOUND` ; `404`                                                                                          |
| AS8      | `domain/registration.spec.ts`, application, e2e              | unitaire, app, e2e | nom vide, nom d'espaces, email mal formé refusés ; personne inscrit ; `400`                                       |

## 6. Tâches

- [x] T01 [001-AS2, AS4, AS5, AS6, AS8] Écrire d'abord `domain/slot.spec.ts` et `domain/registration.spec.ts` (« 001-AS2: … »), puis les schémas de `packages/shared/src/volunteers.ts`, `volunteers.errors.ts`, `slot.ts` et `registration.ts`
- [ ] T02 [001-AS1, AS2, AS3, AS6, AS7, AS8] Écrire d'abord `application/volunteers.application.spec.ts` (« 001-AS1: … »), puis le port `SlotRepository`, son fake en mémoire, `OpenSlot` et `RegisterVolunteer`
- [ ] T03 [001-AS1, AS6] Écrire d'abord `infra/drizzle-slot.repository.int.spec.ts` (« 001-AS6: … »), puis `volunteers.schema.ts`, la migration, `slot.mapper.ts` et `drizzle-slot.repository.ts`
- [ ] T04 [001-AS1, AS2, AS3, AS4, AS5, AS6, AS7, AS8] Écrire d'abord `apps/api/test/slots.e2e.spec.ts` (« 001-AS1: … »), puis `slots.controller.ts`, `volunteers.module.ts` et son ajout à `app.module.ts`
