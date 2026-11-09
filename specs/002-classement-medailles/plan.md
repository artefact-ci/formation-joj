# 002 — Classement des nations et médailles : plan

**Statut** : Validé

## 1. Résumé

On construit le module métier `medals`, qui déduit les médailles des résultats déjà en base et calcule le classement des nations, ainsi que la page web `/medailles` qui affiche les deux. Une fois les tâches terminées, le visiteur voit les nations classées par or, puis argent, puis bronze, les filtre par continent, et consulte les médailles par sport et par épreuve, filtrées par sport et par type. Le travail est découpé en six tâches, dans l'ordre des couches : domaine, cas d'usage, base de données, routes de l'API, fausse API du front, puis écran. Les médailles sont en lecture seule : aucune table de médailles n'est créée, car une médaille est simplement un rang de 1 à 3 dans une épreuve terminée qui attribue des médailles. L'évolution du classement dans le temps, le début du classement sur l'accueil et le suivi d'une nation sont laissés de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec           | Dans le code     | Ce que c'est                                                                                |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| Nation                 | `Nation`         | Un pays participant : son code à deux lettres, son nom et son continent.                    |
| Continent              | `Continent`      | `afrique`, `ameriques`, `asie`, `europe` ou `oceanie`.                                      |
| Médaille               | `Medal`          | Une ligne de résultat classée de 1 à 3 dans une épreuve terminée.                           |
| Type de médaille       | `MedalType`      | `gold` (Or) pour le rang 1, `silver` (Argent) pour le rang 2, `bronze` pour le rang 3.      |
| Médaillé               | `competitor`     | Le nom de l'athlète ou de l'équipe, repris de la participation à l'épreuve.                 |
| Ligne du classement    | `NationStanding` | Une nation avec son rang, ses médailles d'or, d'argent et de bronze, et son total.          |
| Classement des nations | `standings`      | La liste de toutes les nations, ordonnée et avec les rangs partagés en cas d'égalité.       |
| Pays hôte              | `HOST_NATION`    | Le code `sn` du Sénégal, dont l'écran met la ligne en évidence sans changer son classement. |

## 2. Fichiers par couche

On crée le module `medals`, organisé comme le module `results` : un dossier par couche, puis le module ajouté aux `imports` de `apps/api/src/app.module.ts`.

- **shared** : `packages/shared/src/medals.ts` contient les listes fermées des continents et des types de médaille, le code du pays hôte, et les schémas Zod des requêtes et des réponses. `packages/shared/src/index.ts` l'exporte.
- **domain** :
  - `apps/api/src/modules/medals/domain/medal.ts` contient l'entité `Medal`, créée par `restore()`, et la fonction `medalTypeForRank`, qui traduit un rang en type de médaille.
  - `domain/nation-standings.ts` contient l'interface `Nation`, l'interface `NationStanding` et la fonction `buildNationStandings(nations, medals)`, qui porte les règles de tri et de rang.
- **application** :
  - `application/medal.repository.ts` est le port, avec les méthodes `listMedals()` et `listNations()`.
  - `application/use-cases/list-nation-standings.ts` est le cas d'usage `ListNationStandings` : il calcule le classement sur toutes les nations, puis applique le filtre par continent, pour que chaque nation garde son rang général.
  - `application/use-cases/list-medals.ts` est le cas d'usage `ListMedals`, qui applique les filtres par sport et par type.
  - `application/testing/in-memory-medal.repository.ts` est le repository en mémoire des tests.
- **infra** :
  - `infra/medals.schema.ts` décrit la table `nations`.
  - `infra/medal.mapper.ts` transforme les lignes en entités `Medal` et en objets `Nation`.
  - `infra/drizzle-medal.repository.ts` implémente le port. Il lit les tables du module `results` pour les médailles et la table `nations` pour les nations.
  - `apps/api/data/03-nations.json` contient les nations du jeu de démonstration : celles qui ont déjà des résultats, plus la Nouvelle-Zélande, le Maroc et Tuvalu, pour couvrir les cinq continents et montrer des nations sans médaille. Les résultats existants suffisent pour le reste : à nombre d'or égal, le Sénégal (1-1-0) passe devant le Japon (1-0-0), et le Kenya, la France et la Grande-Bretagne (0-1-0) partagent un rang.
- **http** : `http/medals.controller.ts` expose deux routes, `medals.module.ts` relie le port à son implémentation, et les deux réponses valent 200.
  - `GET /api/medals/standings?continent=afrique` calcule le classement des nations, avec un filtre `continent` facultatif. Elle renvoie toutes les nations demandées, chacune avec `rank`, `nationCode`, `nationName`, `continent`, `gold`, `silver`, `bronze` et `total`, dans l'ordre du classement.
  - `GET /api/medals?sport=athletisme&type=gold` lit les médailles, avec des filtres `sport` et `type` facultatifs. Elle renvoie une liste triée par sport, puis par heure d'épreuve, puis par rang, vide si aucune médaille ne correspond. Chaque médaille contient `id`, `type`, `sport`, `eventId`, `eventName`, `competitor`, `nationCode` et `nationName`.
- **web** :
  - `apps/web/src/features/medals/api/medals.api.ts` et `medals.queries.ts` font les appels à l'API et gèrent leur cache.
  - `apps/web/src/features/medals/components/medals-page.tsx` assemble la page et garde le continent, le sport et le type dans l'adresse.
  - `components/nation-standings-table.tsx` affiche le tableau et les pastilles de continent de la maquette, et met en évidence la ligne du pays hôte par un fond vert pâle et un texte en gras.
  - `components/medal-list.tsx` affiche les médailles groupées par sport et par épreuve, et le message « Aucune médaille pour ce choix » quand la liste est vide.
  - `components/medal-labels.ts` traduit les continents et les types de médaille en français. Les noms des sports viennent de `features/results/components/result-labels.ts`, qui existe déjà.
  - `apps/web/src/routes/medailles.tsx` déclare la page, et `apps/web/src/routes/__root.tsx` reçoit le lien « Médailles » dans le menu. La mention « Données de démonstration » s'y trouve déjà.
  - `apps/web/src/mocks/handlers.ts` et `fixture.ts` reçoivent les deux routes dans la fausse API, avec leur test dans `handlers.test.ts`.

## 3. Données

On stocke uniquement la liste des nations, car les médailles se déduisent des tables `sport_events` et `sport_event_entries`, créées par le module `results`, où `sport_events` reçoit la colonne `awards_medals` (booléen, faux par défaut), qui distingue une finale d'une manche ou d'une demi-finale. Ainsi, le classement et les résultats ne peuvent pas se contredire. La migration se génère avec `pnpm db:generate --name=nations`.

Table `nations` :

- `code` (varchar de 2 caractères, clé primaire) : une nation n'apparaît qu'une fois au classement.
- `name` (varchar) : le nom affiché.
- `continent` (varchar, vérifié par le schéma partagé à la lecture) : il sert au filtre par continent.

Une médaille se lit ainsi : une participation dont le `rank` vaut 1, 2 ou 3, dans une épreuve dont le `status` vaut `finished` et dont `awards_medals` est vrai. Une équipe n'a qu'une seule participation, grâce à l'unicité déjà posée sur `event_id` et `competitor` : elle compte donc pour une seule médaille (scénario AS6). Rien n'interdit deux participations au même rang : un podium à deux bronzes donne bien deux médailles.

Aucune clé étrangère ne relie `sport_event_entries.nation_code` à `nations.code`, car `results.schema.ts` n'importe que drizzle-orm et que le module `results` ne doit pas dépendre du module `medals`. Un test vérifie à la place que chaque nation citée dans `02-sport_event_entries.json` figure dans `03-nations.json`.

## 4. Erreurs

La spec ne contient aucun refus métier : un choix sans médaille renvoie une liste vide, et le front affiche le message du scénario AS7. Aucune sous-classe d'`AppError` n'est donc créée. Une requête mal formée reçoit l'erreur de validation déjà fournie par le socle commun, qui n'a pas de scénario propre.

| Code AppError       | Catégorie  | HTTP | Quand                                                      | Scénario |
| ------------------- | ---------- | ---- | ---------------------------------------------------------- | -------- |
| `VALIDATION_FAILED` | VALIDATION | 400  | Le continent, le sport ou le type de médaille est inconnu. | Aucun    |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit.

| Scénario | Fichier de test                                                | Niveau      | Ce que le test vérifie                                                                                    |
| -------- | -------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| AS1      | `apps/api/src/modules/medals/domain/nation-standings.spec.ts`  | unitaire    | Chine, Kenya, Sénégal et Maroc sortent aux rangs 1 à 4, avec les totaux 4, 5, 6 et 5.                     |
| AS1      | `.../infra/demo-data.spec.ts`                                  | unitaire    | Chaque nation citée dans les résultats de démonstration figure dans la liste des nations.                 |
| AS1      | `apps/api/test/medals.e2e.spec.ts`                             | e2e         | La route du classement renvoie les nations dans l'ordre, avec leurs médailles et leur total.              |
| AS1      | `apps/web/src/features/medals/components/medals-page.test.tsx` | écran       | Le tableau s'affiche dans l'ordre, avec la mention « Données de démonstration ».                          |
| AS2      | `.../domain/nation-standings.spec.ts`                          | unitaire    | Égypte et France ont le rang 1, Croatie le rang 3, et Tuvalu le rang 4 avec 0 médaille.                   |
| AS3      | `.../application/medals.application.spec.ts`                   | unitaire    | Le filtre « Afrique » ne garde que Kenya, Sénégal et Maroc, avec les rangs généraux 2, 3 et 4.            |
| AS3      | `apps/api/test/medals.e2e.spec.ts`                             | e2e         | La route du classement applique le paramètre `continent`.                                                 |
| AS3      | `.../components/medals-page.test.tsx`                          | écran       | Choisir « Afrique » ne laisse que les nations de ce continent, avec leur rang général.                    |
| AS4      | `.../components/medals-page.test.tsx`                          | écran       | Seule la ligne du Sénégal est mise en évidence, et son rang reste celui du classement.                    |
| AS5      | `.../infra/drizzle-medal.repository.int.spec.ts`               | intégration | Seuls les rangs 1 à 3 des épreuves terminées reviennent, avec le bon type, triés par sport puis par rang. |
| AS5      | `.../components/medals-page.test.tsx`                          | écran       | Le groupe « Athlétisme » et l'épreuve « 100 m hommes » s'affichent, avec type, médaillé et nation.        |
| AS6      | `.../infra/drizzle-medal.repository.int.spec.ts`               | intégration | Une équipe médaillée ne donne qu'une seule médaille, à son nom.                                           |
| AS6      | `.../domain/nation-standings.spec.ts`                          | unitaire    | Une seule médaille d'or donne au Brésil 1-0-0, soit un total de 1.                                        |
| AS7      | `.../application/medals.application.spec.ts`                   | unitaire    | Les filtres « Athlétisme » et « Or » ne gardent que l'or d'athlétisme ; « Voile » rend une liste vide.    |
| AS7      | `apps/api/test/medals.e2e.spec.ts`                             | e2e         | La route des médailles applique les paramètres `sport` et `type`.                                         |
| AS7      | `.../components/medals-page.test.tsx`                          | écran       | Les filtres ne laissent que les médailles d'or d'athlétisme, puis « Aucune médaille pour ce choix ».      |

## 6. Tâches

Six tâches, dans l'ordre des couches. Chaque tâche nomme le test à écrire d'abord et cite les scénarios qu'elle couvre ; elle tient dans un commit.

- [x] T01 [002-AS1, AS2, AS6] Écrire d'abord `domain/nation-standings.spec.ts` (« 002-AS1: … », « 002-AS2: … », « 002-AS6: … »), puis `packages/shared/src/medals.ts`, l'entité `Medal` et `buildNationStandings`
- [x] T02 [002-AS3, AS7] Écrire d'abord `application/medals.application.spec.ts` (« 002-AS3: … », « 002-AS7: … »), puis le port, le repository en mémoire, `ListNationStandings` et `ListMedals`
- [x] T03 [002-AS5, AS6] Écrire d'abord `infra/drizzle-medal.repository.int.spec.ts` (« 002-AS5: … », « 002-AS6: … »), puis la table `nations`, la migration générée, le mapper et le repository Drizzle
- [x] T04 [002-AS1, AS3, AS7] Écrire d'abord `apps/api/test/medals.e2e.spec.ts` et `infra/demo-data.spec.ts` (« 002-AS1: … », « 002-AS3: … », « 002-AS7: … »), puis le controller, le module, son ajout à `app.module.ts` et `03-nations.json`
- [x] T05 [002-AS1, AS3, AS5, AS7] Écrire d'abord les tests des routes dans `apps/web/src/mocks/handlers.test.ts` (« 002-AS1: … », « 002-AS3: … », « 002-AS5: … », « 002-AS7: … »), puis la fausse API, `medals.api.ts` et `medals.queries.ts`
- [x] T06 [002-AS1, AS3, AS4, AS5, AS6, AS7] Écrire d'abord `components/medals-page.test.tsx` (un test par scénario) et `routes/medailles.a11y.test.tsx`, puis la page, ses composants, la route et le lien du menu

## 7. Corrections

### Passage 1

- [x] T07 [002-AS5] Écrire d'abord, dans `domain/nation-standings.spec.ts`, le test « 002-AS5: gives no medal type to a rank outside the podium » (`medalTypeForRank` rend `null` pour le rang 4), puis retirer le `throw` natif du domaine et laisser `infra/medal.mapper.ts` refuser une ligne sans type de médaille. Preuve : relecteur, `apps/api/src/modules/medals/domain/medal.ts:19` lève un `RangeError` hors `infra/`, sans code stable ni catégorie.

### Passage 2

- [x] T08 [002-AS1] Écrire d'abord `apps/web/src/routes/medailles.assets.test.ts` (« 002-AS1: the design mock-up is not served with the site »), puis déplacer `apps/web/public/design.png` vers `specs/assets/design.png`, le commiter et mettre à jour `apps/web/src/styles.css:6` et `specs/prd-jojpulse.md:17`. Cette correction est aussi la T07 du plan 001, à cocher en même temps. Preuve : relecteur, `apps/web/public/design.png` non suivi et hors du plan 002.

### Décision humaine après le passage 2

- [x] T09 [002-AS5, AS7] Écrire d'abord, dans `infra/drizzle-medal.repository.int.spec.ts`, le test « 002-AS5: gives no medal for a finished event that does not award medals » et, dans `infra/demo-data.spec.ts`, le test « 002-AS7: the demonstration sailing heat awards no medal », puis ajouter la colonne `awards_medals` à `sport_events`, générer la migration, filtrer sur cette colonne dans `DrizzleMedalRepository` et renseigner `01-sport_events.json`. Preuve : relecteur, passage 1, « Planche à voile, première manche » donne deux médailles ; l'humain a choisi cette correction.
