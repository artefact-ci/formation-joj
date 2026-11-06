# PRD — Bénévoles

**Statut** : Validé

## Problème

Chaque discipline a besoin de bénévoles pour accueillir le public. Les responsables de discipline gèrent les inscriptions sur papier : rien n'empêche d'inscrire plus de monde qu'un créneau n'en accepte, et des créneaux débordent.

## Utilisateurs

- Responsable de discipline : ouvrir des créneaux de bénévolat, chacun avec une capacité.
- Bénévole : s'inscrire sur un créneau, consulter qui y est inscrit, s'en désinscrire.

## Proposition

Le responsable ouvre un créneau avec une capacité ; les bénévoles s'y inscrivent, et l'application refuse toute inscription au-delà de la capacité. La règle est appliquée au moment de l'inscription, au lieu d'être recomptée à la main sur une feuille.

## Mesure du succès

Pendant la démo, un créneau de capacité 2 accepte deux bénévoles et refuse le troisième.

## Tranches

### TR1 — Ouvrir un créneau et s'y inscrire

Le responsable ouvre un créneau pour une discipline existante (début, fin après le début, capacité d'au moins 1). Un bénévole s'y inscrit avec son nom et son email. Règle : on n'inscrit personne sur un créneau complet.

### TR2 — Consulter un créneau

On voit les horaires d'un créneau, sa capacité, ses places restantes et ses inscrits dans l'ordre d'inscription. Règle : le même email ne s'inscrit pas deux fois sur un créneau.

### TR3 — Se désinscrire, et un écran

Un bénévole se désinscrit d'un créneau, et sa place se libère. Un écran permet de voir un créneau, de s'y inscrire et de s'en désinscrire. Règle : on ne désinscrit que quelqu'un d'inscrit.

## Hors périmètre

- La modification ou la suppression d'un créneau.
- Les emails de confirmation.
- Les comptes des bénévoles.

## Hypothèses et risques

- Hypothèse : un bénévole est identifié par son email, sans compte ; n'importe qui peut inscrire n'importe quel email. Acceptable pour une première version, sinon il faudra des comptes.
- Hypothèse : un bénévole peut s'inscrire sur deux créneaux qui se chevauchent. Si c'est faux, il faudra une règle de plus.
- Hypothèse : tout le monde peut ouvrir un créneau (pas de rôle vérifié dans l'application).
