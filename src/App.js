import './App.css';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import JsonUploader from "./components/uploader";
import RuneStatsPage from "./components/rune_stats_page";
import { I18nProvider, useI18n } from './i18n';

function AppContent() {
    const { t, lang, switchLang } = useI18n();

    return (
        <div className="App">
            <header className="App-header">
                <div className="header-top">
                    <h3>{t('appTitle')}</h3>
                    <div className="lang-switcher">
                        <button
                            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                            onClick={() => switchLang('en')}
                        >
                            EN
                        </button>
                        <button
                            className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
                            onClick={() => switchLang('fr')}
                        >
                            FR
                        </button>
                    </div>
                </div>
                <nav className="App-nav">
                    <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                        {t('navRunes')}
                    </NavLink>
                    <NavLink to="/stats" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                        {t('navStats')}
                    </NavLink>
                </nav>
            </header>
            <Routes>
                <Route path="/" element={<JsonUploader />} />
                <Route path="/stats" element={<RuneStatsPage />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <I18nProvider>
                <AppContent />
            </I18nProvider>
        </Router>
    );
}

export default App;
