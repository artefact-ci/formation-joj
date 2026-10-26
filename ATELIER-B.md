# Atelier B : Bénévoles

**Le besoin.** Inscrire un bénévole (nom, email) sur un créneau d'une discipline. Un créneau a une capacité maximale. On ne peut pas inscrire deux fois le même email sur un créneau.

**Deux règles métier, chacune testée :**

- créneau complet → refus, 409, avec un code d'erreur `AppError` dédié ;
- email déjà inscrit sur ce créneau → refus, 409, avec son propre code.

**Le cycle :** `/spec <le besoin ci-dessus>` → tu relis et valides → `/spec-plan` → tu relis et valides → `/tdd-task` → `/converge`, jusqu'à « Converged ». Voir la section « Méthode » du [README](README.md#méthode).
