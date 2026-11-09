# 005 — Les vrais résultats des Jeux

**Statut** : Validée
**PRD** : specs/prd-jojpulse.md, TR5

## Contexte

Le site montre des données de démonstration, alors que les Jeux ont commencé et que le public veut savoir qui a vraiment gagné. Cette tranche affiche les vrais résultats depuis le 31 octobre 2026, en disant d'où ils viennent et sans rien inventer.

## User stories

- En tant que spectateur, je veux lire les vrais podiums et le vrai classement des nations, afin de savoir qui a gagné.
- En tant que journaliste accrédité, je veux connaître la source, la date des données et leurs écarts, afin de juger si je peux m'y fier.

## Scénarios d'acceptation

### AS1 — Lire un vrai podium

- **Étant donné** la source publie le podium du 100 m hommes du 8 novembre 2026
- **Quand** le visiteur consulte cette épreuve
- **Alors** il voit « 1, Nigeria, Gift Bright, 10,28 s », « 2, Chine, Zhang Hangyu, 10,57 s » et « 3, Pologne, Szymon Dołęga, 10,61 s », et aucun nom « Démo » sur le site

### AS2 — Connaître la source et la date des données

- **Étant donné** les données ont été extraites le 8 novembre 2026
- **Quand** le visiteur ouvre n'importe quelle page
- **Alors** il voit « Source : Wikipédia (CC BY-SA), données du 8 novembre 2026 », avec un lien vers la source, et non « Données de démonstration »

### AS3 — Une épreuve sans résultat publié n'en invente aucun

- **Étant donné** la source ne publie aucun podium pour une épreuve du 7 novembre, ni pour une épreuve du 12 novembre, et les données datent du 8 novembre
- **Quand** le visiteur consulte ces épreuves
- **Alors** la première affiche « Résultat non publié » et la seconde « Programmé », sans classement ni médaille

### AS4 — Calculer le classement à partir des podiums

- **Étant donné** le podium du 100 m hommes est la seule médaille du Nigeria et de la Pologne dans les données
- **Quand** le visiteur consulte le classement des nations
- **Alors** le Nigeria compte 1-0-0 et la Pologne 0-0-1, et les 205 délégations figurent au classement, médaillées ou non

### AS5 — Signaler un écart avec le tableau de la source

- **Étant donné** la source annonce 2-1-1 pour le Portugal, et ses podiums publiés lui donnent 1-1-1
- **Quand** le visiteur consulte le classement des nations
- **Alors** le Portugal reste classé avec 1-1-1, et il voit « Écart avec la source : Portugal, 2-1-1 annoncé »

### AS6 — Une équipe mixte n'est comptée pour aucune nation

- **Étant donné** une équipe réunissant plusieurs nations remporte l'or par équipes en équitation
- **Quand** le visiteur consulte les médailles, puis le classement
- **Alors** il voit l'or au nom de l'équipe, avec la mention « Équipe mixte », et aucune nation ne reçoit cette médaille au classement

### AS7 — Relancer une extraction à la main

- **Étant donné** la source a publié un nouveau podium et corrigé un ancien depuis la dernière extraction
- **Quand** l'exploitant relance l'extraction, puis la relance alors que la source ne répond plus
- **Alors** le site montre d'abord les deux changements avec la nouvelle date, puis garde ces données et cette date, et l'exploitant voit que l'extraction a échoué

## Hors périmètre

- Les classements complets, le site officiel, et toute extraction automatique ou en direct : les données changent seulement à l'extraction suivante.
- La correction manuelle d'un résultat, et les fiches d'athlètes.

## Questions ouvertes

- Effet sur les specs 001 à 004 : hypothèse, AS2 remplace la mention de démonstration (001-AS7, 002-AS1, 003-AS1, 004-AS1), et 004-AS1 passe de 206 à 205 nations, le chiffre de la source. L'exemple kényan de 001-AS3 est corrigé. Un podium sans performance publiée s'affiche sans performance.
- Direct et statut : hypothèse, la source ne dit pas ce qui est en cours, donc le direct affiche son message habituel. Un podium publié vaut « Terminé » ; sinon, le statut dépend de la date, comme dans AS3.
- Noms : hypothèse, épreuves et nations en français, athlètes comme dans la source. L'équipe des réfugiés est une délégation classée. Noms de mineurs : hypothèse, ceux que publie la source, à revoir avant toute diffusion hors atelier.
