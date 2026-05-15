# Améliorations proposées — SW Rune Reader

## 1. Découper `uploader.js` (composant monolithique)

**Problème :** Le composant fait ~300 lignes et gère tout : parsing, stockage, filtres, tri, pagination, rendu.

**Solution :**
- Extraire la logique de parsing/import dans un hook `useRuneImport`
- Créer un composant `RuneFilters` pour les filtres
- Créer un composant `EfficiencySlider` réutilisable (le même slider est dupliqué 6 fois)

---

## 2. Factoriser `Rune.js`

**Problème :** Le constructeur duplique 4 fois la même logique pour ancient/normal × gemme/non-gemme.

**Solution :** Créer une fonction helper :
```js
const getStatValues = (statId, ancient, gemmed) => {
    const prefix = ancient ? 'a' : '';
    const gemPrefix = gemmed ? 'gemme_' : '';
    return {
        min_hero: runeStats[statId][`${prefix}${gemPrefix}min_hero`],
        max_hero: runeStats[statId][`${prefix}${gemPrefix}max_hero`],
        min_leg: runeStats[statId][`${prefix}${gemPrefix}min_leg`],
        max_leg: runeStats[statId][`${prefix}${gemPrefix}max_leg`],
    };
};
```

---

## 3. Ajouter un `try/catch` sur le parsing JSON

**Problème :** Si le fichier uploadé est mal formé, `JSON.parse` crashe sans message.

**Solution :**
```js
try {
    const data = JSON.parse(e.target.result);
    // ... traitement
} catch (err) {
    alert("Fichier JSON invalide : " + err.message);
    return;
}
```

---

## 4. Corriger le `.sort()` qui mute le state

**Problème :** `filteredRunes.sort()` modifie le tableau en place, ce qui peut causer des re-renders inattendus.

**Solution :**
```js
const sortedRunes = [...filteredRunes].sort((a, b) => { ... });
```

---

## 5. Ajouter `useMemo` pour les performances

**Problème :** Le filtrage et le tri se recalculent à chaque render.

**Solution :**
```js
const filteredRunes = useMemo(() => {
    return runes.filter((rune) => { ... });
}, [runes, filters, efficiencyRange]);

const sortedRunes = useMemo(() => {
    return [...filteredRunes].sort((a, b) => { ... });
}, [filteredRunes, sortOrder]);
```

---

## 6. Supprimer `this.shuffleit = data` dans `Rune.js`

**Problème :** Stocke l'intégralité du JSON brut de chaque rune en mémoire et dans IndexedDB, sans être utilisé.

**Solution :** Supprimer la ligne `this.shuffleit = data;`

---

## 7. Extraire les `customStyles` de react-select

**Problème :** Définis dans le composant mais ne changent jamais.

**Solution :** Les déplacer dans un fichier `src/theme/selectStyles.js` et les importer.

---

## 8. Supprimer les imports `React` inutilisés

**Problème :** `import React` dans `uploader.js` et `rune_component.js` n'est plus nécessaire avec React 18.

**Solution :** Supprimer ces imports ou les remplacer par des imports nommés si besoin (`useState`, `useEffect`, etc.).

---

## 9. Déplacer `update.js` hors de `src/`

**Problème :** Script Node.js (`require("fs")`) mélangé avec le code front-end.

**Solution :** Déplacer vers `scripts/update.js` et mettre à jour le script npm :
```json
"update-data": "node ./scripts/update.js"
```

---

## 10. Ajouter un `try/catch` sur les opérations IndexedDB

**Problème :** Si IndexedDB est bloqué (mode privé), l'app crashe silencieusement.

**Solution :** Wrapper les appels dans `try/catch` et afficher un fallback :
```js
try {
    const storedRunes = await getAllItems('runes');
    setRunes(storedRunes);
} catch (err) {
    console.error("IndexedDB indisponible :", err);
    // Afficher un message à l'utilisateur
}
```

---

## 11. Remplacer `for...in` par `for...of` sur les tableaux

**Problème :** `for...in` itère aussi sur les propriétés du prototype, ce qui est risqué sur des tableaux.

**Solution :** Utiliser `for...of` ou `.forEach()` pour `data['unit_list']` et `data['runes']`.

---

## 12. Harmoniser les conventions de nommage des fichiers

**Problème :** Mix de snake_case (`rune_component.js`), PascalCase (`Monster.js`) et camelCase (`runeSets.js`).

**Solution :** Adopter une convention unique. Suggestion :
- PascalCase pour les composants React : `RuneComponent.js`, `Pagination.js`, `Uploader.js`
- camelCase pour les utilitaires/data : `runeSets.js`, `runeStats.js`, `indexedDB.js`

---

## 13. Réduire les styles inline

**Problème :** Beaucoup de `style={{...}}` dans le JSX.

**Solution :** Déplacer ces styles dans `App.css` avec des classes dédiées.
