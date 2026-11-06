# 001 — Bénévoles : ouvrir un créneau et s'y inscrire

**Statut** : Validée
**PRD** : specs/prd-benevoles.md, TR1

## Contexte

Les responsables de discipline gèrent les inscriptions des bénévoles sur papier, et des créneaux débordent. Cette tranche permet d'ouvrir un créneau avec une capacité et d'y inscrire des bénévoles, en refusant toute inscription au-delà de la capacité. Seulement par l'API, sans écran.

## User stories

- En tant que responsable de discipline, je veux ouvrir un créneau avec une capacité pour ma discipline, afin que les bénévoles s'y inscrivent.
- En tant que bénévole, je veux m'inscrire sur un créneau avec mon nom et mon email, afin d'aider pendant les Jeux.

## Scénarios d'acceptation

### AS1 — Ouvrir un créneau

- **Étant donné** la discipline « Lutte » · **Quand** le responsable ouvre un créneau le 2 novembre 2026 de 9 h à 12 h avec une capacité de 2 · **Alors** le créneau est enregistré avec sa discipline, ses horaires, sa capacité, et 2 places restantes.

### AS2 — Créneau invalide

- **Étant donné** la discipline « Lutte » · **Quand** le responsable ouvre un créneau dont la capacité vaut 0, est négative ou n'est pas un entier, ou dont la fin est avant le début ou égale au début · **Alors** c'est refusé comme donnée invalide, et aucun créneau n'est enregistré ; une capacité de 1 est acceptée.

### AS3 — Discipline inconnue

- **Étant donné** une discipline qui n'existe pas · **Quand** le responsable ouvre un créneau pour elle · **Alors** c'est refusé : la discipline est introuvable, et aucun créneau n'est enregistré.

### AS4 — S'inscrire sur un créneau

- **Étant donné** un créneau de capacité 2 sans inscrit · **Quand** Awa s'inscrit avec son nom et son email · **Alors** l'inscription est acceptée et il reste 1 place.

### AS5 — Prendre la dernière place

- **Étant donné** un créneau de capacité 2 où Awa est inscrite · **Quand** Moussa s'inscrit · **Alors** l'inscription est acceptée et il reste 0 place.

### AS6 — Créneau complet

- **Étant donné** un créneau de capacité 2 où Awa et Moussa sont inscrits · **Quand** Fatou essaie de s'inscrire · **Alors** c'est refusé : 409, code `SLOT_FULL`, et le créneau compte toujours 2 inscrits.

### AS7 — Créneau inconnu

- **Étant donné** un créneau qui n'existe pas · **Quand** un bénévole essaie de s'y inscrire · **Alors** c'est refusé : le créneau est introuvable.

### AS8 — Inscription invalide

- **Étant donné** un créneau avec des places · **Quand** un bénévole s'inscrit avec un nom vide ou fait d'espaces, ou un email mal formé · **Alors** c'est refusé comme donnée invalide, et personne n'est inscrit.

## Hors périmètre

- Consulter un créneau et ses inscrits, et refuser le même email deux fois sur un créneau (tranche 2).
- Se désinscrire, et tout écran (tranche 3).
- Modifier ou supprimer un créneau, les emails de confirmation, les comptes des bénévoles.

## Questions ouvertes

- Le même email inscrit deux fois sur un créneau : accepté dans cette tranche (la règle arrive en tranche 2) ; chaque inscription prend une place.
- Un créneau dans le passé : accepté, la tranche ne fixe aucune règle de date.
- Deux inscriptions simultanées sur la dernière place : une seule est acceptée, l'autre reçoit `SLOT_FULL`.
