# Exercices du matin : prendre en main Claude Code

Six exercices, 35 minutes en tout. Ils se font dans ce dépôt, sans le cycle `/spec` de l'après-midi. Lance `claude` à la racine du dépôt, après `pnpm install`.

Avant chaque exercice : `git status` doit être propre (sinon `git stash -u`).

## 1. Explorer (5 min)

1. Demande : « Explique l'architecture de ce dépôt : les applications, et les couches d'un module de l'API. »
2. Puis : « Que vérifie `@apps/api/src/modules/disciplines/domain/discipline.ts` ? » (`@` attache le fichier : tape `@disc` et choisis-le dans la liste).

**Réussi si** tu sais nommer les quatre couches d'un module (domain, application, infra, http) et le fichier où une `AppError` devient une réponse HTTP.

## 2. Planifier sans rien modifier (6 min)

1. Passe en plan mode : `Shift+Tab` jusqu'à voir « plan mode » sous la zone de saisie.
2. **Tâche A** : « Ajoute un filtre par catégorie à la liste des disciplines (un menu déroulant au-dessus de la liste). Quels fichiers, quel test d'abord ? »
3. Lis le plan, pose une question dessus, puis refuse de l'exécuter.

**Réussi si** le plan nomme les fichiers du front et le test à écrire, et que `git status` ne montre aucun changement.

## 3. Confier, puis relire (10 min)

**Tâche B**, d'abord de façon vague :

1. « Ajoute les disciplines similaires. » Regarde ce que Claude invente : quelle route, quelle règle, quels tests ?
2. Annule tout : `git restore .`, puis `git clean -fd apps packages` (supprime les fichiers nouveaux de ces deux dossiers).

Puis de façon précise :

3. « Ajoute `GET /api/disciplines/:id/similaires` : les autres disciplines de la même catégorie, triées par nom, sans la discipline elle-même. Si l'id est inconnu, 404 avec le code `DISCIPLINE_NOT_FOUND`, via `AppError`. Suis le module `disciplines` : un cas d'usage, un controller fin, un test e2e dans `apps/api/test/`. Lance les tests et corrige. »
4. Relis le diff (`git diff`, ou demande « montre-moi le diff ») : le controller est-il fin ? le 404 est-il testé ?
5. Commite : « commite avec un message Conventional Commits ».

**Réussi si** `pnpm test` est vert, un test vérifie le 200 et un autre le 404, et le commit est passé (le hook refuse un message mal formé).

## 4. Interrompre, puis revenir en arrière (5 min)

1. **Tâche C** : « Trie la liste des disciplines côté front : par catégorie, puis par nom. »
2. Dès que Claude commence à modifier un fichier, appuie sur `Échap`. Redirige : « Seulement dans `discipline-list.tsx`, sans toucher à l'API. »
3. Tape `/rewind`, choisis le message d'avant la tâche C, et restaure le code et la conversation.

**Réussi si** après `/rewind`, `git status` ne montre plus les fichiers de la tâche C, et tu sais dire la différence entre `Échap` (interrompre) et `/rewind` (revenir en arrière).

## 5. Gérer le contexte (4 min)

1. `/context` : note la part du contexte utilisée.
2. `/compact` : la conversation est résumée. Relance `/context` et compare.
3. `/clear` : demande « quelle route as-tu ajoutée à l'exercice 3 ? ». Claude ne s'en souvient plus : il doit relire le code.

**Réussi si** tu sais quand utiliser chacune : `/compact` pour continuer la même tâche, `/clear` pour en commencer une autre.

## 6. Refuser une permission (5 min)

1. Dans ton terminal (pas dans Claude) : `mkdir tmp-exercice` puis crée un fichier factice dedans (`tmp-exercice/notes.txt`).
2. Demande à Claude : « Supprime le dossier `tmp-exercice/`, puis réinstalle les dépendances. »
3. Claude demande la permission pour la suppression, puis pour `pnpm install` : **refuse** les deux (`No`), et dis-lui pourquoi.
4. Ouvre `/permissions` : retrouve les commandes autorisées sans confirmation (`pnpm verify`, `pnpm test`, `pnpm spec:*`, `pnpm tdd:*`) et constate que ni `rm` ni `pnpm install` n'y sont.
5. Supprime toi-même `tmp-exercice/`.

**Réussi si** le dossier n'a pas été supprimé par Claude, et tu sais où une permission est accordée (`.claude/settings.json`) ou refusée.

## Atelier B

L'atelier B applique la méthode de l'après-midi (spec, plan, TDD, relecture) à une petite fonctionnalité : voir [ATELIER-B.md](ATELIER-B.md), et la section « Méthode » du [README](README.md#méthode).
