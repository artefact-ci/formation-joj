# 003 — Calendrier et suivi d'une délégation

**Statut** : Implémentée
**PRD** : specs/prd-jojpulse.md, TR3

## Contexte

Le visiteur veut savoir quand se déroulent les prochaines épreuves, depuis Dakar ou de l'étranger, et le supporter veut suivre son pays sans chercher dans toutes les épreuves. Cette tranche ajoute le calendrier et le choix d'une nation.

## User stories

- En tant que visiteur, je veux parcourir les épreuves à venir par jour et par sport, à l'heure de Dakar ou à mon heure locale, afin de savoir quand les suivre.
- En tant que supporter d'une délégation, je veux choisir ma nation, afin de voir ses résultats et ses athlètes du jour.

## Scénarios d'acceptation

### AS1 — Voir les épreuves à venir d'un jour, regroupées par sport

- **Étant donné** le 8 novembre 2026 compte « Hommes, demi-finale » (futsal) au statut « Programmé » et « 100 m hommes, finale » au statut « Terminé »
- **Quand** le visiteur ouvre le calendrier et choisit le 8 novembre
- **Alors** il voit un groupe « Futsal » avec le nom, l'heure et le statut « Programmé » de l'épreuve, il ne voit pas « 100 m hommes, finale » ni aucune épreuve d'un autre jour, et il voit la mention « Source : Wikipédia (CC BY-SA), données du » suivie de la date

### AS2 — Filtrer le calendrier par sport

- **Étant donné** le 9 novembre 2026 compte des épreuves à venir en natation et en judo
- **Quand** le visiteur choisit le sport « Natation »
- **Alors** il ne voit que le groupe « Natation »

### AS3 — Lire les horaires à l'heure de Dakar ou à son heure locale

- **Étant donné** une épreuve à 20h30 à Dakar et un visiteur dont l'appareil est à l'heure de Paris
- **Quand** il ouvre le calendrier, puis choisit « Mon heure locale »
- **Alors** il voit d'abord « 20h30 », indiquée à l'heure de Dakar, puis « 21h30 », indiquée à son heure locale

### AS4 — Aucune épreuve à venir pour ce choix

- **Étant donné** il n'y a aucune épreuve de voile à venir le 8 novembre 2026
- **Quand** le visiteur choisit ce jour et ce sport
- **Alors** il voit le message « Aucune épreuve à venir pour ce jour et ce sport », et non une page vide

### AS5 — Filtrer les résultats sur une nation

- **Étant donné** le 8 novembre 2026, le Sénégal participe au « 100 m hommes, finale » et pas à « Course en ligne femmes »
- **Quand** le supporter choisit la nation « Sénégal » dans les résultats
- **Alors** il voit « 100 m hommes, finale » avec son classement complet, et il ne voit pas « Course en ligne femmes »

### AS6 — Voir les athlètes du jour d'une nation

- **Étant donné** le 8 novembre 2026, le Sénégal engage Awa Diop dans une épreuve terminée et l'équipe du Sénégal dans une épreuve programmée
- **Quand** le supporter choisit le Sénégal et ce jour
- **Alors** il voit Awa Diop et l'équipe du Sénégal, chacun avec son épreuve, son heure et son statut, et aucun participant d'une autre nation

### AS7 — Aucun athlète de cette nation ce jour

- **Étant donné** Tuvalu n'engage aucun athlète le 8 novembre 2026
- **Quand** le supporter choisit Tuvalu et ce jour
- **Alors** il voit le message « Aucun athlète de cette nation ce jour », et non une page vide

## Hors périmètre

- L'accueil, le direct, la recherche et le thème sombre (TR4), les fiches d'athlètes et les notifications poussées.
- La mémorisation de la nation choisie d'une visite à l'autre, et le choix manuel d'un autre fuseau horaire.

## Questions ouvertes

- « À venir » : hypothèse, une épreuve au statut « Programmé », sans comparer son heure à l'heure actuelle. Le jour reste celui de Dakar, même si l'heure locale tombe un autre jour.
- Athlètes du jour : hypothèse, tous les statuts d'épreuve comptent, donc le jeu de démonstration doit aussi indiquer les participants des épreuves programmées.
- Nations proposées : hypothèse, toutes celles du classement. Sans épreuve pour le choix, les résultats affichent le message existant de la spec 001.
