import { useState, useEffect } from "react";
import getTwoFilmsWithDifferentAverageRatings from "./functions/getTwoFilmsWithDifferentAverageRatings";
import HighScore from "./components/HighScore";
import CurrentScore from "./components/CurrentScore";
import ReferenceFilm from "./components/ReferenceFilm";
import FilmToGuess from "./components/FilmToGuess";

function App() {
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [referenceFilmDetailsObject, setReferenceFilmDetailsObject] = useState(null);
  const [filmDetailsObjectToGuess, setFilmDetailsObjectToGuess] = useState(null);
  const changeFilms = () => {
    getTwoFilmsWithDifferentAverageRatings()
      .then(([film1, film2]) => {
        setReferenceFilmDetailsObject(film1);
        setFilmDetailsObjectToGuess(film2);
      });
  };
  useEffect(() => {
    changeFilms();
  }, []);
  const processReferenceFilmSelection = () => {
    processFilmSelection(referenceFilmDetailsObject);
  }
  const processFilmToGuessSelection = () => {
    processFilmSelection(filmDetailsObjectToGuess);
  }
  // TODO: split function up/make it more concise
  const processFilmSelection = (selectedFilmDetailsObject) => {
    let opponentFilmDetailsObject;
    if (selectedFilmDetailsObject === referenceFilmDetailsObject) {
      opponentFilmDetailsObject = filmDetailsObjectToGuess;
    } else {
      opponentFilmDetailsObject = referenceFilmDetailsObject;
    }

    if (selectedFilmDetailsObject.averageRatingString > opponentFilmDetailsObject.averageRatingString) {
      setCurrentScore(currentScore => currentScore + 1);
    } else {
      setCurrentScore(0);
    }

    changeFilms();
  };
  useEffect(() => {
    // TODO: make sure you don't need to do something like in class-based React to ensure 
    // the right values are used below because of async
    if (currentScore > highScore) {
      setHighScore(currentScore);
    }
  }, [currentScore])
  return (
    <div className="App">
      <HighScore
        score={highScore}
      />
      <CurrentScore
        score={currentScore}
      />
      {referenceFilmDetailsObject && 
        <ReferenceFilm
          filmDetailsObject={referenceFilmDetailsObject}
          onReferenceFilmClick={processReferenceFilmSelection}
        />
      }
      {filmDetailsObjectToGuess &&
        <FilmToGuess
          filmDetailsObject={filmDetailsObjectToGuess}
          onFilmToGuessClick={processFilmToGuessSelection}
        />
      }
    </div>
  );
}

export default App;
