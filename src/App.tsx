import React, { useEffect } from 'react';
import logo from './logo.svg';

// packages
import { openDB } from 'idb';

// styles
import './App.css';

const getDb = async () => {
  return await openDB('Pokemon', 1, {
    upgrade(db) {
      // Create a store of objects
      const store = db.createObjectStore('pokemon', {
        // The 'id' property of the object will be the key.
        keyPath: 'id',
        // If it isn't explicitly set, create a value by auto incrementing.
        autoIncrement: true,
      });
      // Create an index on the 'id' property of the objects.
      store.createIndex('id', 'id');
    },
  });
}

function App() {

  // check if we have cached data, if so use it. Otherwise make some api calls.
  useEffect(() => {
    async function getData() {
      const db = await getDb()
      const pokemon = await db.getAll('pokemon');

      if (pokemon.length === 0) {
        fetch('https://pokeapi.co/api/v2/pokemon')
          .then(res => res.json())
          .then(async (json) => {
              const tx = db.transaction('pokemon', 'readwrite');
              json.results.forEach((p: any) => {
                tx.store.add({
                  name: p.name,
                  url: p.url,
                })
              })
              await tx.done;            
          })          
      } else {
        alert(pokemon.length)
      }
    }
  
    getData()
  }, [])

  const deletePokemon = async () => {
    const db = await getDb()
    const tx = db.transaction('pokemon', 'readwrite');
    tx.store.delete(IDBKeyRange.lowerBound(0))
    await tx.done;        
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={deletePokemon}>Delete Pokemon Cache</button>
      </header>
    </div>
  );
}

export default App;
