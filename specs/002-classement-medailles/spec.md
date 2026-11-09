# 002 — Classement des nations et médailles

**Statut** : Implémentée
**PRD** : specs/prd-jojpulse.md, TR2

## Contexte

Le public et les journalistes veulent voir où en sont les nations et qui a remporté quoi, avec le même traitement pour tous les pays et sans changer de source. Après les résultats du jour (TR1), cette tranche leur donne le classement des nations et le détail des médailles.

## User stories

- En tant que supporter d'une délégation, je veux voir les nations classées, entières ou par continent, afin de situer mon pays.
- En tant que journaliste accrédité, je veux filtrer les médailles par sport ou par type, afin de relever vite une épreuve et ses médaillés.

## Scénarios d'acceptation

### AS1 — Voir les nations classées par or, puis argent, puis bronze

- **Étant donné** Chine 4-0-0, Kenya 3-2-0, Sénégal 3-1-2 et Maroc 3-1-1 (or-argent-bronze)
- **Quand** le visiteur ouvre le classement des nations
- **Alors** il voit Chine 1re, Kenya 2e, Sénégal 3e et Maroc 4e, chacun avec son or, son argent, son bronze et son total (Chine 4, Kenya 5, Sénégal 6, Maroc 5), ainsi que la mention « Source : Wikipédia (CC BY-SA), données du » suivie de la date

### AS2 — Des nations à égalité parfaite partagent le même rang

- **Étant donné** Égypte et France ont chacune 3-3-2, seules devant Croatie 3-3-0, et Tuvalu n'a aucune médaille
- **Quand** le visiteur consulte le classement
- **Alors** Égypte et France affichent le rang 1, Croatie le rang 3, et Tuvalu figure en dernier avec le rang 4 et 0 médaille

### AS3 — Filtrer les nations par continent

- **Étant donné** le classement d'AS1
- **Quand** le visiteur choisit le continent « Afrique »
- **Alors** il ne voit que Kenya, Sénégal et Maroc, avec leur rang général : 2, 3 et 4

### AS4 — Le Sénégal, pays hôte, est mis en évidence

- **Étant donné** le Sénégal figure dans le classement, parmi d'autres nations
- **Quand** le visiteur consulte le classement
- **Alors** la ligne du Sénégal est mise en évidence, et elle seule, sans que cela change son rang

### AS5 — Voir les médailles par sport et par épreuve

- **Étant donné** le 100 m hommes (athlétisme) a son podium : or Kenya, argent Chine, bronze Pologne
- **Quand** le visiteur consulte les médailles
- **Alors** il voit un groupe « Athlétisme », l'épreuve « 100 m hommes » et, pour chaque médaille, son type, le médaillé et sa nation

### AS6 — Une équipe médaillée compte pour une seule médaille

- **Étant donné** l'équipe du Brésil, de 12 joueuses, remporte l'or en beach handball, et le Brésil n'a pas d'autre médaille
- **Quand** le visiteur consulte les médailles, puis le classement
- **Alors** il voit une seule médaille au nom de l'équipe, et le Brésil compte 1-0-0, soit un total de 1

### AS7 — Filtrer les médailles par sport et par type

- **Étant donné** l'athlétisme compte des médailles d'or, d'argent et de bronze, et la voile aucune médaille
- **Quand** le visiteur choisit « Athlétisme » et « Or », puis « Voile »
- **Alors** il ne voit d'abord que des médailles d'or d'athlétisme, puis le message « Aucune médaille pour ce choix » à la place d'une page vide

## Hors périmètre

- Le début du classement sur l'accueil, le suivi d'une nation, le calendrier, le direct, la recherche et le thème sombre (tranches suivantes).
- L'évolution du classement dans le temps, et la saisie ou la correction des médailles.

## Questions ouvertes

- Rang affiché avec le filtre continent : hypothèse, le rang général, et le rang après une égalité saute les places partagées (1, 1, 3).
- Podiums à deux bronzes (judo, boxe) : hypothèse, chaque bronze compte. Équipes réunissant plusieurs nations : hypothèse, absentes du jeu de démonstration.
- Le filtre par type ne change que les médailles, pas le classement des nations ; les continents sont ceux de la maquette, plus l'Océanie.
