import './App.css';
import React from "react";
import JsonUploader from "./components/uploader";

function App() {

      return (
          <div className="App">
              <header className="App-header">
                  <h3>JSON Manipulator by NeozFuzzion</h3>
              </header>
              <JsonUploader/>
          </div>

      );
}

export default App;
