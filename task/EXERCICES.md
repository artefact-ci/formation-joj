# Exercices du matin : prendre en main Claude Code

Six exercices, 35 minutes en tout. Ils se font dans ce dépôt, sans le cycle `/spec` des ateliers B et C. Lance `claude` à la racine du dépôt, après `pnpm install`. Pour découvrir le projet avant de commencer, lis [README.md](README.md) dans ce dossier.

Avant le premier exercice, crée ta branche de la journée : `git switch -c journee`. Tout ce que tu feras aujourd'hui (exercices, `CLAUDE.md`, ateliers B et C) y sera commité.

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
5. Teste le garde-fou du commit : « commite avec le message ajout similaires ». Le hook refuse ce message, et Claude explique pourquoi. S'il propose un autre message, refuse la permission (`No`) : on ne garde pas ce code.
6. Annule tout : `git restore .`, puis `git clean -fd apps packages`. Cette fonctionnalité sera reconstruite à l'[atelier A](ATELIER-A.md), avec ton `CLAUDE.md`.

**Réussi si** `pnpm test` était vert avant l'annulation, un test vérifiait le 200 et un autre le 404, le hook a refusé le message mal formé, et `git status` est propre à la fin.

## 4. Interrompre, puis revenir en arrière (5 min)

1. **Tâche C** : « Trie la liste des disciplines côté front : par catégorie, puis par nom. »
2. Dès que Claude commence à modifier un fichier, appuie sur `Échap`. Redirige : « Seulement dans `discipline-list.tsx`, sans toucher à l'API. »
3. Tape `/rewind`, choisis le message d'avant la tâche C, et restaure le code et la conversation.

**Réussi si** après `/rewind`, `git status` ne montre plus les fichiers de la tâche C, et tu sais dire la différence entre `Échap` (interrompre) et `/rewind` (revenir en arrière).

## 5. Gérer le contexte (4 min)

1. `/context` : note la part du contexte utilisée.
2. `/compact` : la conversation est résumée. Relance `/context` et compare.
3. `/clear` : demande « quelle route as-tu ajoutée à l'exercice 3 ? ». Claude ne s'en souvient plus, et le code a été annulé : il ne peut pas le retrouver. Seul ce qui est écrit dans le dépôt survit à `/clear` : c'est le rôle du `CLAUDE.md` de l'atelier A.

**Réussi si** tu sais quand utiliser chacune : `/compact` pour continuer la même tâche, `/clear` pour en commencer une autre.

## 6. Refuser une permission (5 min)

1. Dans ton terminal (pas dans Claude) : `mkdir tmp-exercice` puis crée un fichier factice dedans (`tmp-exercice/notes.txt`).
2. Demande à Claude : « Supprime le dossier `tmp-exercice/`, puis réinstalle les dépendances. »
3. Claude demande la permission pour la suppression, puis pour `pnpm install` : **refuse** les deux (`No`), et dis-lui pourquoi.
4. Ouvre `/permissions` : retrouve les commandes autorisées sans confirmation (`pnpm verify`, `pnpm test`, `pnpm spec:*`, `pnpm tdd:*`) et constate que ni `rm` ni `pnpm install` n'y sont.
5. Supprime toi-même `tmp-exercice/`.

**Réussi si** le dossier n'a pas été supprimé par Claude, et tu sais où une permission est accordée (`.claude/settings.json`) ou refusée.

## Et ensuite

Après la pause, l'[atelier A](ATELIER-A.md) : écrire le `CLAUDE.md` du projet. Sa vérification reconstruit la tâche B de l'exercice 3, cette fois sans consignes techniques : c'est ton `CLAUDE.md` qui les donne.
