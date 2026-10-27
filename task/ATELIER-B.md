# Atelier B : construire deux fonctionnalités avec la méthode

**Durée** : 2 heures. **Objectif** : livrer deux fonctionnalités de l'API, chacune spécifiée, planifiée, codée en TDD et relue. C'est Claude qui écrit le code ; ton travail consiste à décrire le besoin, à relire et valider la spec puis le plan, et à vérifier le résultat.

Les deux fonctionnalités se font l'une après l'autre, dans le même dépôt. La première (Bénévoles) est la plus guidée. La seconde (Programme des épreuves) reprend le même cycle, avec des règles un peu plus difficiles à bien formuler.

## Avant de commencer (5 min)

1. `git switch main`, puis `git status` : l'arbre doit être propre.
2. `pnpm check` doit être vert. S'il ne l'est pas, appelle un formateur avant d'aller plus loin.
3. Crée ta branche de travail : `git switch -c atelier-b`.
4. Lance `claude` à la racine du dépôt. Si tu viens de faire les exercices du matin, tape `/clear` pour repartir d'une conversation vide.

## Le cycle, pour chaque fonctionnalité

Les quatre commandes s'enchaînent toujours dans cet ordre. Chacune s'arrête et attend ta réponse avant l'étape suivante.

| Étape | Tu tapes                  | Claude fait                                                                                                                 | Toi, tu…                                                                                                                                    | Durée indicative |
| ----- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1     | `/spec <texte du besoin>` | écrit `specs/NNN-nom/spec.md` : user stories, scénarios `AS1`, `AS2`… au format Étant donné / Quand / Alors, hors périmètre | relis chaque scénario. Chaque règle de l'énoncé a-t-elle son scénario ? Le « Alors » est-il vérifiable ? Corrige, puis écris « je valide ». | 15 min           |
| 2     | `/spec-plan`              | écrit `plan.md` : résumé, fichiers par couche, tables, erreurs, un test par scénario, six tâches au plus                    | vérifie les codes d'erreur et les statuts HTTP de l'énoncé, et que chaque scénario a un test prévu. Puis « je valide ».                     | 15 min           |
| 3     | `/tdd-task`               | pour chaque tâche : écrit le test, prouve qu'il échoue (`pnpm tdd:red`), écrit le code, vérifie (`pnpm verify`), commite    | regarde passer les tâches. Tu peux interrompre (`Échap`) et lancer `/tdd-task T03` pour une seule tâche.                                    | 15 à 25 min      |
| 4     | `/converge`               | lance `pnpm spec:check --trace` et `pnpm check`, puis fait relire par le sous-agent `relecteur` dans un contexte vierge     | lis le verdict. Si des tâches de correction sont ajoutées, relance `/tdd-task`, puis `/converge`.                                           | 10 min           |

La fonctionnalité est terminée quand `/converge` répond **Converged** : la spec passe alors au statut `Implémentée`.

Entre deux fonctionnalités, tape `/clear` : la seconde n'a pas besoin de la conversation de la première, tout est dans le dépôt.

## Fonctionnalité 1 : Bénévoles (spec `001`, environ 1 heure)

**Pourquoi.** Chaque discipline a besoin de bénévoles pour accueillir le public et aider à l'organisation. Les responsables ouvrent des créneaux, et les bénévoles s'y inscrivent. Aujourd'hui tout se fait sur papier : des créneaux débordent et certaines personnes sont inscrites deux fois.

**Ce que l'on doit pouvoir faire.**

- Ouvrir un créneau pour une discipline existante : une heure de début, une heure de fin (après le début) et une capacité, c'est-à-dire un nombre maximal de bénévoles (au moins 1).
- Inscrire un bénévole sur ce créneau, avec son nom et son email.
- Consulter un créneau : ses horaires, sa capacité, le nombre de places restantes, et ses inscrits dans l'ordre d'inscription.

**Les deux règles métier**, chacune prouvée par un test :

| Règle                                                                                                                                       | Réponse de l'API                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| On n'inscrit personne sur un créneau complet.                                                                                               | refus `409`, code d'erreur `SLOT_FULL`           |
| On n'inscrit pas deux fois le même email sur un créneau. `awa@joj.sn` et `Awa@JOJ.sn` sont le même email (pas de différence de majuscules). | refus `409`, code `VOLUNTEER_ALREADY_REGISTERED` |

**Un exemple pour relire les scénarios.** Un créneau de Lutte, le 2 novembre 2026 de 9 h à 12 h, avec une capacité de 2.

1. Awa s'inscrit avec `awa@joj.sn` : c'est accepté, il reste 1 place.
2. Awa réessaie avec `Awa@JOJ.sn` : c'est refusé, avec `VOLUNTEER_ALREADY_REGISTERED`, et il reste toujours 1 place.
3. Moussa s'inscrit : c'est accepté, il ne reste aucune place.
4. Fatou essaie de s'inscrire : c'est refusé, avec `SLOT_FULL`.

**Hors périmètre** : l'écran, la désinscription, la modification ou la suppression d'un créneau, l'envoi d'un email de confirmation, et les comptes ou mots de passe des bénévoles.

**Le texte à donner à `/spec`** (copie-le tel quel) :

```
/spec Bénévoles : ouvrir un créneau (début, fin, capacité maximale) pour une discipline existante, inscrire un bénévole (nom, email) sur ce créneau, et consulter un créneau avec ses places restantes et ses inscrits dans l'ordre d'inscription. On ne peut pas inscrire quelqu'un sur un créneau complet : refus 409 avec le code SLOT_FULL. On ne peut pas inscrire deux fois le même email sur un créneau, sans tenir compte des majuscules : refus 409 avec le code VOLUNTEER_ALREADY_REGISTERED. Pas d'écran : seulement l'API.
```

**Réussi si** la spec a un scénario par règle plus un cas nominal, le plan prévoit les deux codes d'erreur en `409`, et `/converge` répond « Converged ».

## Fonctionnalité 2 : Programme des épreuves (spec `002`, environ 50 minutes)

**Pourquoi.** Le comité d'organisation construit le programme des Jeux, épreuve par épreuve. Une épreuve se déroule dans un lieu (un stade, une salle, une plage). Deux épreuves ne peuvent pas occuper le même lieu en même temps, et aucune épreuve ne peut avoir lieu en dehors des dates des Jeux.

**Ce que l'on doit pouvoir faire.**

- Programmer une épreuve pour une discipline existante : un nom (par exemple « Finale 3x3 filles »), un lieu, écrit en texte libre (par exemple « Dakar Arena »), une heure de début et une heure de fin (après le début).
- Consulter le programme d'une journée : toutes les épreuves de cette journée, tous lieux confondus, triées par heure de début.

**Les deux règles métier**, chacune prouvée par un test :

| Règle                                                                                                                                                                                                                                                                        | Réponse de l'API                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Deux épreuves ne se chevauchent pas dans le même lieu. Une épreuve peut commencer à la minute exacte où la précédente finit. Le lieu se compare sans tenir compte des majuscules ni des espaces au début et à la fin (« Dakar Arena » et « dakar arena » sont le même lieu). | refus `409`, code `VENUE_ALREADY_BOOKED` |
| Une épreuve se déroule entièrement pendant les Jeux : du samedi 31 octobre 2026 à 0 h jusqu'au vendredi 13 novembre 2026 inclus, donc avant le samedi 14 novembre à 0 h, heure de Dakar (qui est aussi l'heure UTC, sans changement d'heure).                                | refus `422`, code `EVENT_OUTSIDE_GAMES`  |

Note la différence entre les deux statuts. `409` (CONFLICT) signale un conflit avec une donnée qui existe déjà, ici une autre épreuve. `422` (BUSINESS_RULE) signale une demande valide sur la forme, mais contraire à une règle du métier, quelles que soient les autres données.

**Un exemple pour relire les scénarios.** À la Dakar Arena, la « Finale 3x3 filles » est programmée le 2 novembre 2026 de 10 h à 12 h.

1. « Finale 3x3 garçons », au même lieu, de 11 h à 13 h : refusé avec `VENUE_ALREADY_BOOKED`, car les deux épreuves se chevauchent de 11 h à 12 h.
2. La même épreuve de 12 h à 14 h : acceptée, car elle commence quand la précédente finit.
3. « Lutte, poule A » au stade Iba Mar Diop, de 11 h à 13 h : acceptée, car c'est un autre lieu.
4. « Cérémonie d'essai » le 30 octobre 2026 : refusée avec `EVENT_OUTSIDE_GAMES`. Même refus pour une épreuve qui commence le 13 novembre à 23 h et finit le 14 novembre à 1 h.
5. Le programme du 2 novembre affiche, dans cet ordre : Finale 3x3 filles (10 h), Lutte, poule A (11 h), Finale 3x3 garçons (12 h).

**Hors périmètre** : l'écran, la modification ou la suppression d'une épreuve, une liste officielle des lieux (le lieu reste un texte libre), les fuseaux horaires autres que celui de Dakar, la billetterie et les résultats.

**Le texte à donner à `/spec`** (copie-le tel quel, après `/clear`) :

```
/spec Programme des épreuves : programmer une épreuve (nom, lieu en texte libre, début, fin) pour une discipline existante, et consulter le programme d'une journée, toutes épreuves confondues, trié par heure de début. Deux épreuves ne peuvent pas se chevaucher dans le même lieu ; une épreuve peut commencer à l'heure exacte où la précédente finit ; le lieu se compare sans tenir compte des majuscules ni des espaces autour : refus 409 avec le code VENUE_ALREADY_BOOKED. Une épreuve doit se dérouler entièrement pendant les Jeux, du 31 octobre 2026 à 0 h jusqu'au 13 novembre 2026 inclus (avant le 14 novembre à 0 h), heure de Dakar (UTC) : refus 422 avec le code EVENT_OUTSIDE_GAMES. Pas d'écran : seulement l'API.
```

**Points à surveiller en relisant**, car ce sont les erreurs les plus fréquentes sur cette fonctionnalité :

- la spec a un scénario pour le cas limite « commence à l'heure où la précédente finit » : sans lui, rien ne prouve que ce cas est accepté ;
- le plan place les deux règles dans le domaine (`domain/`), pas dans le controller ;
- le test du chevauchement vérifie le code `VENUE_ALREADY_BOOKED`, pas seulement le statut `409` ;
- une épreuve qui commence le 13 novembre et finit le 14 est bien refusée, et pas seulement une épreuve qui commence après les Jeux.

**Réussi si** la spec `002` a un scénario par règle, plus le cas nominal et le cas limite, le plan prévoit `409` pour le chevauchement et `422` pour les dates, et `/converge` répond « Converged ».

## En fin d'atelier

- `git log --oneline main..` : un commit par tâche, chacun avec un message qui cite sa tâche et son scénario (par exemple `feat(volunteers): T03 refuse a full slot (001-AS3)`).
- `pnpm spec:check specs/001-<nom> --trace`, puis `pnpm spec:check specs/002-<nom> --trace` : chaque scénario pointe vers au moins un test.
- `pnpm check` est vert.

## Si ça bloque

- **`/tdd-task` s'arrête après deux échecs sur une tâche** : lis son explication. Le plus souvent, la tâche est trop grosse ou le plan est ambigu. Corrige le plan à la main, puis relance `/tdd-task Tnn`.
- **`/converge` en est à son deuxième passage sans converger** : il s'arrête et te demande de trancher. Tu peux accepter l'écart, changer la spec, ou appeler un formateur.
- **Un commit est refusé** : lis le message du hook. Il dit ce qui ne va pas (format, lint, test, message de commit). N'utilise jamais `--no-verify`.
- **Claude demande une permission inattendue** (supprimer des fichiers, `pnpm install`) : refuse, et demande-lui pourquoi il en a besoin.

Pour le détail des commandes, voir la section « Méthode » du [README](../README.md#méthode). Pour comprendre le dépôt, voir [README.md](README.md) dans ce dossier.
