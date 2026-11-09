# 001 — Consulter les résultats d'une journée : plan

**Statut** : Validé

## 1. Résumé

On construit le premier module métier du projet, `results`, qui lit en base les épreuves d'un jour et leurs classements, ainsi que la page web `/resultats` qui les affiche avec l'identité visuelle de la maquette. Une fois les tâches terminées, le spectateur choisit un jour et un sport, voit les épreuves regroupées par sport avec leur statut, et lit le classement des épreuves terminées. Le travail est découpé en six tâches, dans l'ordre des couches : domaine, cas d'usage, base de données, route de l'API, fausse API du front, puis écran. Les résultats sont en lecture seule et viennent d'un jeu de démonstration chargé par `pnpm db:seed` ; la saisie, les autres pages de la maquette et le thème sombre sont laissés de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec     | Dans le code       | Ce que c'est                                                                          |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------- |
| Épreuve          | `SportEvent`       | Une compétition d'un sport à une heure donnée, par exemple « 100 m hommes, finale ».  |
| Sport            | `SportSlug`        | Un des 25 sports des Jeux, identifié par un code stable comme `athletisme`.           |
| Statut           | `SportEventStatus` | `scheduled` (Programmé), `in-progress` (En cours) ou `finished` (Terminé).            |
| Classement       | `ranking`          | La liste ordonnée des participations d'une épreuve terminée.                          |
| Participation    | `RankingEntry`     | Une ligne du classement : rang, nation, athlète ou équipe, et performance ou mention. |
| Athlète / équipe | `competitor`       | Le nom affiché pour le participant, sans distinction de type dans cette tranche.      |
| Mention          | `RankingMention`   | `disqualified` (Disqualifié) ou `did-not-finish` (N'a pas terminé).                   |

## 2. Fichiers par couche

On crée le module `results`, organisé comme le module `disciplines` de la branche `main` : un dossier par couche, puis le module ajouté aux `imports` de `apps/api/src/app.module.ts`.

- **shared** : `packages/shared/src/results.ts` contient les listes fermées des sports, des statuts et des mentions, les bornes des Jeux (31 octobre et 13 novembre 2026) et les schémas Zod de la requête et de la réponse. `packages/shared/src/index.ts` l'exporte.
- **domain** : `apps/api/src/modules/results/domain/sport-event.ts` contient l'entité `SportEvent` et son accesseur `ranking`, qui renvoie une liste vide si l'épreuve n'est pas terminée, et sinon les participants classés par rang suivis de ceux qui ont une mention.
- **application** :
  - `application/sport-event.repository.ts` est le port, avec la seule méthode `listByDay(day, sport)`.
  - `application/use-cases/list-day-results.ts` est le cas d'usage `ListDayResults`.
  - `application/testing/in-memory-sport-event.repository.ts` est le repository en mémoire des tests.
- **infra** :
  - `infra/results.schema.ts` décrit les deux tables.
  - `infra/sport-event.mapper.ts` transforme les lignes en entités avec `SportEvent.restore()`.
  - `infra/drizzle-sport-event.repository.ts` implémente le port.
  - `apps/api/data/01-sport_events.json` et `apps/api/data/02-sport_event_entries.json` contiennent le jeu de démonstration.
- **http** : `http/results.controller.ts` expose une seule route, `results.module.ts` relie le port à son implémentation, et l'API reste fine.
  - `GET /api/results?date=2026-11-08&sport=athletisme` lit les épreuves de ce jour, avec un filtre `sport` facultatif. Elle renvoie 200 et une liste triée par sport puis par heure, vide s'il n'y a aucune épreuve.
- **web** :
  - `apps/web/src/features/results/api/results.api.ts` et `results.queries.ts` font l'appel à l'API et gèrent son cache.
  - `apps/web/src/features/results/components/results-page.tsx` assemble la page, avec le jour et le sport gardés dans l'adresse.
  - `components/day-selector.tsx` affiche les jours en pastilles, et `components/sport-event-card.tsx` affiche une épreuve et son classement sur le modèle du bloc « Derniers résultats » de la maquette.
  - `components/result-labels.ts` traduit les statuts, les mentions et les sports en français, et `components/default-day.ts` choisit le jour affiché à l'ouverture.
  - `apps/web/src/routes/resultats.tsx` déclare la page, et `apps/web/src/routes/index.tsx` redirige vers elle tant que l'accueil n'existe pas.
  - `apps/web/src/routes/__root.tsx` reçoit l'en-tête de la maquette, avec `apps/web/public/ayo.png` et le nom des Jeux écrit en texte, et la mention « Données de démonstration ».
  - `apps/web/package.json` reçoit la dépendance `flag-icons`, qui fournit les drapeaux sans appel à un service extérieur.
  - Chaque sport est représenté par une pastille de couleur portant ses initiales, car la maquette ne fournit pas ses icônes en fichiers séparés.
  - `apps/web/src/styles.css` reçoit les couleurs de la maquette : vert `#07834B`, bleu nuit `#11243F`, jaune `#FABB09`, rouge `#DC1B37`, et vert pâle `#E8F7DB` pour les surfaces.
  - `apps/web/src/mocks/handlers.ts` et `fixture.ts` reçoivent la route dans la fausse API, avec son test `handlers.test.ts`.

## 3. Données

On stocke les épreuves et leurs participations ; aucun écran n'y écrit, et seul `pnpm db:seed` les remplit. La migration se génère avec `pnpm db:generate --name=results`.

Table `sport_events` :

- `id` (uuid, clé primaire), `sport` (varchar, vérifié par le schéma partagé à la lecture), `name` (varchar), `status` (varchar, vérifié de la même façon).
- `starts_at` (date et heure avec fuseau). Dakar étant à UTC toute l'année, le jour d'une épreuve se déduit directement de cette valeur.
- Contrainte d'unicité sur `sport`, `name` et `starts_at` : elle empêche qu'une épreuve soit affichée deux fois.

Table `sport_event_entries` :

- `id` (uuid, clé primaire), `event_id` (clé étrangère vers `sport_events`, suppression en cascade) : une participation appartient toujours à une épreuve existante.
- `nation_code` (code pays à deux lettres pour le drapeau), `nation_name`, `competitor`.
- `rank` (entier, facultatif), `performance` (varchar, facultatif, par exemple « 10,28 s »), `mention` (varchar, facultatif).
- Contrainte de vérification : soit `rank` et `performance` sont remplis sans `mention`, soit seule `mention` est remplie. Elle protège la règle du scénario AS5.
- Contrainte d'unicité sur `event_id` et `competitor` : un participant n'apparaît qu'une fois dans un classement.

## 4. Erreurs

La spec ne contient aucun refus métier : une journée sans épreuve renvoie une liste vide, et le front affiche le message du scénario AS6. Aucune sous-classe d'`AppError` n'est donc créée. Une requête mal formée reçoit l'erreur de validation déjà fournie par le socle commun, qui n'a pas de scénario propre.

| Code AppError       | Catégorie  | HTTP | Quand                                                       | Scénario |
| ------------------- | ---------- | ---- | ----------------------------------------------------------- | -------- |
| `VALIDATION_FAILED` | VALIDATION | 400  | La date est absente ou mal écrite, ou le sport est inconnu. | Aucun    |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit.

| Scénario | Fichier de test                                                        | Niveau      | Ce que le test vérifie                                                                                      |
| -------- | ---------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| AS1      | `apps/api/src/modules/results/application/results.application.spec.ts` | unitaire    | Le cas d'usage transmet le jour demandé et rend les épreuves de ce jour.                                    |
| AS1      | `.../infra/drizzle-sport-event.repository.int.spec.ts`                 | intégration | Seules les épreuves du jour reviennent, triées par sport puis par heure.                                    |
| AS1      | `apps/web/src/features/results/components/results-page.test.tsx`       | écran       | Les groupes « Athlétisme » et « Futsal » s'affichent, chaque épreuve avec son nom, son heure et son statut. |
| AS2      | `.../infra/drizzle-sport-event.repository.int.spec.ts`                 | intégration | Le filtre par sport ne rend que ce sport.                                                                   |
| AS2      | `apps/api/test/results.e2e.spec.ts`                                    | e2e         | La route applique le paramètre `sport`.                                                                     |
| AS2      | `.../components/results-page.test.tsx`                                 | écran       | Choisir « Athlétisme » ne laisse que ce groupe.                                                             |
| AS3      | `.../domain/sport-event.spec.ts`                                       | unitaire    | Une épreuve terminée rend ses participants du premier au dernier.                                           |
| AS3      | `apps/api/test/results.e2e.spec.ts`                                    | e2e         | La réponse contient le rang, la nation, le participant et la performance.                                   |
| AS3      | `.../components/results-page.test.tsx`                                 | écran       | Le statut « Terminé » et la ligne « 1, Kenya, Gift Bright, 10,28 s » s'affichent.                           |
| AS4      | `.../domain/sport-event.spec.ts`                                       | unitaire    | Une épreuve `scheduled` ou `in-progress` rend un classement vide.                                           |
| AS4      | `.../components/results-page.test.tsx`                                 | écran       | « Programmé » et « En cours » s'affichent, sans classement ni performance.                                  |
| AS5      | `.../domain/sport-event.spec.ts`                                       | unitaire    | Les participants avec une mention n'ont pas de rang et passent après les classés.                           |
| AS5      | `.../components/results-page.test.tsx`                                 | écran       | « Disqualifié » et « N'a pas terminé » remplacent la performance.                                           |
| AS6      | `.../components/results-page.test.tsx`                                 | écran       | Le message « Aucune épreuve pour ce jour et ce sport » s'affiche.                                           |
| AS7      | `.../components/results-page.test.tsx`                                 | écran       | La mention « Données de démonstration » s'affiche.                                                          |

## 6. Tâches

Six tâches, dans l'ordre des couches. Chaque tâche nomme le test à écrire d'abord et cite les scénarios qu'elle couvre ; elle tient dans un commit.

- [x] T01 [001-AS3, AS4, AS5] Écrire d'abord `domain/sport-event.spec.ts` (« 001-AS3: … », « 001-AS4: … », « 001-AS5: … »), puis `packages/shared/src/results.ts` et l'entité `SportEvent`
- [x] T02 [001-AS1] Écrire d'abord `application/results.application.spec.ts` (« 001-AS1: … »), puis le port, le repository en mémoire et `ListDayResults`
- [x] T03 [001-AS1, AS2] Écrire d'abord `infra/drizzle-sport-event.repository.int.spec.ts` (« 001-AS1: … », « 001-AS2: … »), puis les tables, la migration générée, le mapper et le repository Drizzle
- [x] T04 [001-AS2, AS3] Écrire d'abord `apps/api/test/results.e2e.spec.ts` (« 001-AS2: … », « 001-AS3: … »), puis le controller, le module, son ajout à `app.module.ts` et le jeu de démonstration
- [x] T05 [001-AS1, AS2] Écrire d'abord le test de la route dans `apps/web/src/mocks/handlers.test.ts` (« 001-AS1: … », « 001-AS2: … »), puis la fausse API, `results.api.ts` et `results.queries.ts`
- [x] T06 [001-AS1, AS2, AS3, AS4, AS5, AS6, AS7] Écrire d'abord `components/results-page.test.tsx` (un test par scénario) et `routes/resultats.a11y.test.tsx`, puis la page, ses composants, la route, l'en-tête et les couleurs de la maquette

## 7. Corrections

### Passage 1

- [x] T07 [001-AS1] Écrire d'abord `apps/web/src/routes/resultats.assets.test.ts` (« 001-AS1: the design mock-up is not served with the site »), puis déplacer `apps/web/public/design.png` vers `specs/assets/design.png`, le commiter et mettre à jour `apps/web/src/styles.css:6` et `specs/prd-jojpulse.md:17`. Preuve : relecteur, `apps/web/public/design.png` non suivi et absent du plan, alors que le PRD et `styles.css` le citent.

### Passage 2

- [x] T08 [001-AS1] Écrire d'abord, dans `apps/api/test/results.e2e.spec.ts`, le test « 001-AS1: rejects a day outside the Games (400, RFC 9457) » pour `0000-01-01` et `9999-12-31`, et le même refus dans `apps/web/src/mocks/handlers.test.ts`, puis limiter `date` aux jours des Jeux (`GAMES_FIRST_DAY` à `GAMES_LAST_DAY`) dans `dayResultsQuerySchema` et dans la validation de l'adresse de `apps/web/src/routes/resultats.tsx`. Preuve : relecteur, `packages/shared/src/results.ts:49` et `apps/api/src/modules/results/infra/drizzle-sport-event.repository.ts:21-22`, la route répond 500 `INTERNAL_ERROR` pour ces deux dates.
