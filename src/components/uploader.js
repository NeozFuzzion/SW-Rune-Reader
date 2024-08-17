import React, { useState } from 'react';
import Rune from "../Rune";
import Monster from "../Monster";
import monstersData from '../data/monsters_data.json';

const JsonUploader = () => {
    const [jsonData, setJsonData] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        const runeset = {}
        const monsterset = {}



        reader.onload = async (e) => {
            const data = JSON.parse(e.target.result);
            setJsonData(data['unit_list']);
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

            console.log(JSON.stringify(runeset));
            localStorage.setItem('runes', JSON.stringify(runeset));

            localStorage.setItem('monsters', JSON.stringify(monsterset));
        };
        reader.readAsText(file);
    };

    const clearData = () => {
        setJsonData(null);
        localStorage.removeItem('runes');
        localStorage.removeItem('monsters');
    };

    return (
        <div>
            <h2>Upload and Manipulate JSON Data</h2>
            <input type="file" accept=".json" onChange={handleFileUpload} />
            <button onClick={clearData}>Clear Data</button>
            {jsonData && (
                <div>
                    <h3>JSON Data:</h3>
                    <pre>{JSON.stringify(jsonData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default JsonUploader;