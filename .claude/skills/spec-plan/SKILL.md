---
name: spec-plan
description: Écrit le plan technique d'une spec validée (fichiers par couche, données, erreurs, un test par scénario, six tâches au plus) dans specs/NNN-nom/plan.md, puis s'arrête pour validation humaine. À lancer par l'utilisateur avec /spec-plan [specs/NNN-nom].
argument-hint: '[specs/NNN-nom]'
---

# /spec-plan : planifier

Spec visée : $ARGUMENTS (par défaut, le plus grand `specs/NNN-*`).

## 1. Lire

- `specs/constitution.md`, et le `CLAUDE.md` du dépôt s'il existe.
- `spec.md` de la spec. **Si son statut n'est pas `Validée`, arrête-toi** : dis quel statut tu as lu, et que la spec doit d'abord être relue et validée (`/spec`). N'écris rien.
- Le module modèle : `apps/api/src/modules/disciplines/` (domain, application, infra, http), `packages/shared/src/disciplines.ts`, `apps/api/test/disciplines.e2e.spec.ts`, `apps/web/src/mocks/` et `apps/web/src/features/disciplines/`. Reprends ses noms et sa structure.

## 2. Rédiger `plan.md`

Copie `.claude/skills/spec-plan/plan-template.md` dans le dossier de la spec et remplis-le.

- **Fichiers par couche** : shared → domain → application → infra → http → web. Seulement ce qu'il faut pour les scénarios.
- **Données** : tables, colonnes, contraintes (unicité, clés étrangères).
- **Erreurs** : une ligne par refus métier. Code stable en majuscules, catégorie AppError (VALIDATION 400, NOT_FOUND 404, CONFLICT 409, BUSINESS_RULE 422), scénario.
- **Tests par scénario** : chaque `ASn` de la spec a une ligne, avec fichier et niveau (unitaire, intégration, e2e, écran). Choisis le niveau le plus bas qui prouve le « Alors ».
- **Tâches** : six au plus, dans l'ordre des couches, format `- [ ] T01 [NNN-AS1] Écrire d'abord <fichier de test> (« NNN-AS1: … »), puis <code>`. Une tâche tient dans un commit et cite le scénario qu'elle fait avancer. Le front fait une tâche à part entière s'il est dans la spec.

Le plan ne rajoute aucun besoin : ce qui n'est pas dans la spec n'y est pas.

## 3. Vérifier

`pnpm spec:check specs/NNN-nom`. Corrige jusqu'à ce qu'il soit vert.

## 4. S'arrêter

Montre à l'utilisateur la liste des tâches et les erreurs prévues, puis demande-lui de relire `plan.md`.

**Ne passe pas à la suite.** Le statut reste `Brouillon` tant que l'utilisateur n'a pas dit explicitement qu'il valide. Sur accord explicite seulement : `**Statut** : Validé`, `pnpm spec:check`, puis termine par :

> Plan validé. Prochaine étape : `/tdd-task` (toutes les tâches) ou `/tdd-task T01`
