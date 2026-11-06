# CLAUDE.md

Application d'organisation des JOJ Dakar 2026 : une API NestJS (`apps/api`), un front React (`apps/web`) et des schémas partagés (`packages/shared`), dans un monorepo pnpm. Commandes et structure détaillée : `README.md`.

## Méthodologie

- Une fonctionnalité nouvelle suit `/prd` → `/spec` → `/spec-plan` → `/tdd-task` → `/converge` (principes : `specs/constitution.md`). Une petite route sans spec suit le même ordre de fichiers que le README (« Ajouter une fonctionnalité »).
- Test d'abord, vu en échec pour la bonne raison, puis le code minimal pour le faire passer.
- `pnpm verify` avant chaque commit, `pnpm check` avant de déclarer une fonctionnalité finie.
- Un commit par tâche, en Conventional Commits ; jamais `--no-verify`.

## Architecture

- `packages/shared` : schémas Zod et types des échanges ; importé par `apps/api` et `apps/web`, n'importe ni l'un ni l'autre. L'API et le front ne s'importent jamais.
- Un module par domaine dans `apps/api/src/modules/<domaine>/`, sur le modèle de `disciplines` : `domain/`, `application/`, `infra/`, `http/`, et `<domaine>.module.ts`.
- `domain/` est du TypeScript pur : ni NestJS, ni Drizzle, ni `pg` (vérifié par oxlint).
- `application/` : un cas d'usage par fichier dans `use-cases/`, qui ne dépend que du port (`<entité>.repository.ts`, classe abstraite).
- `infra/` implémente le port avec Drizzle ; le module relie le port à son implémentation (`{ provide: DisciplineRepository, useClass: DrizzleDisciplineRepository }`).
- `http/` : un controller fin qui valide (DTO `createZodDto`), appelle un seul cas d'usage et sérialise (`toResponse`). Aucune règle métier.
- Les migrations sont générées par `pnpm db:generate`, jamais éditées à la main.
- Front : `apps/web/src/features/<nom>/` (`api/`, `components/`), routes dans `src/routes/`, fausse API MSW dans `src/mocks/` au même contrat que l'API.

## Concepts appréciés

- Typage strict, pas de `any` ; types dérivés des schémas Zod (`z.infer`).
- Une classe par cas d'usage, `@Injectable()`, une seule méthode publique `execute()`.
- Entités à constructeur privé : `create()` applique les règles, `restore()` relit la base sans les rejouer.
- Le domaine ne fait pas confiance à la validation HTTP : il revérifie ses invariants.
- Le repository en mémoire (`application/testing/`) respecte le contrat du port (tri, unicité) et renvoie des copies.
- Commentaires courts en français, qui disent le pourquoi.

## Bonnes pratiques

- Toute erreur métier est une `AppError` (via la classe du domaine, ex. `DisciplineError`) avec un code stable et une catégorie `VALIDATION | NOT_FOUND | CONFLICT | BUSINESS_RULE`. Seul `ProblemDetailsFilter` la transforme en réponse HTTP (400, 404, 409, 422, RFC 9457).
- Une ressource introuvable : le cas d'usage lève l'erreur `*_NOT_FOUND` (ex. `disciplineNotFound(id)`), jamais le controller.
- Corps et paramètres validés par un schéma de `packages/shared` (ex. `disciplineIdParamsSchema`), jamais à la main ; une entrée invalide répond 400 `VALIDATION_FAILED`.
- Aucun secret dans le code : les valeurs viennent de `apps/api/.env`.
- Tests : unitaires du domaine (`*.spec.ts`), cas d'usage avec le repository en mémoire (`<nom>.application.spec.ts`), repository Drizzle sur PGlite (`*.int.spec.ts`), API complète dans `apps/api/test/*.e2e.spec.ts` (supertest), front `*.test.tsx` à côté du composant.
- Un test e2e couvre le cas nominal et chaque erreur (404, 400) ; il crée ses données avec des noms uniques.

## Nommage

- Fichiers en kebab-case : `get-discipline.ts`, `drizzle-discipline.repository.ts`, `disciplines.errors.ts`.
- Classes en PascalCase ; cas d'usage nommés verbe + nom : `CreateDiscipline`, `ListDisciplines`.
- Codes d'erreur en SCREAMING_SNAKE_CASE préfixés par l'entité : `DISCIPLINE_NAME_TAKEN`.
- Schémas Zod en camelCase suffixés par `Schema` : `createDisciplineSchema` ; DTO suffixés par `Dto`.
- Routes de l'API en français, au pluriel : `/api/disciplines/:id`.
- Titres de tests en anglais ; avec une spec, préfixés par son scénario : `it('001-AS2: rejects a full slot')`.
- Commits : `type(portée): résumé` en anglais, ex. `feat(disciplines): add similar disciplines route`.
