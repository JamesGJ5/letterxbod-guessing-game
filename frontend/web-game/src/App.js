import "./styles/App.css";
import { useState, useEffect } from "react";
import getFilmPair from "./functions/getFilmPair";
import HighScore from "./components/HighScore";
import CurrentScore from "./components/CurrentScore";
import ReferenceFilm from "./components/FilmHidingRating";
import FilmToGuess from "./components/FilmShowingRating";

function App() {
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [filmObjectArray, setFilmObjectArray] = useState(null);

  useEffect(() => changeFilms, []);
  useEffect(() => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
    }
  }, [currentScore])

  const changeFilms = async () => {
    const newFilmObjectArray = await getFilmPair();
    setFilmObjectArray(newFilmObjectArray);
  };
  const processReferenceFilmSelection = () => {
    processFilmSelection(0);
  }
  const processFilmToGuessSelection = () => {
    processFilmSelection(1);
  }
  const processFilmSelection = (selectedFilmObjectIndex) => {
    const selectedFilmObject = filmObjectArray[selectedFilmObjectIndex];
    const opponentFilmObject = filmObjectArray[1 - selectedFilmObjectIndex];
    updateScore(selectedFilmObject, opponentFilmObject);
    changeFilms();
  };
  const updateScore = (selectedFilmObject, opponentFilmObject) => {
    if (selectedFilmObject.averageRatingString > opponentFilmObject.averageRatingString) {
      setCurrentScore(currentScore => currentScore + 1);
    } else {
      setCurrentScore(0);
    }
  };

  return (
    <div className="App">
      <div className="Header">
        <CurrentScore
          score={currentScore}
        />
        Guess the film with the higher Letterboxd rating...
        <HighScore
          score={highScore}
        />
      </div>
      {filmObjectArray &&
        <div className="Films">
          <ReferenceFilm
            filmObject={filmObjectArray[0]}
            onFilmClick={processReferenceFilmSelection}
          />
          <FilmToGuess
            filmObject={filmObjectArray[1]}
            onFilmClick={processFilmToGuessSelection}
          />
        </div>
      }
      <div className="Footer">
        Made by James Graça-Jones
      </div>
    </div>
  );
}

export default App;
