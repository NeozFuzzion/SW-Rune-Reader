import logo from './logo.svg';
import './App.css';
import JsonUploader from "./components/uploader";

function App() {
    console.log(localStorage.getItem('runes'));
    console.log(localStorage.getItem('monsters'));
      return (
          <div className="App">
            <header className="App-header">
              <h1>JSON Manipulator</h1>
              <JsonUploader />
            </header>
          </div>
      );
}

export default App;
