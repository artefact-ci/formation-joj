# 003 — Calendrier et suivi d'une délégation : plan

**Statut** : Validé

## 1. Résumé

On étend le module `results`, qui connaît déjà les épreuves et leurs participants, pour exposer le calendrier d'un jour, filtrer les résultats sur une nation et lister les athlètes du jour d'une nation ; on ajoute aussi la page web `/calendrier` et un choix de nation sur la page `/resultats`. Une fois les tâches terminées, le visiteur parcourt les épreuves à venir par jour et par sport, à l'heure de Dakar ou à son heure locale, et le supporter choisit sa nation pour voir ses résultats et ses athlètes du jour. Le travail est découpé en six tâches, dans l'ordre des couches : domaine, cas d'usage, base de données, routes de l'API, fausse API du front, puis écrans. Les participants d'une épreuve programmée deviennent possibles en base, ce qui demande d'assouplir une contrainte existante. L'accueil, le direct, les fiches d'athlètes et la mémorisation de la nation choisie sont laissés de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec        | Dans le code      | Ce que c'est                                                                               |
| ------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| Épreuve à venir     | `scheduled`       | Une épreuve dont le statut `SportEventStatus` vaut « Programmé », quelle que soit l'heure. |
| Calendrier          | `ListDayCalendar` | Le cas d'usage qui rend les épreuves à venir d'un jour, avec un filtre par sport.          |
| Nation choisie      | `nation`          | Le code à deux lettres de la nation, comme `sn`, dans l'adresse et dans les requêtes.      |
| Athlète du jour     | `NationAthlete`   | Un athlète ou une équipe d'une nation, avec son épreuve, son heure et son statut.          |
| Participant inscrit | `RankingEntry`    | Une participation sans rang, sans performance et sans mention, en attendant le résultat.   |
| Heure de Dakar      | `DAKAR_TIME_ZONE` | Le fuseau `Africa/Dakar`, utilisé par défaut pour afficher les horaires.                   |
| Mon heure locale    | `localTimeZone()` | Le fuseau de l'appareil du visiteur, lu dans le navigateur.                                |

## 2. Fichiers par couche

On étend le module `results`, déjà organisé en un dossier par couche, et on ne crée aucun module d'API : le calendrier et les athlètes du jour se lisent sur les mêmes épreuves. Côté front, on crée la fonctionnalité `calendar`.

- **shared** : `packages/shared/src/results.ts` reçoit `DAKAR_TIME_ZONE`, le schéma d'un code de nation (deux lettres minuscules), le paramètre `nation` facultatif de `dayResultsQuerySchema`, et les schémas `calendarQuerySchema`, `nationAthletesQuerySchema` et `nationAthleteSchema`.
- **domain** : `apps/api/src/modules/results/domain/sport-event.ts` reçoit la méthode `hasParticipantFrom(nationCode)`, qui dit si une nation participe à l'épreuve, la méthode `athletesOf(nationCode)`, qui rend ses `NationAthlete`, et un `ranking` qui écarte les participants seulement inscrits.
- **application** :
  - `application/use-cases/list-day-calendar.ts` est le cas d'usage `ListDayCalendar`, qui lit les épreuves du jour et ne garde que celles au statut `scheduled`.
  - `application/use-cases/list-day-results.ts` applique en plus le filtre facultatif `nation`.
  - `application/use-cases/list-nation-athletes.ts` est le cas d'usage `ListNationAthletes`, qui rend les athlètes de la nation pour ce jour, triés par heure puis par nom.
  - Le port `SportEventRepository` et le repository en mémoire ne changent pas : `listByDay` rend déjà tous les participants.
- **infra** :
  - `infra/results.schema.ts` assouplit la contrainte `sport_event_entries_rank_or_mention`.
  - `apps/api/data/01-sport_events.json` et `02-sport_event_entries.json` reçoivent une épreuve de judo programmée le 9 novembre et les participants des épreuves programmées, dont l'équipe du Sénégal en futsal le 8 novembre.
- **http** : `http/results.controller.ts` reçoit deux routes et le paramètre `nation`, et reste fin. Les routes répondent 200, avec une liste vide si rien ne correspond.
  - `GET /api/results/calendar?date=2026-11-08&sport=futsal` rend les épreuves à venir de ce jour, avec un filtre `sport` facultatif, triées par sport puis par heure.
  - `GET /api/results?date=2026-11-08&sport=athletisme&nation=sn` rend les épreuves de ce jour où la nation participe, chacune avec son classement complet.
  - `GET /api/results/athletes?date=2026-11-08&nation=sn` rend les athlètes de la nation pour ce jour, chacun avec `competitor`, `eventId`, `eventName`, `sport`, `startsAt` et `status`.
- **web** :
  - `apps/web/src/features/calendar/api/calendar.api.ts` et `calendar.queries.ts` font l'appel au calendrier et gèrent son cache.
  - `apps/web/src/features/calendar/components/calendar-page.tsx` assemble la page, avec le jour, le sport et le fuseau gardés dans l'adresse.
  - `components/time-zone-switch.tsx` propose « Heure de Dakar » et « Mon heure locale », et dit quel fuseau est affiché.
  - `components/event-time.ts` contient `formatEventTime(startsAt, timeZone)` et `localTimeZone()`.
  - `apps/web/src/routes/calendrier.tsx` déclare la page, et `apps/web/src/routes/__root.tsx` reçoit le lien « Calendrier » dans le menu.
  - `apps/web/src/features/results/components/sport-groups.tsx` reçoit le regroupement par sport, sorti de `results-page.tsx`, pour que le calendrier le réutilise avec son propre message et son fuseau.
  - `components/sport-event-card.tsx` reçoit le fuseau à afficher, et `components/day-selector.tsx` reçoit la page visée et conserve les autres filtres de l'adresse.
  - `components/results-page.tsx` reçoit le choix de la nation, qui lit la liste des nations avec `useNationStandings`, et conserve ce choix quand le jour ou le sport changent.
  - `components/nation-athletes.tsx` affiche les athlètes du jour, ou le message « Aucun athlète de cette nation ce jour ».
  - `apps/web/src/features/results/api/results.api.ts` et `results.queries.ts` reçoivent le paramètre `nation` et l'appel des athlètes, et `apps/web/src/routes/resultats.tsx` valide `nation` dans l'adresse.
  - `apps/web/src/mocks/handlers.ts` et `fixture.ts` reçoivent les nouvelles routes et les participants des épreuves, avec leur test dans `handlers.test.ts`.

## 3. Données

On ne crée aucune table : on permet à `sport_event_entries` de contenir un participant dont le résultat n'est pas encore connu. La migration se génère avec `pnpm db:generate --name=registered_participants`.

Table `sport_event_entries` :

- La contrainte de vérification `sport_event_entries_rank_or_mention` accepte désormais trois formes : un rang et une performance sans mention, une mention seule, ou aucun des trois. La troisième forme représente un participant inscrit. Le refus d'un rang sans performance reste en place.
- La contrainte d'unicité sur `event_id` et `competitor` ne change pas : un participant n'apparaît qu'une fois dans une épreuve, donc une seule fois dans les athlètes du jour.

Une participation sans rang ne donne pas de médaille, car `DrizzleMedalRepository` ne garde que les rangs de 1 à 3. Les nouvelles lignes du jeu de démonstration s'ajoutent avec `pnpm db:seed`, y compris sur une base déjà chargée. La nouvelle épreuve de judo reste à venir, donc elle ne change aucune médaille.

## 4. Erreurs

La spec ne contient aucun refus métier : un choix sans épreuve ou sans athlète renvoie une liste vide, et le front affiche les messages des scénarios AS4 et AS7. Aucune sous-classe d'`AppError` n'est donc créée. Une requête mal formée reçoit l'erreur de validation déjà fournie par le socle commun, qui n'a pas de scénario propre. Une nation bien écrite mais inconnue donne une liste vide.

| Code AppError       | Catégorie  | HTTP | Quand                                                                         | Scénario |
| ------------------- | ---------- | ---- | ----------------------------------------------------------------------------- | -------- |
| `VALIDATION_FAILED` | VALIDATION | 400  | Le jour est hors des Jeux, le sport est inconnu, ou la nation est mal écrite. | Aucun    |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit.

| Scénario | Fichier de test                                                        | Niveau      | Ce que le test vérifie                                                                                                         |
| -------- | ---------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| AS1      | `apps/api/src/modules/results/application/results.application.spec.ts` | unitaire    | Le calendrier du jour ne garde que les épreuves programmées.                                                                   |
| AS1      | `apps/api/test/results.e2e.spec.ts`                                    | e2e         | La route du calendrier répond 200 avec les seules épreuves programmées de ce jour.                                             |
| AS1      | `apps/web/src/features/calendar/components/calendar-page.test.tsx`     | écran       | Le groupe « Futsal » s'affiche avec le nom, l'heure et « Programmé », sans épreuve terminée, avec la mention de démonstration. |
| AS2      | `.../application/results.application.spec.ts`                          | unitaire    | Le filtre par sport ne garde que la natation.                                                                                  |
| AS2      | `.../components/calendar-page.test.tsx`                                | écran       | Choisir « Natation » ne laisse que ce groupe.                                                                                  |
| AS3      | `apps/web/src/features/calendar/components/event-time.test.ts`         | unitaire    | 20h30 à Dakar donne « 20h30 » à Dakar et « 21h30 » à Paris.                                                                    |
| AS3      | `.../components/calendar-page.test.tsx`                                | écran       | L'horaire et l'indication du fuseau changent quand le visiteur choisit « Mon heure locale ».                                   |
| AS4      | `.../components/calendar-page.test.tsx`                                | écran       | Le message « Aucune épreuve à venir pour ce jour et ce sport » s'affiche.                                                      |
| AS5      | `.../domain/sport-event.spec.ts`                                       | unitaire    | Une épreuve dit si une nation y participe, y compris quand elle n'a pas de rang.                                               |
| AS5      | `.../application/results.application.spec.ts`                          | unitaire    | Le filtre ne garde que les épreuves de la nation.                                                                              |
| AS5      | `apps/api/test/results.e2e.spec.ts`                                    | e2e         | La route applique `nation` et rend le classement complet de l'épreuve.                                                         |
| AS5      | `apps/web/src/features/results/components/results-page.test.tsx`       | écran       | Choisir « Sénégal » garde « 100 m hommes, finale » et retire « Course en ligne femmes ».                                       |
| AS6      | `.../domain/sport-event.spec.ts`                                       | unitaire    | Une épreuve rend les seuls athlètes de la nation, et son classement écarte les participants inscrits.                          |
| AS6      | `.../application/results.application.spec.ts`                          | unitaire    | Les athlètes du jour sont triés par heure, avec leur épreuve et leur statut.                                                   |
| AS6      | `.../infra/drizzle-sport-event.repository.int.spec.ts`                 | intégration | Un participant inscrit à une épreuve programmée s'enregistre et se relit.                                                      |
| AS6      | `apps/api/test/results.e2e.spec.ts`                                    | e2e         | La route des athlètes rend ceux de la nation pour ce jour, et rejette une nation mal écrite.                                   |
| AS6      | `.../components/results-page.test.tsx`                                 | écran       | Chaque athlète s'affiche avec son épreuve, son heure et son statut, sans autre nation.                                         |
| AS7      | `.../components/results-page.test.tsx`                                 | écran       | Le message « Aucun athlète de cette nation ce jour » s'affiche.                                                                |

## 6. Tâches

Six tâches, dans l'ordre des couches. Chaque tâche nomme le test à écrire d'abord et cite les scénarios qu'elle couvre ; elle tient dans un commit.

- [x] T01 [003-AS5, AS6] Écrire d'abord les tests dans `domain/sport-event.spec.ts` (« 003-AS5: … », « 003-AS6: … »), puis les schémas partagés, `hasParticipantFrom`, `athletesOf` et le `ranking` qui écarte les participants inscrits
- [x] T02 [003-AS1, AS2, AS5, AS6] Écrire d'abord les tests dans `application/results.application.spec.ts` (« 003-AS1: … », « 003-AS2: … », « 003-AS5: … », « 003-AS6: … »), puis `ListDayCalendar`, `ListNationAthletes` et le filtre `nation` de `ListDayResults`
- [x] T03 [003-AS6] Écrire d'abord le test dans `infra/drizzle-sport-event.repository.int.spec.ts` (« 003-AS6: … »), puis la contrainte assouplie et la migration générée
- [x] T04 [003-AS1, AS5, AS6] Écrire d'abord les tests dans `apps/api/test/results.e2e.spec.ts` (« 003-AS1: … », « 003-AS5: … », « 003-AS6: … »), puis les routes du controller, le module et le jeu de démonstration
- [x] T05 [003-AS1, AS2, AS5, AS6] Écrire d'abord les tests des routes dans `apps/web/src/mocks/handlers.test.ts` (« 003-AS1: … », « 003-AS2: … », « 003-AS5: … », « 003-AS6: … »), puis la fausse API, `calendar.api.ts`, `calendar.queries.ts` et les appels de `results.api.ts`
- [x] T06 [003-AS1, AS2, AS3, AS4, AS5, AS6, AS7] Écrire d'abord `calendar/components/calendar-page.test.tsx`, `calendar/components/event-time.test.ts`, les tests de `results/components/results-page.test.tsx` (un test par scénario) et `routes/calendrier.a11y.test.tsx`, puis les pages, leurs composants, la route et le lien du menu
