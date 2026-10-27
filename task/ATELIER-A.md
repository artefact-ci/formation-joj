# Atelier A : écrire le CLAUDE.md du projet

**Horaire** : 10:30–11:15 (45 min). **Objectif** : écrire noir sur blanc les bonnes pratiques du projet dans `CLAUDE.md`, puis constater que Claude les applique sans qu'on les lui répète.

`CLAUDE.md` est la mémoire permanente du projet : Claude le lit au début de chaque session. Il dit ce qui est vrai dans ce dépôt (architecture, conventions, nommage) et renvoie vers le détail. Il reste court : une ligne inutile coûte du contexte à chaque session.

| Fichier                                 | Rôle                                                    | Quand il est lu                      |
| --------------------------------------- | ------------------------------------------------------- | ------------------------------------ |
| `CLAUDE.md`                             | ce qui est vrai dans le projet : conventions, structure | à chaque session                     |
| une skill (`.claude/skills/*/SKILL.md`) | comment faire une tâche, étape par étape                | seulement quand on lance la commande |
| `specs/constitution.md`                 | les six principes de la méthode des ateliers B et C     | par les skills `/spec` à `/converge` |

**Règle d'or.** `CLAUDE.md` pointe vers les skills ; une skill ne répète jamais `CLAUDE.md`, elle le lit.

## 10:30–10:40 · Présentation (formateur)

Les bonnes pratiques d'un projet professionnel (architecture, nommage, gestion des erreurs, sécurité), la différence entre `CLAUDE.md` et une skill, et la règle d'or. Rien à faire de ton côté.

## 10:40–11:05 · Compléter le modèle (25 min)

1. `git status` doit être propre. Tu travailles sur la branche de la journée (voir [EXERCICES.md](EXERCICES.md)).
2. Copie le modèle à la racine du dépôt : `cp task/CLAUDE.modele.md CLAUDE.md`.
3. Remplis les cinq rubriques : **méthodologie**, **architecture**, **concepts appréciés**, **bonnes pratiques**, **nommage**. Chaque rubrique contient un commentaire qui explique quoi écrire, et un exemple.
4. Pour trouver le contenu, lis le module modèle `apps/api/src/modules/disciplines/` et le [README du dépôt](../README.md). Tu peux demander à Claude : « Quelles conventions de nommage suit le module disciplines ? » ; c'est toi qui décides ce qui entre dans `CLAUDE.md`.
5. Supprime les commentaires du modèle (`<!-- … -->`) une fois la rubrique remplie : Claude les lirait à chaque session.
6. Vérifie la taille : **60 lignes au plus**. Une règle que Claude suivrait de toute façon n'a rien à faire là.
7. Formate, puis commite : `pnpm format`, puis `git add CLAUDE.md && git commit -m "docs: add project CLAUDE.md"`. Le pré-commit vérifie aussi le format des fichiers Markdown.

Ce qu'un bon `CLAUDE.md` contient : des règles vérifiables (« un controller n'appelle qu'un cas d'usage ») plutôt que des vœux (« écrire du code propre ») ; des chemins réels ; des renvois (« la méthode est dans `specs/constitution.md` ») plutôt que des copies.

## 11:05–11:15 · Vérifier que Claude l'applique (10 min)

1. `/clear`, pour que Claude reparte de zéro et relise `CLAUDE.md`.
2. Reconstruis la **tâche B** de l'exercice 3, annulée le matin. Donne seulement le besoin métier, sans aucune consigne technique (ni module modèle, ni cas d'usage, ni `AppError`, ni test) : c'est ton `CLAUDE.md` qui doit les apporter.

   « Ajoute `GET /api/disciplines/:id/similaires` : les autres disciplines de la même catégorie, triées par nom, sans la discipline elle-même. Si l'id est inconnu, 404. »

3. Relis le diff et compare avec la version précise du matin, qui donnait toutes les consignes dans le prompt. Vérifie, pour chaque règle que ton `CLAUDE.md` écrit :
   - un cas d'usage dans `application/use-cases/`, avec une méthode `execute()` ;
   - un controller fin, sans règle métier ;
   - le 404 levé par une `AppError` avec le code `DISCIPLINE_NOT_FOUND` ;
   - un test e2e dans `apps/api/test/`, qui vérifie le 200 et le 404, avec des titres nommés selon ta convention.

   Puis demande-lui : « Quelles règles de CLAUDE.md as-tu appliquées ? »

4. Si une convention manque, ne corrige pas le code à la main : complète `CLAUDE.md`, puis demande à Claude de reprendre la fonctionnalité en le relisant.
5. Quand `pnpm test` est vert, demande : « commite avec un message Conventional Commits ». Cette fois, on garde la fonctionnalité.

**Réussi si** ton `CLAUDE.md` fait 60 lignes au plus et ses cinq rubriques sont remplies, la route des disciplines similaires est commitée avec ses tests verts, et Claude a appliqué au moins une convention écrite dans `CLAUDE.md` sans qu'elle soit dans le prompt.

**En cas de retard**, le formateur te donne un `CLAUDE.md` déjà rempli, avec des erreurs à corriger : relis-le rubrique par rubrique au lieu de l'écrire.
