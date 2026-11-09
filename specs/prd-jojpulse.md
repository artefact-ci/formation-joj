# PRD — JojPulse

**Statut** : Validé

## Problème

Aux JOJ Dakar 2026, 25 sports se déroulent en parallèle pendant deux semaines. Le public veut savoir vite qui a gagné, quand concourent les athlètes et où en sont les nations, mais doit passer d'une source à l'autre, souvent pensée pour une seule délégation.

## Utilisateurs

- **Spectateur** (sur place ou à distance) : savoir ce qui s'est passé aujourd'hui. Parcours : il ouvre la plateforme sur son téléphone, choisit un jour et un sport, puis lit le classement d'une épreuve.
- **Supporter d'une délégation** : suivre son pays. Parcours : il choisit sa nation, voit ses athlètes du jour et ses résultats, puis sa place au classement des nations. **Journaliste accrédité** : retrouver vite un résultat et un total de médailles. Parcours : il filtre par sport ou par type de médaille, puis relève l'épreuve, les médaillés et le classement.

## Proposition

JojPulse est une plateforme web, consultable sur téléphone comme sur ordinateur, qui réunit au même endroit les résultats, le calendrier, les médailles et le classement des nations, avec le même traitement pour tous les pays. Son identité visuelle suit la maquette `specs/assets/design.png` (vert, jaune, rouge et bleu nuit, avec Ayo, la mascotte des Jeux). Toutes les nations y figurent, et le Sénégal, pays hôte, est mis en évidence. Un site web évite toute installation, depuis les gradins comme depuis une salle de presse.

## Mesure du succès

Pendant la démo : un spectateur choisit un jour et un sport et lit le classement d'une épreuve terminée. Une épreuve à venir s'affiche « Programmé », sans classement. Le classement des nations place devant, à nombre d'or égal, la nation qui a le plus d'argent. Le filtre « médailles d'or » ne montre que des médailles d'or.

## Tranches

### TR1 — Consulter les résultats d'une journée

Le spectateur choisit un jour et un sport, et voit les épreuves regroupées par sport, avec leur statut, et le classement des épreuves terminées (rang, nation, athlète ou équipe, performance). Règles : une épreuve non terminée n'affiche pas de classement ; les mentions « disqualifié » ou « n'a pas terminé » remplacent la performance.

### TR2 — Classement des nations et médailles

Le visiteur voit les nations classées par or, puis argent, puis bronze, et les filtre par continent ; des nations à égalité parfaite partagent le même rang. Il voit aussi les médailles par sport et par épreuve, filtrées par sport ou par type. Une équipe médaillée compte pour une seule médaille.

### TR3 — Calendrier et suivi d'une délégation

Le visiteur parcourt les épreuves à venir par jour et par sport, à l'heure de Dakar ou à son heure locale. Le supporter choisit une nation : il filtre les résultats sur elle et voit ses athlètes du jour.

### TR4 — Accueil et direct

L'accueil suit la maquette : les chiffres clés des Jeux, le début du classement, les derniers résultats et toutes les disciplines. Le visiteur peut chercher sur tout le site et choisir un thème clair ou sombre. Une page de direct montre les épreuves en cours et se met à jour sans action du visiteur.

### TR5 — Les vrais résultats des Jeux

Le visiteur consulte les vrais résultats depuis le début des Jeux : les 151 épreuves, leur statut et leurs podiums, et le classement des nations calculé à partir de ces podiums. Règles : la source et la date d'extraction remplacent « Données de démonstration » ; une épreuve sans source reste sans résultat ; un écart avec le tableau des médailles de la source est signalé ; une nouvelle extraction se lance à la main.

## Hors périmètre

- Le chronométrage et le calcul des classements d'épreuve, les fiches d'athlètes, les notifications poussées, les réseaux sociaux, la boutique, les contenus éditoriaux et la publication ou correction de podiums (ancienne vision).

## Hypothèses et risques

- Supposé : Wikipédia (licence CC BY-SA, source à citer) suffit ; le site officiel interdit l'extraction automatique. Risque : JojPulse n'est pas une source officielle, ses résultats peuvent être faux ou en retard, et il publie les noms d'athlètes souvent mineurs. Supposé aussi : le droit d'utiliser les visuels de la maquette (lion, emblème, anneaux olympiques) est acquis pour l'atelier. Risque : ces marques sont protégées ; toute diffusion publique demande une autorisation ou leur retrait.
