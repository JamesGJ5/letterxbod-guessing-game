"use client";

import "../../globals.css";
import { useState, useEffect, useRef } from "react";
import HighScore from "../HighScore/HighScore";
import CurrentScore from "../CurrentScore/CurrentScore";
import FilmDetails from "../FilmDetails/FilmDetails";
import LoadingFilmDetails from "../LoadingFilmDetails/LoadingFilmDetails";

async function getFilmPairArray(numberOfPairs) {
  const filmPairArray = await fetch(`/api/filmPairs?numberOfPairs=${numberOfPairs}`);
  return await filmPairArray.json();
} 

function Game() {
  const [scoreObject, setScoreObject] = useState({ currentScore: 0, highScore: 0 });
  const [currentFilmPair, setCurrentFilmPair] = useState([]);
  // NOTE: giving animations ability to be disabled helps satisfy WCAG Level A
  const [areLoadingAnimationsEnabled, setAreLoadingAnimationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // NOTE: popping new film pair of this each time instead of saving all loaded film pairs 
  // in state, so that high-complexity copying of many film pairs needs not be done each 
  // time state is updated
  const filmPairArray = useRef([]);

  useEffect(loadScoreObject, []);
  useEffect(() => {
    storeInSession("scoreObject", scoreObject);
  }, [scoreObject]);

  useEffect(() => {
    initialiseFilmPairs();
  }, []);
  useEffect(() => {
    if (currentFilmPair.length === 2) {
      storeInSession("currentFilmPair", currentFilmPair);
    }
  }, [currentFilmPair]);

  function getNewHighScore(newCurrentScore, prevHighScore) {
    return Math.max(newCurrentScore, prevHighScore);
  }
  function getNewCurrentScore(selectionWasCorrect, prevCurrentScore) {
    return (selectionWasCorrect) ? prevCurrentScore + 1 : 0;
  }

  function getUpdatedScoreObject(selectionWasCorrect, prevCurrentScore, prevHighScore) {
    const newCurrentScore = getNewCurrentScore(selectionWasCorrect, prevCurrentScore);
    const newHighScore = getNewHighScore(newCurrentScore, prevHighScore);
    return { currentScore: newCurrentScore, highScore: newHighScore };
  }

  function updateScoreObject(selectionWasCorrect) {
    setScoreObject(
      ({currentScore, highScore}) =>
        getUpdatedScoreObject(selectionWasCorrect, currentScore, highScore)
    );
  }
  async function loadFilmPairArray() {
    const newFilmPairArray = await getFilmPairArray(100);
    filmPairArray.current = newFilmPairArray;
  }
  function getNextFilmPair() {
    return filmPairArray.current.pop();
  }

  async function changeFilms() {
    const newCurrentFilmPair = getNextFilmPair();
    setCurrentFilmPair(newCurrentFilmPair);
    if (filmPairArray.current.length !== 0) {
      return;
    }
    setIsLoading(true);
    await loadFilmPairArray();
    setIsLoading(false);
  }
  function updateScore(selectedFilmObject, otherFilmObject) {
    const selectionWasCorrect = (
      selectedFilmObject.averageRatingString > otherFilmObject.averageRatingString
    );
    updateScoreObject(selectionWasCorrect);
  }

  async function endRound(selectedFilmObject, otherFilmObject) {
    updateScore(selectedFilmObject, otherFilmObject);
    changeFilms();
  }
  function getOtherFilmObject(selectedFilmObject) {
    return (selectedFilmObject === currentFilmPair[0]) ?
      currentFilmPair[1] : currentFilmPair[0];
  }
  function getFromSessionStorage(key) {
    return JSON.parse(sessionStorage.getItem(key));
  }

  function selectFilm(selectedFilmObject) {
    const otherFilmObject = getOtherFilmObject(selectedFilmObject);
    endRound(selectedFilmObject, otherFilmObject);
  }
  async function loadInitialCurrentFilmPair() {
    const sessionCurrentFilmPair = getFromSessionStorage("currentFilmPair");
    (sessionCurrentFilmPair !== null) ?
      setCurrentFilmPair(sessionCurrentFilmPair) : await changeFilms();
  }
  async function initialiseFilmPairs() {
    await loadFilmPairArray();
    await loadInitialCurrentFilmPair();
    setIsLoading(false);
  }
  function storeInSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  function loadScoreObject() {
    const sessionScoreObject = getFromSessionStorage("scoreObject");
    sessionScoreObject !== null && setScoreObject(sessionScoreObject);
  }

  return (
    <div className="Game">

      <header aria-label="Instruction and scores">
        <h1 id="instruction">
          Guess the Film with the Higher Letterboxd Rating...
        </h1>
        <div aria-label="Scores">
          <CurrentScore score={scoreObject.currentScore} />
          <HighScore score={scoreObject.highScore} />
        </div>
      </header>

      <main
        aria-labelledby="instruction"
        aria-busy={isLoading === true}
      >

        {isLoading === false
          ?
          (<div className="FilmGrid">
            <FilmDetails
              filmObject={currentFilmPair[0]}
              onFilmClick={selectFilm}
              showAverageRating={true}
            />
            <FilmDetails
              filmObject={currentFilmPair[1]}
              onFilmClick={selectFilm}
              showAverageRating={false}
            />
          </div>)
          :
          <LoadingFilmDetails
            areLoadingAnimationsEnabled={areLoadingAnimationsEnabled}
            setAreLoadingAnimationsEnabled={setAreLoadingAnimationsEnabled}
          />
        }
        
      </main>

    </div>
  );
}

export default Game;
