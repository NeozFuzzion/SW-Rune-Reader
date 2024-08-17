import React, {useEffect, useState} from 'react';
import Rune from "../Rune";
import Monster from "../Monster";
import monstersData from '../data/monsters_data.json';
import RuneComponent from "./rune_component";

const JsonUploader = () => {
    const [runes, setRunes] = useState([]);
    const [monsters, setMonsters] = useState([]);

    useEffect(() => {
        // Load runes from local storage
        const storedRunes = localStorage.getItem('runes');
        if (storedRunes) {
            const parsedRunes = JSON.parse(storedRunes);
            setRunes(Object.values(parsedRunes)); // Convert the object to an array
        }
        const storedMonsters = localStorage.getItem('monsters');
        if (storedMonsters) {
            const parsedMonsters = JSON.parse(storedMonsters);
            setMonsters(Object.values(storedMonsters)); // Convert the object to an array
        }
    }, []);

    const clearData = () => {
        setRunes([]);
        localStorage.removeItem('runes');
        localStorage.removeItem('monsters');
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader(file);
        const runeset = {}
        const monsterset = {}



        reader.onload = async (e) => {
            const data = JSON.parse(e.target.result);
            for (let datumKey in data['unit_list']) {

                // Get the rights elements
                const monster = monstersData[data['unit_list'][datumKey]["unit_master_id"]]

                monsterset[data['unit_list'][datumKey]["unit_id"]] = new Monster(data['unit_list'][datumKey]["unit_id"],data['unit_list'][datumKey]["unit_lvl"],monster["name"],monster["image_filename"],monster["element"])

                for (let datum in data['unit_list'][datumKey]["runes"]) {
                    runeset[data['unit_list'][datumKey]["runes"][datum]["rune_id"]] = new Rune(data['unit_list'][datumKey]["runes"][datum]);
                }

            }
            for (let datumKey in data['runes']) {
                runeset[data["runes"][datumKey]["rune_id"]] = new Rune(data["runes"][datumKey]);
            }
            localStorage.setItem('userData', JSON.stringify(data['unit_list']));


            localStorage.setItem('runes', JSON.stringify(runeset));

            localStorage.setItem('monsters', JSON.stringify(monsterset));

            const storedRunes = localStorage.getItem('runes');
            if (storedRunes) {
                const parsedRunes = JSON.parse(storedRunes);
                setRunes(Object.values(parsedRunes)); // Convert the object to an array
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>

            <div style={{padding: '20px'}}>
                <h1>Your Runes</h1>
                <button onClick={clearData}>Clear Data</button>
                {runes.length === 0 ? (
                    <div>
                        <p>No runes to display. Please upload a JSON file.</p>
                        <input type="file" accept=".json" onChange={handleFileUpload}/>
                    </div>
                ) : (
                    <div style={{marginTop: '20px'}}>
                        {runes.map((rune) => (
                            <RuneComponent key={rune.rune_id} data={rune}/>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default JsonUploader;