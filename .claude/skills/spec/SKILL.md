---
name: spec
description: Rédige la spec d'une nouvelle fonctionnalité (le quoi et le pourquoi, sans technique) dans specs/NNN-nom/spec.md, puis s'arrête pour validation humaine. À lancer par l'utilisateur avec /spec <description>.
argument-hint: <description de la fonctionnalité>
---

# /spec : écrire la spec

Demande : $ARGUMENTS

## 1. Lire les règles

Lis `specs/constitution.md`, et le `CLAUDE.md` du dépôt s'il existe. Applique-les sans les recopier.

## 2. Créer le dossier

- Nom court en kebab-case, sans accent : `benevoles`, `tableau-medailles`.
- Numéro : le plus grand `specs/NNN-*` existant + 1, sur trois chiffres (`001` s'il n'y en a pas).
- Copie `.claude/skills/spec/spec-template.md` dans `specs/NNN-nom/spec.md`.

## 3. Rédiger

- **Aucune technique** : ni route, ni table, ni composant, ni code HTTP. On décrit ce que l'utilisateur voit et ce que le système refuse.
- 1 à 3 user stories.
- Des scénarios `### AS1 — titre`, `### AS2 — …`, chacun au format Étant donné / Quand / Alors. Le « Alors » est observable et vérifiable par un test : une valeur, un refus, un message.
- Un scénario par règle métier, et un pour le cas nominal. Pas de scénario pour la plomberie.
- Hors périmètre : ce que tu as choisi de ne pas faire.
- 60 lignes au plus.

## 4. Clarifier

Si un point **bloque** la rédaction (deux lectures possibles qui changent les scénarios), pose au plus 3 questions, en une seule fois. Sinon, note le point dans « Questions ouvertes » avec l'hypothèse retenue, et continue.

## 5. Vérifier

`pnpm spec:check specs/NNN-nom`. Corrige jusqu'à ce qu'il soit vert.

## 6. S'arrêter

Montre à l'utilisateur la liste des scénarios (identifiant et titre) et les questions ouvertes, puis demande-lui de relire `specs/NNN-nom/spec.md`.

**Ne passe pas à la suite.** Le statut reste `Brouillon` tant que l'utilisateur n'a pas dit explicitement qu'il valide (« je valide », « ok pour la spec »). Une remarque n'est pas une validation : corrige la spec et redemande.

Sur accord explicite seulement : remplace `**Statut** : Brouillon` par `**Statut** : Validée`, relance `pnpm spec:check`, puis `git add specs/NNN-nom && git commit -m "docs(<module>): add validated spec NNN"`, et termine par :

> Spec validée. Prochaine étape : `/spec-plan`
