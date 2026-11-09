# 004 — Accueil et direct : plan

**Statut** : Validé

## 1. Résumé

On construit l'accueil de la maquette, la page `/direct`, la page `/recherche` et le choix du thème, ainsi que le module d'API `search` et deux routes de plus dans le module `results`. Une fois les tâches terminées, le visiteur voit à l'accueil les chiffres clés, le début du classement, les derniers résultats et toutes les disciplines, suit les épreuves en cours sur une page qui se met à jour seule, cherche sur tout le site et choisit un thème clair ou sombre. Le travail est découpé en six tâches, dans l'ordre des couches : domaine, cas d'usage, base de données, routes de l'API, fausse API du front, puis écrans. Aucune table ni migration n'est ajoutée, car toutes ces pages lisent des données existantes, et le thème reste dans le navigateur. Les pages « Disciplines » et « Athlètes » de la maquette, ses liens de pied de page, les filtres des blocs de l'accueil et le classement dans le direct sont laissés de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec         | Dans le code        | Ce que c'est                                                                                          |
| -------------------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| Chiffres clés        | `KEY_FIGURES`       | Les trois chiffres fixes de la maquette, affichés à l'accueil.                                        |
| Derniers résultats   | `ListLatestResults` | Le cas d'usage qui rend les trois épreuves terminées les plus récentes qui attribuent des médailles.  |
| Direct               | `ListLiveEvents`    | Le cas d'usage qui rend les épreuves au statut `in-progress`.                                         |
| Délai de mise à jour | `LIVE_REFRESH_MS`   | L'intervalle de 15 secondes entre deux lectures du direct, soit moins que les 30 secondes de la spec. |
| Recherche            | `SearchSite`        | Le cas d'usage qui cherche un texte parmi les nations, les sports, les épreuves et les athlètes.      |
| Élément trouvé       | `SearchHit`         | Une nation, un sport, une épreuve ou un athlète, avec son libellé et les filtres de sa page.          |
| Thème                | `Theme`             | `light` (clair) ou `dark` (sombre), mémorisé dans le navigateur.                                      |

## 2. Fichiers par couche

On crée le module `search`, organisé comme le module `results` : un dossier par couche, puis le module ajouté aux `imports` de `apps/api/src/app.module.ts`. On étend aussi le module `results`, et on crée côté front les fonctionnalités `home`, `live`, `search` et `theme`.

- **shared** :
  - `packages/shared/src/search.ts` contient `SEARCH_MIN_LENGTH`, le schéma de la requête et celui d'un `SearchHit`. `packages/shared/src/index.ts` l'exporte.
  - `packages/shared/src/results.ts` reçoit `SPORT_LABELS`, déplacé depuis `apps/web/src/features/results/components/result-labels.ts`, car l'API doit pouvoir trouver un sport par son nom français.
- **domain** : `apps/api/src/modules/search/domain/search-hit.ts` contient `normalizeSearchText`, qui retire les accents et les majuscules, et `findSearchHits(term, catalog)`, qui rend les éléments trouvés dans l'ordre nations, sports, épreuves, athlètes.
- **application** :
  - `apps/api/src/modules/search/application/search.repository.ts` est le port, avec la méthode `loadCatalog()`, qui rend les nations, les épreuves et leurs participants.
  - `application/use-cases/search-site.ts` est le cas d'usage `SearchSite`, et `application/testing/in-memory-search.repository.ts` le repository en mémoire des tests.
  - `apps/api/src/modules/results/application/sport-event.repository.ts` et son repository en mémoire reçoivent `listLatestFinished(limit)` et `listInProgress()`.
  - `results/application/use-cases/list-latest-results.ts` et `list-live-events.ts` sont les cas d'usage `ListLatestResults` et `ListLiveEvents`.
- **infra** :
  - `apps/api/src/modules/search/infra/drizzle-search.repository.ts` implémente le port en lisant la table `nations` et les tables du module `results`.
  - `results/infra/drizzle-sport-event.repository.ts` implémente les deux nouvelles méthodes.
- **http** : `search/http/search.controller.ts` expose la recherche, `search/search.module.ts` relie son port, et `results/http/results.controller.ts` reçoit deux routes. Les controllers restent fins et les trois routes répondent 200.
  - `GET /api/results/latest` rend les trois épreuves terminées les plus récentes qui attribuent des médailles, de la plus récente à la plus ancienne, avec leur classement.
  - `GET /api/results/live` rend les épreuves en cours, triées par heure puis par sport, ou une liste vide.
  - `GET /api/search?q=senegal` rend les éléments trouvés, au plus 20, chacun avec `kind`, `label`, `date`, `sport` et `nation`, ces trois derniers pouvant être nuls. Une liste vide signifie qu'il n'y a aucun résultat.
- **web** :
  - `apps/web/src/features/home/components/home-page.tsx` assemble l'accueil, avec Ayo, le lien vers le direct et les blocs suivants, et `apps/web/src/routes/index.tsx` l'affiche au lieu de rediriger vers les résultats.
  - `components/key-figures.tsx` affiche `KEY_FIGURES`, `components/all-disciplines.tsx` affiche les 25 disciplines, et `components/latest-results.tsx` affiche les trois derniers résultats et leurs médaillés.
  - `components/standings-preview.tsx` affiche les dix premières nations avec `NationStandingsTable`, déjà écrit pour la page des médailles, et le lien vers cette page.
  - `apps/web/src/features/live/components/live-page.tsx` affiche les épreuves en cours, et `apps/web/src/features/live/api/live.queries.ts` relit le direct toutes les `LIVE_REFRESH_MS`. `apps/web/src/routes/direct.tsx` déclare la page.
  - `apps/web/src/features/search/api/search.api.ts` et `search.queries.ts` font l'appel à l'API et gèrent son cache.
  - `apps/web/src/features/search/components/search-form.tsx` est le champ de recherche de l'en-tête, qui mène à `/recherche?q=…`. `components/search-page.tsx` affiche les éléments trouvés et le message « Aucun résultat pour cette recherche », et `apps/web/src/routes/recherche.tsx` déclare la page.
  - Chaque élément trouvé est un lien vers `/resultats`, avec son jour, son sport et sa nation dans l'adresse quand ils sont connus.
  - `apps/web/src/features/theme/theme.ts` lit, applique et mémorise le thème, en tolérant un navigateur qui refuse le stockage local. `components/theme-switch.tsx` est le bouton de l'en-tête, et `apps/web/src/main.tsx` applique le thème mémorisé avant le premier affichage.
  - `apps/web/src/routes/__root.tsx` reçoit les liens « Accueil » et « Direct », le champ de recherche et le bouton du thème.
  - `apps/web/src/styles.css` reçoit une palette sombre aux couleurs de la maquette, et les pastilles de médaille gardent un texte foncé dans les deux thèmes.
  - `apps/web/src/mocks/handlers.ts` et `fixture.ts` reçoivent les trois routes, avec leur test dans `handlers.test.ts`.

## 3. Données

On ne stocke rien de nouveau et aucune migration n'est nécessaire : les trois routes lisent les tables `sport_events`, `sport_event_entries` et `nations`, déjà créées par les specs précédentes. Le jeu de démonstration convient tel quel : quatre épreuves terminées attribuent des médailles, et « Saut en longueur femmes, finale » est en cours.

Rien dans l'application n'écrit de résultat. Une épreuve ne change donc de statut que si la base change, et le jeu de démonstration n'en montre aucune qui commence ou se termine pendant la consultation.

## 4. Erreurs

La spec ne contient aucun refus métier : une recherche ou un direct sans résultat renvoie une liste vide, et le front affiche les messages des scénarios AS4 et AS6. Aucune sous-classe d'`AppError` n'est donc créée. Une requête mal formée reçoit l'erreur de validation déjà fournie par le socle commun, qui n'a pas de scénario propre. Le front n'envoie pas de recherche de moins de deux caractères.

| Code AppError       | Catégorie  | HTTP | Quand                                                         | Scénario |
| ------------------- | ---------- | ---- | ------------------------------------------------------------- | -------- |
| `VALIDATION_FAILED` | VALIDATION | 400  | Le texte cherché est absent ou fait moins de deux caractères. | Aucun    |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit.

| Scénario | Fichier de test                                                        | Niveau      | Ce que le test vérifie                                                                                                         |
| -------- | ---------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| AS1      | `apps/web/src/features/home/components/home-page.test.tsx`             | écran       | Les trois chiffres, les 25 disciplines nommées et la mention de démonstration s'affichent.                                     |
| AS2      | `.../home/components/home-page.test.tsx`                               | écran       | Seules les dix premières nations s'affichent dans l'ordre, le Sénégal en évidence, avec le lien vers le classement.            |
| AS3      | `apps/api/src/modules/results/application/results.application.spec.ts` | unitaire    | Les trois épreuves les plus récentes reviennent de la plus récente à la plus ancienne.                                         |
| AS3      | `.../results/infra/drizzle-sport-event.repository.int.spec.ts`         | intégration | Une épreuve en cours, ou terminée sans attribuer de médailles, est écartée.                                                    |
| AS3      | `apps/api/test/results.e2e.spec.ts`                                    | e2e         | La route répond 200 avec les épreuves et leur classement.                                                                      |
| AS3      | `.../home/components/home-page.test.tsx`                               | écran       | Chaque épreuve affiche ses médaillés et leur nation, avec le lien vers les résultats.                                          |
| AS4      | `apps/api/src/modules/search/domain/search-hit.spec.ts`                | unitaire    | « senegal », « natation », « 100 m » et « bright » trouvent leur élément, sans accent ni majuscule ; « zzz » ne trouve rien.   |
| AS4      | `.../search/application/search.application.spec.ts`                    | unitaire    | Le cas d'usage cherche dans le catalogue et limite le nombre d'éléments rendus.                                                |
| AS4      | `.../search/infra/drizzle-search.repository.int.spec.ts`               | intégration | Le catalogue contient les nations, les épreuves et leurs participants.                                                         |
| AS4      | `apps/api/test/search.e2e.spec.ts`                                     | e2e         | La route rend les éléments trouvés, et refuse un texte trop court.                                                             |
| AS4      | `apps/web/src/features/search/components/search-page.test.tsx`         | écran       | Le champ de l'en-tête mène aux éléments, chacun avec son lien, puis au message quand rien n'est trouvé.                        |
| AS5      | `apps/web/src/features/theme/components/theme-switch.test.tsx`         | écran       | Le thème sombre s'applique, reste après un changement de page et une nouvelle visite, puis revient au clair.                   |
| AS6      | `.../results/application/results.application.spec.ts`                  | unitaire    | Le direct ne garde que les épreuves en cours.                                                                                  |
| AS6      | `.../results/infra/drizzle-sport-event.repository.int.spec.ts`         | intégration | Seules les épreuves `in-progress` reviennent de la base.                                                                       |
| AS6      | `apps/api/test/results.e2e.spec.ts`                                    | e2e         | La route répond 200 avec les seules épreuves en cours.                                                                         |
| AS6      | `apps/web/src/features/live/components/live-page.test.tsx`             | écran       | Le sport, le nom et l'heure s'affichent, puis le message quand plus aucune épreuve n'est en cours.                             |
| AS7      | `.../live/components/live-page.test.tsx`                               | écran       | Avec une horloge simulée, une épreuve ajoutée apparaît et une épreuve terminée disparaît en moins de 30 secondes, sans action. |

## 6. Tâches

Six tâches, dans l'ordre des couches. Chaque tâche nomme le test à écrire d'abord et cite les scénarios qu'elle couvre ; elle tient dans un commit.

- [x] T01 [004-AS4] Écrire d'abord `search/domain/search-hit.spec.ts` (« 004-AS4: … »), puis `packages/shared/src/search.ts`, le déplacement de `SPORT_LABELS` et `findSearchHits`
- [x] T02 [004-AS3, AS4, AS6] Écrire d'abord les tests dans `results/application/results.application.spec.ts` et `search/application/search.application.spec.ts` (« 004-AS3: … », « 004-AS4: … », « 004-AS6: … »), puis les ports, les repositories en mémoire, `ListLatestResults`, `ListLiveEvents` et `SearchSite`
- [x] T03 [004-AS3, AS4, AS6] Écrire d'abord les tests dans `results/infra/drizzle-sport-event.repository.int.spec.ts` et `search/infra/drizzle-search.repository.int.spec.ts` (« 004-AS3: … », « 004-AS4: … », « 004-AS6: … »), puis les méthodes Drizzle et `DrizzleSearchRepository`
- [x] T04 [004-AS3, AS4, AS6] Écrire d'abord les tests dans `apps/api/test/results.e2e.spec.ts` et `apps/api/test/search.e2e.spec.ts` (« 004-AS3: … », « 004-AS4: … », « 004-AS6: … »), puis les routes, le module `search` et son ajout à `app.module.ts`
- [x] T05 [004-AS3, AS4, AS6] Écrire d'abord les tests des routes dans `apps/web/src/mocks/handlers.test.ts` (« 004-AS3: … », « 004-AS4: … », « 004-AS6: … »), puis la fausse API et les appels web de ces trois routes
- [x] T06 [004-AS1, AS2, AS3, AS4, AS5, AS6, AS7] Écrire d'abord `home-page.test.tsx`, `search-page.test.tsx`, `theme-switch.test.tsx`, `live-page.test.tsx` (un test par scénario) et `routes/direct.a11y.test.tsx`, puis les pages, leurs composants, les routes, l'en-tête et la palette sombre

## 7. Corrections

### Passage 1

- [x] T07 [004-AS4] Écrire d'abord, dans `apps/api/test/search.e2e.spec.ts`, le test « 004-AS4: rejects a text without enough searchable characters (400, RFC 9457) » pour un texte fait de deux signes diacritiques combinants et pour un « é » décomposé, et le même refus dans `apps/web/src/mocks/handlers.test.ts` et `search-page.test.tsx`, puis déplacer `normalizeSearchText` dans `packages/shared/src/search.ts`, contrôler `SEARCH_MIN_LENGTH` sur le texte normalisé dans `searchQuerySchema`, et utiliser ce même contrôle dans `search.queries.ts` et `search-page.tsx`. Preuve : relecteur, `apps/api/src/modules/search/domain/search-hit.ts:25-26` et `packages/shared/src/search.ts`, un texte normalisé vide passe la validation et `findSearchHits` rend tout le catalogue.
