# 001 — Consulter les résultats d'une journée

**Statut** : Implémentée
**PRD** : specs/prd-jojpulse.md, TR1

## Contexte

Pendant les JOJ Dakar 2026, 25 sports se déroulent en parallèle et le spectateur veut savoir vite ce qui s'est passé un jour donné, sans passer d'une source à l'autre. Cette tranche lui donne une seule page pour lire les résultats d'une journée, sport par sport, sur téléphone comme sur ordinateur.

## User stories

- En tant que spectateur, je veux choisir un jour et un sport, afin de voir les épreuves qui m'intéressent.
- En tant que spectateur, je veux lire le classement d'une épreuve terminée, afin de savoir qui a gagné et avec quelle performance.

## Scénarios d'acceptation

### AS1 — Voir les épreuves d'un jour, regroupées par sport

- **Étant donné** le 8 novembre 2026 compte des épreuves en athlétisme et en futsal
- **Quand** le spectateur choisit le 8 novembre
- **Alors** il voit un groupe « Athlétisme » et un groupe « Futsal », chaque épreuve affichant son nom, son heure et son statut, et aucune épreuve d'un autre jour

### AS2 — Filtrer par sport

- **Étant donné** le 8 novembre 2026 compte des épreuves en athlétisme et en futsal
- **Quand** le spectateur choisit le sport « Athlétisme »
- **Alors** il ne voit que le groupe « Athlétisme »

### AS3 — Lire le classement d'une épreuve terminée

- **Étant donné** l'épreuve « 100 m hommes, finale » est terminée
- **Quand** le spectateur consulte cette épreuve
- **Alors** il voit le statut « Terminé » et les participants du premier au dernier, chacun avec son rang, sa nation, son nom d'athlète ou d'équipe et sa performance (par exemple « 1, Nigeria, Gift Bright, 10,28 s »)

### AS4 — Une épreuve non terminée n'a pas de classement

- **Étant donné** une épreuve « Programmé » et une épreuve « En cours » le même jour
- **Quand** le spectateur consulte ces épreuves
- **Alors** chacune affiche son statut, et aucune n'affiche de classement ni de performance

### AS5 — Une mention remplace la performance

- **Étant donné** une épreuve terminée où un athlète est disqualifié et un autre n'a pas terminé
- **Quand** le spectateur consulte le classement
- **Alors** il voit « Disqualifié » et « N'a pas terminé » à la place de leur performance, sans rang, après les athlètes classés

### AS6 — Aucune épreuve pour ce choix

- **Étant donné** il n'y a aucune épreuve de voile le 8 novembre 2026
- **Quand** le spectateur choisit ce jour et ce sport
- **Alors** il voit le message « Aucune épreuve pour ce jour et ce sport », et non une page vide

### AS7 — La source des données est signalée

- **Étant donné** les résultats affichés viennent de Wikipédia (spec 005)
- **Quand** le spectateur ouvre la page des résultats
- **Alors** il voit la mention « Source : Wikipédia (CC BY-SA), données du » suivie de la date

## Hors périmètre

- Le classement des nations, les médailles, le calendrier, le suivi d'une délégation, l'accueil, le direct, la recherche et le thème sombre (tranches suivantes).
- La saisie ou la correction des résultats par un utilisateur.
- Les plans détaillés des rencontres de sports collectifs : seul le classement est affiché.

## Questions ouvertes

- Jour affiché à l'ouverture : hypothèse, le jour même pendant les Jeux, sinon le 31 octobre 2026.
- Heures des épreuves : hypothèse, à l'heure de Dakar ; le choix de l'heure locale arrive en TR3.
- Présentation : hypothèse, l'en-tête, les couleurs et le bloc « Derniers résultats » suivent la maquette du PRD. Les liens vers les pages à venir ne figurent pas dans le menu.
