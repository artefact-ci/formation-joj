# Origine des données

Les fichiers JSON de ce dossier sont produits par `pnpm data:extract` à partir des pages
[2026 Summer Youth Olympics](https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics) de
Wikipédia en anglais et de leurs pages de sport et d'épreuve. Ils sont diffusés sous la licence
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) de leur source. Les noms français
des épreuves et des nations viennent de `scripts/reference/`.

Ce n'est pas une source officielle : un résultat peut y être faux ou en retard. Ne pas modifier
ces fichiers à la main : relancer l'extraction, puis `pnpm db:reset`.
