import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
    en: {
        // Header
        appTitle: 'JSON Manipulator by NeozFuzzion',
        navRunes: 'Runes',
        navStats: '🚧 Statistics',

        // Uploader
        noRunes: 'No runes to display. Please upload a JSON file.',
        clearData: 'Clear Data',
        filterSet: 'Set :',
        filterSlot: 'Slot :',
        slotPrefix: 'Slot',
        filterMain: 'Main :',
        filterSubstats: 'Substats :',
        filterLevel: 'Level :',
        filterAncient: 'Ancient Runes:',
        ancientAll: 'All Runes',
        ancientWithout: 'Without Ancient Runes',
        ancientOnly: 'Only Ancient Runes',
        orderBy: 'Order by:',
        efficiency: 'Efficiency',
        efficiencyMinHero: 'Efficiency Min Hero',
        efficiencyMaxHero: 'Efficiency Max Hero',
        efficiencyMinLeg: 'Efficiency Min Leg',
        efficiencyMaxLeg: 'Efficiency Max Leg',
        gapMinHero: 'Gap Min Hero',
        gapMaxHero: 'Gap Max Hero',
        gapMinLeg: 'Gap Min Leg',
        gapMaxLeg: 'Gap Max Leg',
        ascending: 'Ascending',
        descending: 'Descending',
        itemsPerPage: 'Items per page:',
        effiMax: 'Effi. Max :',
        effiMinHeroLabel: 'Effi. Min Hero:',
        effiMaxHeroLabel: 'Effi. Max Hero:',
        effiMinLegLabel: 'Effi. Min Leg:',
        effiMaxLegLabel: 'Effi. Max Leg:',
        efficiencyLabel: 'Efficiency :',

        // Stats page
        statsTitle: 'Rune Statistics',
        runesCount: 'runes',
        chartsDisplayed: 'Displayed charts:',
        chartSetDistribution: 'Distribution by set',
        chartSlotDistribution: 'Distribution by slot',
        chartAncientDistribution: 'Normal vs Ancient',
        chartEfficiencyDistribution: 'Efficiency distribution',
        chartEfficiencyBySet: 'Average efficiency by set',
        chartEfficiencyBySlot: 'Average efficiency by slot',
        chartExplorer: 'Rune Explorer',
        loading: 'Loading data...',
        noRunesStats: 'No runes in database. Import a JSON file from the main page.',
        sets: 'Sets:',
        slots: 'Slots:',
        metrics: 'Metrics:',
        allSets: 'All sets',
        allSlots: 'All slots',
        chooseMetrics: 'Choose metrics',
        runeCount: 'Number of runes:',
        sortBy: 'Sort by:',
        efficiencyShort: 'Efficiency',
        effiMaxShort: 'Effi. Max',
        effiMinHeroShort: 'Effi. Min Hero',
        effiMaxHeroShort: 'Effi. Max Hero',
        effiMinLegShort: 'Effi. Min Leg',
        effiMaxLegShort: 'Effi. Max Leg',
        runesDisplayed: 'runes displayed',
        sortedBy: 'sorted by',
        sortDesc: 'descending',
        top: 'top',
        clickToView: 'Click on the chart to view a rune',
        runeAxisLabel: 'Rune #',
        efficiencyAxisLabel: 'Efficiency %',
        selectedRune: 'Selected rune',
        average: 'Average',
        avgEfficiency: 'Average efficiency',
        runeCountLabel: 'Rune count',
        normal: 'Normal',
        ancient: 'Ancient',

        // Rune component
        efficiencyComp: 'Efficiency :',
        heroComp: 'Hero :',
        legComp: 'Leg :',
    },
    fr: {
        appTitle: 'JSON Manipulator by NeozFuzzion',
        navRunes: 'Runes',
        navStats: '🚧 Statistiques',

        noRunes: 'Aucune rune à afficher. Veuillez importer un fichier JSON.',
        clearData: 'Effacer les données',
        filterSet: 'Set :',
        filterSlot: 'Slot :',
        slotPrefix: 'Slot',
        filterMain: 'Main :',
        filterSubstats: 'Substats :',
        filterLevel: 'Niveau :',
        filterAncient: 'Runes anciennes :',
        ancientAll: 'Toutes les runes',
        ancientWithout: 'Sans runes anciennes',
        ancientOnly: 'Runes anciennes uniquement',
        orderBy: 'Trier par :',
        efficiency: 'Efficience',
        efficiencyMinHero: 'Efficience Min Hero',
        efficiencyMaxHero: 'Efficience Max Hero',
        efficiencyMinLeg: 'Efficience Min Leg',
        efficiencyMaxLeg: 'Efficience Max Leg',
        gapMinHero: 'Écart Min Hero',
        gapMaxHero: 'Écart Max Hero',
        gapMinLeg: 'Écart Min Leg',
        gapMaxLeg: 'Écart Max Leg',
        ascending: 'Croissant',
        descending: 'Décroissant',
        itemsPerPage: 'Éléments par page :',
        effiMax: 'Effi. Max :',
        effiMinHeroLabel: 'Effi. Min Hero :',
        effiMaxHeroLabel: 'Effi. Max Hero :',
        effiMinLegLabel: 'Effi. Min Leg :',
        effiMaxLegLabel: 'Effi. Max Leg :',
        efficiencyLabel: 'Efficience :',

        statsTitle: 'Statistiques des runes',
        runesCount: 'runes',
        chartsDisplayed: 'Graphiques affichés :',
        chartSetDistribution: 'Répartition par set',
        chartSlotDistribution: 'Répartition par slot',
        chartAncientDistribution: 'Normal vs Ancient',
        chartEfficiencyDistribution: 'Distribution d\'efficience',
        chartEfficiencyBySet: 'Efficience moyenne par set',
        chartEfficiencyBySlot: 'Efficience moyenne par slot',
        chartExplorer: 'Explorateur de runes',
        loading: 'Chargement des données...',
        noRunesStats: 'Aucune rune en base. Importez un fichier JSON depuis la page principale.',
        sets: 'Sets :',
        slots: 'Slots :',
        metrics: 'Métriques :',
        allSets: 'Tous les sets',
        allSlots: 'Tous les slots',
        chooseMetrics: 'Choisir les métriques',
        runeCount: 'Nombre de runes :',
        sortBy: 'Trier par :',
        efficiencyShort: 'Efficience',
        effiMaxShort: 'Effi. Max',
        effiMinHeroShort: 'Effi. Min Hero',
        effiMaxHeroShort: 'Effi. Max Hero',
        effiMinLegShort: 'Effi. Min Leg',
        effiMaxLegShort: 'Effi. Max Leg',
        runesDisplayed: 'runes affichées',
        sortedBy: 'triées par',
        sortDesc: 'décroissante',
        top: 'top',
        clickToView: 'Cliquez sur le graphique pour voir une rune',
        runeAxisLabel: 'Rune #',
        efficiencyAxisLabel: 'Efficience %',
        selectedRune: 'Rune sélectionnée',
        average: 'Moyenne',
        avgEfficiency: 'Efficience moyenne',
        runeCountLabel: 'Nombre de runes',
        normal: 'Normal',
        ancient: 'Ancient',

        efficiencyComp: 'Efficience :',
        heroComp: 'Hero :',
        legComp: 'Leg :',
    }
};

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        try {
            return localStorage.getItem('app_lang') || 'en';
        } catch (_) { return 'en'; }
    });

    const t = useCallback((key) => {
        return translations[lang]?.[key] || translations['en']?.[key] || key;
    }, [lang]);

    const switchLang = useCallback((newLang) => {
        setLang(newLang);
        try { localStorage.setItem('app_lang', newLang); } catch (_) { /* ignore */ }
    }, []);

    return (
        <I18nContext.Provider value={{ lang, t, switchLang }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);
