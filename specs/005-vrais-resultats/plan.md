# 005 — Les vrais résultats des Jeux : plan

**Statut** : Validé

## 1. Résumé

On construit une commande d'extraction qui lit les pages Wikipédia des Jeux et réécrit les fichiers de `apps/api/data/`, ainsi que deux routes qui exposent la source des données et les écarts de médailles. Une fois les tâches terminées, le visiteur lit les vrais podiums et le vrai classement, voit la source, la date et les écarts, et l'exploitant relance l'extraction à la main. Le travail est découpé en six tâches : domaine, cas d'usage, base de données, routes de l'API, extraction réelle des données, puis fausse API et écrans. L'application lit les données comme aujourd'hui : l'extraction écrit des fichiers, et `pnpm db:reset` les charge. Les classements complets, le site officiel, l'extraction automatique et la correction manuelle sont laissés de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec         | Dans le code                                          | Ce que c'est                                                                      |
| -------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| Extraction           | `pnpm data:extract`                                   | La commande qui lit la source et réécrit les fichiers de données.                 |
| Source               | `DataSource`                                          | Le nom, la licence, l'adresse de la source et le jour de l'extraction.            |
| Résultat non publié  | `unpublished`                                         | Le statut d'une épreuve dont le jour est passé et dont aucun podium n'est publié. |
| Écart                | `MedalGap`                                            | Une nation dont les podiums importés diffèrent du tableau annoncé par la source.  |
| Tableau de la source | `announcedGold`, `announcedSilver`, `announcedBronze` | Les médailles annoncées pour une nation par le tableau de Wikipédia.              |
| Équipe mixte         | `MIXED_TEAM_CODE`                                     | Le code `xx`, qui n'est pas une nation et ne figure donc pas au classement.       |
| Heure connue         | `hasStartTime`                                        | Faux quand la source ne donne pas l'heure : l'écran n'en affiche alors aucune.    |

## 2. Fichiers par couche

On étend les modules `results` et `medals`, et on crée le script d'extraction à côté des scripts de base de données. Aucun module n'est créé.

- **shared** :
  - `packages/shared/src/results.ts` reçoit le statut `unpublished`, `MIXED_TEAM_CODE`, le champ `hasStartTime` des épreuves et des athlètes du jour, et le schéma `dataSourceSchema`.
  - `packages/shared/src/medals.ts` reçoit le schéma `medalGapSchema`.
- **domain** : `apps/api/src/modules/medals/domain/medal-gaps.ts` contient `findMedalGaps(standings, announced)`, qui compare le classement calculé au tableau annoncé.
- **application** :
  - `medals/application/use-cases/list-medal-gaps.ts` est le cas d'usage `ListMedalGaps`, et `MedalRepository` reçoit `listAnnouncedMedals()`.
  - `results/application/use-cases/get-data-source.ts` est le cas d'usage `GetDataSource`, et `SportEventRepository` reçoit `findDataSource()`.
- **infra** :
  - `results/infra/results.schema.ts` reçoit la colonne `has_start_time`, la table `data_extractions` et une contrainte assouplie.
  - `medals/infra/medals.schema.ts` reçoit les trois colonnes annoncées.
  - Les repositories Drizzle et les mappers lisent ces nouvelles données.
- **http** : les controllers restent fins, et les deux routes répondent 200.
  - `GET /api/results/source` rend la source et le jour de l'extraction, ou 404 s'il n'y a aucune extraction.
  - `GET /api/medals/gaps` rend les écarts, chacun avec la nation, le compte calculé et le compte annoncé, ou une liste vide.
- **extraction** :
  - `apps/api/scripts/extract-core.mts` contient la logique pure : lire un tableau de médaillés, traduire les performances et décider du statut. Elle est testée sans réseau par `extract-core.spec.mts`.
  - `apps/api/scripts/extract.mts` lit les pages, une à la fois, et écrit les fichiers seulement si toute l'extraction a réussi. `package.json` reçoit la commande `data:extract`.
  - `apps/api/scripts/reference/nations.json` donne, pour chaque code du CIO, le code à deux lettres, le nom français et le continent. `apps/api/scripts/reference/events.json` donne, pour chaque épreuve, son nom français et son sport.
  - `apps/api/data/01-sport_events.json`, `02-sport_event_entries.json` et `03-nations.json` sont réécrits, et `04-data_extractions.json` est créé. `apps/api/data/SOURCE.md` indique l'origine et la licence de ces données.
- **web** :
  - `apps/web/src/features/results/components/data-source-notice.tsx` affiche la source, et `apps/web/src/routes/__root.tsx` l'affiche à la place de la mention de démonstration.
  - `apps/web/src/features/medals/components/medal-gaps.tsx` affiche les écarts sur la page des médailles.
  - `result-labels.ts` et `sport-event-card.tsx` reçoivent le libellé « Résultat non publié », et l'heure n'est affichée que si elle est connue.
  - `medal-list.tsx` affiche « Équipe mixte » pour `MIXED_TEAM_CODE`, et `key-figures.tsx` passe à 205 nations.
  - `apps/web/src/mocks/handlers.ts` et `fixture.ts` reçoivent les deux routes et les vrais exemples, dont Gift Bright pour le Nigeria.
- **documents** : les scénarios 001-AS3, 001-AS7, 002-AS1, 003-AS1 et 004-AS1 sont corrigés, comme la spec 005 le prévoit, avec leurs tests. `README.md` explique `pnpm data:extract`.

## 3. Données

On stocke les vrais résultats dans les tables existantes, et trois ajouts rendent compte de ce que la source donne ou ne donne pas. La migration se génère avec `pnpm db:generate --name=real_results`.

- Table `sport_event_entries` : la contrainte `sport_event_entries_rank_or_mention` accepte désormais un rang sans performance, car un podium de judo n'en a pas. Elle refuse toujours une performance sans rang et un rang avec une mention. Le code `xx` représente une équipe mixte.
- Table `sport_events` : la colonne `has_start_time` (booléen, faux par défaut) évite d'afficher une heure inventée. Sans heure connue, `starts_at` vaut minuit le jour de l'épreuve.
- Table `nations` : les colonnes `announced_gold`, `announced_silver` et `announced_bronze` (entiers, 0 par défaut) gardent le tableau de la source, pour signaler les écarts sans changer le classement.
- Table `data_extractions` : `extracted_on` (date, clé primaire), `source_name`, `source_url` et `license`. La plus récente est celle qui s'affiche.

Le jour d'une épreuve vient de sa page Wikipédia ou du programme de sa page de sport. S'il est illisible, l'épreuve est importée sans date plutôt que de le deviner : la colonne `starts_at` devient facultative. Le statut se décide à l'extraction : `finished` avec un podium, `unpublished` si le jour est antérieur à celui de l'extraction ou s'il est inconnu, et `scheduled` sinon, y compris pour une épreuve du jour même. Toutes les épreuves attribuent des médailles. La source ne donne pas les participants des épreuves à venir, donc les athlètes du jour d'une nation se limitent à ses médaillés.

Pour une extraction, l'exploitant lance `pnpm data:extract`, arrête `pnpm dev`, puis lance `pnpm db:reset`, car `db:seed` ne corrige pas une ligne déjà chargée.

## 4. Erreurs

Chaque refus reste celui du socle commun, et la spec n'ajoute aucun refus métier ; une sous-classe d'`AppError` est seulement créée pour l'absence d'extraction. L'échec d'une extraction n'est pas une erreur HTTP : le script s'arrête avec un message et un code de sortie non nul, sans toucher aux fichiers.

| Code AppError           | Catégorie | HTTP | Quand                                      | Scénario |
| ----------------------- | --------- | ---- | ------------------------------------------ | -------- |
| `DATA_SOURCE_NOT_FOUND` | NOT_FOUND | 404  | Aucune extraction n'a été chargée en base. | AS2      |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit.

| Scénario | Fichier de test                                                  | Niveau      | Ce que le test vérifie                                                                                  |
| -------- | ---------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| AS1      | `apps/api/scripts/extract-core.spec.mts`                         | unitaire    | Un tableau de médaillés donne Nigeria, Gift Bright, « 10,28 s », et deux bronzes au rang 3.             |
| AS1      | `apps/api/src/modules/results/infra/real-data.spec.ts`           | unitaire    | Les fichiers contiennent le podium du 100 m hommes, 151 épreuves, et aucun nom « Démo ».                |
| AS1      | `apps/web/src/features/results/components/results-page.test.tsx` | écran       | La ligne « 1, Nigeria, Gift Bright, 10,28 s » s'affiche, et aucune heure si elle est inconnue.          |
| AS2      | `.../results/application/results.application.spec.ts`            | unitaire    | Le cas d'usage rend la source, et refuse s'il n'y en a aucune.                                          |
| AS2      | `.../results/infra/drizzle-sport-event.repository.int.spec.ts`   | intégration | La plus récente des extractions est relue.                                                              |
| AS2      | `apps/api/test/results.e2e.spec.ts`                              | e2e         | La route répond 200 avec la source, puis 404 `DATA_SOURCE_NOT_FOUND` sans extraction.                   |
| AS2      | `apps/web/src/routes/__root.test.tsx`                            | écran       | La mention de la source et son lien s'affichent, sans « Données de démonstration ».                     |
| AS3      | `apps/api/scripts/extract-core.spec.mts`                         | unitaire    | Sans podium, le statut dépend du jour ; avec un podium, il vaut `finished`.                             |
| AS3      | `.../results/components/results-page.test.tsx`                   | écran       | « Résultat non publié » et « Programmé » s'affichent, sans classement ni médaille.                      |
| AS4      | `.../results/infra/real-data.spec.ts`                            | unitaire    | Les 205 délégations figurent dans les fichiers, et le Nigeria reçoit l'or du 100 m.                     |
| AS5      | `apps/api/src/modules/medals/domain/medal-gaps.spec.ts`          | unitaire    | Le Portugal à 1-1-1 pour 2-1-1 annoncé donne un écart ; une nation égale n'en donne aucun.              |
| AS5      | `.../medals/infra/drizzle-medal.repository.int.spec.ts`          | intégration | Les médailles annoncées se relisent, et un rang sans performance s'enregistre.                          |
| AS5      | `apps/api/test/medals.e2e.spec.ts`                               | e2e         | La route rend l'écart, et le classement reste calculé sur les podiums.                                  |
| AS5      | `apps/web/src/features/medals/components/medals-page.test.tsx`   | écran       | « Écart avec la source : Portugal, 2-1-1 annoncé » s'affiche.                                           |
| AS6      | `apps/api/scripts/extract-core.spec.mts`                         | unitaire    | Une équipe mixte reçoit le code `xx`.                                                                   |
| AS6      | `.../medals/components/medals-page.test.tsx`                     | écran       | La médaille affiche « Équipe mixte », et aucune nation ne la reçoit au classement.                      |
| AS7      | `apps/api/scripts/extract-core.spec.mts`                         | unitaire    | Une page manquante, un code inconnu ou un jour illisible font échouer l'extraction en nommant la cause. |
| AS7      | `apps/api/scripts/extract.spec.mts`                              | intégration | Avec une source simulée, un succès réécrit les fichiers ; un échec les laisse intacts.                  |

## 6. Tâches

Six tâches, dans l'ordre des couches. Chaque tâche nomme le test à écrire d'abord et cite les scénarios qu'elle couvre ; elle tient dans un commit.

- [x] T01 [005-AS5] Écrire d'abord `medals/domain/medal-gaps.spec.ts` (« 005-AS5: … »), puis les schémas partagés et `findMedalGaps`
- [x] T02 [005-AS2, AS5] Écrire d'abord les tests dans `results/application/results.application.spec.ts` et `medals/application/medals.application.spec.ts` (« 005-AS2: … », « 005-AS5: … »), puis les ports, les repositories en mémoire, `GetDataSource`, `ListMedalGaps` et `DATA_SOURCE_NOT_FOUND`
- [x] T03 [005-AS2, AS5] Écrire d'abord les tests dans `results/infra/drizzle-sport-event.repository.int.spec.ts` et `medals/infra/drizzle-medal.repository.int.spec.ts` (« 005-AS2: … », « 005-AS5: … »), puis les colonnes, la table, la contrainte assouplie, la migration générée et les repositories
- [x] T04 [005-AS2, AS5] Écrire d'abord les tests dans `apps/api/test/results.e2e.spec.ts` et `apps/api/test/medals.e2e.spec.ts` (« 005-AS2: … », « 005-AS5: … »), puis les deux routes
- [x] T05 [005-AS1, AS3, AS4, AS6, AS7] Écrire d'abord `apps/api/scripts/extract-core.spec.mts`, `extract.spec.mts` et `results/infra/real-data.spec.ts`, puis le script, les fichiers de référence, la commande, la vraie extraction et les fichiers de données
- [x] T06 [005-AS1, AS2, AS3, AS5, AS6] Écrire d'abord les tests dans `results-page.test.tsx`, `medals-page.test.tsx`, `routes/__root.test.tsx` et `mocks/handlers.test.ts` (« 005-AS1: … », « 005-AS2: … », « 005-AS3: … », « 005-AS5: … », « 005-AS6: … »), puis la fausse API, les écrans, les scénarios corrigés des specs 001 à 004, leurs tests et le `README.md`

## 7. Corrections

### Décision humaine pendant T05

La source ne donne pas le jour de toutes les épreuves. L'humain a choisi de les importer sans date : leurs médailles comptent, et elles figurent dans un bloc « Date non publiée » du calendrier. T07 se réalise avant T05, qui en dépend. La route ajoutée est `GET /api/results/undated`, qui rend ces épreuves avec leur statut et leur classement.

- [x] T07 [005-AS3] Écrire d'abord les tests dans `results/application/results.application.spec.ts`, `results/infra/drizzle-sport-event.repository.int.spec.ts`, `apps/api/test/results.e2e.spec.ts` et `search/domain/search-hit.spec.ts` (« 005-AS3: … »), puis la colonne `starts_at` facultative, la migration générée, `ListUndatedEvents`, la route et la recherche sans date. Preuve : mesure de T05, 86 épreuves sur 151 sans jour lisible.

### Passage 1

- [x] T08 [005-AS1] Écrire d'abord, dans `apps/api/scripts/extract-core.spec.mts`, le test « 005-AS1: ignores a day outside the Games and reads the schedule of the sport instead », et dans `results/infra/real-data.spec.ts` le test « 005-AS1: dates the men 100 m on 8 November », puis faire refuser à `readEventDay` un jour hors des Jeux, de sorte que le programme de la page de sport prenne le relais, et relancer l'extraction. Preuve : relecteur, `apps/api/data/01-sport_events.json:98` et `apps/api/scripts/extract-core.mts:202`, le 100 m hommes est daté du 8 octobre, reprise d'une coquille de la source.
- [x] T09 [005-AS3] Écrire d'abord, dans `results-page.test.tsx`, le test « 005-AS3: shows a future event as scheduled, without ranking or medal », qui ouvre le 12 novembre, puis corriger ce qui échoue. Preuve : relecteur, `apps/web/src/features/results/components/results-page.test.tsx:190`, « Programmé » n'est jamais vérifié à l'écran.
- [x] T10 [005-AS4] Écrire d'abord, dans `medals/domain/nation-standings.spec.ts`, le test « 005-AS4: counts the podium of the 100 m when it is the only medal of a nation » (Nigeria 1-0-0, Pologne 0-0-1), puis corriger ce qui échoue. Preuve : relecteur, `apps/api/src/modules/results/infra/real-data.int.spec.ts:116`, ces comptes ne sont vérifiés nulle part.
- [x] T11 [005-AS6] Écrire d'abord, dans `medals/domain/nation-standings.spec.ts`, le test « 005-AS6: gives no nation the medal of a mixed team », avec une médaille `xx`, puis corriger ce qui échoue. Preuve : relecteur, `apps/web/src/features/medals/components/medals-page.test.tsx:176`, le classement de la fausse API est figé et ce test ne peut pas échouer.
- [x] T12 [005-AS7] Écrire d'abord, dans `apps/api/scripts/extract.spec.mts`, le test « 005-AS7: shows a new and a corrected podium, then keeps them when the source stops responding », qui enchaîne deux extractions réussies puis un échec, puis corriger ce qui échoue. Preuve : relecteur, `apps/api/scripts/extract.spec.mts:49`, ni le podium corrigé ni la conservation de la date ne sont prouvés.
- [x] T13 [005-AS3] Écrire d'abord, dans `search-page.test.tsx`, le test « 005-AS3: keeps a numeric text typed in the address as text », puis garder la lecture du texte cherché dans `apps/web/src/routes/recherche.tsx`, que ce test fait entrer au plan. Preuve : relecteur, `apps/web/src/routes/recherche.tsx:8`, fichier hors du plan.

### Passage 2

- [ ] T14 [005-AS3] Écrire d'abord, dans `apps/api/scripts/extract-core.spec.mts`, le test « 005-AS3: prefers the day of the final in the schedule of the sport to the header of the event », et dans `results/infra/real-data.spec.ts` le test « 005-AS3: dates the men 400 m on the day of its final », puis faire primer le programme de la page de sport sur l'en-tête de la page d'épreuve dans `dayOf`, et relancer l'extraction. Preuve : relecteur, `apps/api/scripts/extract-core.mts:203-211` et `apps/api/data/01-sport_events.json:113-117`, les 400 m hommes et femmes sont datés du 8 novembre, jour des demi-finales, alors que leur finale a lieu le 9.
