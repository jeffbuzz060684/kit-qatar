# Kit de survie Qatar 🇶🇦

Traducteur de survie **FR → EN** hors ligne (PWA installable) : 215 mots, 167 phrases, prononciation à la française, favoris, urgences Qatar, mots arabes.

- 100 % autonome : aucune ressource externe, fonctionne en mode avion.
- Données uniquement sur l'appareil (localStorage) — aucun compte, aucun réseau.
- Déploiement : GitHub Pages, à chaque push sur `main`.

## Développement

- `index.html` : l'app complète (fichier unique, JS vanilla).
- `sw.js` + `manifest.webmanifest` : mode hors ligne + installation écran d'accueil.
- `tools/gen-icons.js` : génère les icônes PNG lors du déploiement (Node pur, aucun binaire).
