# NNN — Nom de la fonctionnalité : plan

**Statut** : Brouillon

## Fichiers par couche

Sur le modèle de `apps/api/src/modules/disciplines/`. Une ligne par fichier créé ou modifié.

- **shared** : `packages/shared/src/<nom>.ts` (schémas Zod), export dans `index.ts`
- **domain** : `apps/api/src/modules/<nom>/domain/…`
- **application** : port, repository en mémoire, cas d'usage
- **infra** : table Drizzle, mapper, repository
- **http** : controller, module ajouté à `app.module.ts`
- **web** : fausse API (`src/mocks/`), `features/<nom>/`, route

## Données

Table, colonnes et contraintes. Migration : `pnpm db:generate --name=<sujet>`.

## Erreurs

| Code AppError | Catégorie | HTTP | Scénario |
| ------------- | --------- | ---- | -------- |
| `<NOM>_…`     | CONFLICT  | 409  | AS2      |

## Tests par scénario

Un test au moins par scénario, au niveau le plus bas qui prouve son « Alors ».

| Scénario | Fichier de test                   | Niveau   |
| -------- | --------------------------------- | -------- |
| AS1      | `apps/api/test/<nom>.e2e.spec.ts` | e2e      |
| AS2      | `…/domain/<entité>.spec.ts`       | unitaire |

## Tâches

Six au plus, dans l'ordre des couches. Chaque tâche nomme le test à écrire d'abord ; elle tient dans un commit.

- [ ] T01 [NNN-AS1] Écrire d'abord `<fichier de test>` (« NNN-AS1: … »), puis <le code>
- [ ] T02 [NNN-AS2] Écrire d'abord `<fichier de test>` (« NNN-AS2: … »), puis <le code>
