# 004 — Accueil et direct

**Statut** : Implémentée
**PRD** : specs/prd-jojpulse.md, TR4

## Contexte

Le visiteur arrive sans savoir où chercher et veut voir d'un coup d'œil l'essentiel des Jeux, puis ce qui se joue en ce moment. Cette dernière tranche ajoute l'accueil de la maquette, la recherche, le choix du thème et le direct.

## User stories

- En tant que spectateur, je veux un accueil qui résume les Jeux, et une page de direct qui se met à jour seule, afin de savoir où en sont les épreuves.
- En tant que journaliste accrédité, je veux chercher sur tout le site, afin de retrouver vite une nation, une épreuve ou un athlète.
- En tant que visiteur, je veux choisir un thème clair ou sombre, afin de lire confortablement.

## Scénarios d'acceptation

### AS1 — Voir les chiffres clés et toutes les disciplines

- **Étant donné** les Jeux comptent 25 disciplines
- **Quand** le visiteur ouvre l'accueil
- **Alors** il voit « 25 Disciplines », « 205 Nations » et « Plus de 4 000 Jeunes athlètes », les 25 disciplines nommées, et la mention « Source : Wikipédia (CC BY-SA), données du » suivie de la date

### AS2 — Voir le début du classement des nations

- **Étant donné** le classement compte 12 nations, dont le Sénégal au 2e rang
- **Quand** le visiteur ouvre l'accueil
- **Alors** il voit les 10 premières nations dans l'ordre du classement, la ligne du Sénégal mise en évidence, et le lien « Voir tout le classement », qui mène au classement complet

### AS3 — Voir les derniers résultats

- **Étant donné** quatre épreuves sont terminées, et une épreuve plus récente est encore en cours
- **Quand** le visiteur ouvre l'accueil
- **Alors** il voit les trois épreuves terminées les plus récentes, de la plus récente à la plus ancienne, chacune avec ses médaillés et leur nation, et le lien « Voir tous les résultats »

### AS4 — Chercher sur tout le site

- **Étant donné** le site contient le Sénégal, la natation, « 100 m hommes, finale » et « Gift Bright »
- **Quand** le visiteur cherche « senegal », « natation », « 100 m » ou « bright », puis « zzz »
- **Alors** il trouve à chaque fois l'élément attendu, sans tenir compte des accents ni des majuscules, avec un lien vers sa page, puis le message « Aucun résultat pour cette recherche »

### AS5 — Choisir un thème clair ou sombre

- **Étant donné** le visiteur consulte le site avec le thème clair
- **Quand** il choisit le thème sombre, change de page, puis revient plus tard sur le site
- **Alors** le thème sombre reste appliqué à chaque page, jusqu'à ce qu'il choisisse à nouveau le thème clair

### AS6 — Voir les épreuves en cours

- **Étant donné** une épreuve « En cours », une épreuve « Programmé » et une épreuve « Terminé »
- **Quand** le visiteur ouvre le direct, puis qu'aucune épreuve n'est plus en cours
- **Alors** il ne voit que l'épreuve « En cours », avec son sport, son nom et son heure, puis le message « Aucune épreuve en cours pour le moment »

### AS7 — Le direct se met à jour sans action du visiteur

- **Étant donné** le visiteur a ouvert le direct et une épreuve vient de commencer
- **Quand** il reste sur la page, sans recharger ni cliquer
- **Alors** l'épreuve apparaît en moins de 30 secondes, et une épreuve qui se termine disparaît dans le même délai

## Hors périmètre

- La saisie des résultats, les fiches d'athlètes, les pages « Disciplines » et « Athlètes » du menu de la maquette, ses liens de pied de page et les réseaux sociaux.
- Les filtres par continent et par jour des blocs de l'accueil, et le classement ou les performances dans le direct.

## Questions ouvertes

- Chiffres clés : hypothèse, ceux de la maquette, fixes, même si le jeu de démonstration contient moins de nations. Sénégal hors des 10 premiers : hypothèse, il n'est pas ajouté au bloc.
- Thème : hypothèse, clair à la première visite, mémorisé sur l'appareil. Recherche : hypothèse, à partir de 2 caractères, sur les nations, les sports, les épreuves et les athlètes.
- Visuels de la maquette (lion, emblème, anneaux) : hypothèse, le risque du PRD reste ouvert ; aucune diffusion publique sans autorisation.
