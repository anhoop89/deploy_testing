import React, { useState, useEffect } from "react";
import WordsAPI from "../api/WordsAPI";
import SearchBar from "../components/SearchBar";
import Definitions from "../components/dictionary/Definitions";
import DefinitionVisual from "../components/dictionary/DefinitionVisual";
import NoResultsMessage from "../components/NoResultsMessage";
import LoadingAnimation from "../components/LoadingAnimation";

const WordsPage = () => {
  const [word, setWord] = useState("");
  const [data, setData] = useState(null);
  const [searchedWord, setSearchedWord] = useState("");
  const [searchAttempt, setSearchAttempt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wordArray, setWordArray] = useState([]);
  const [freqArray, setFreqArray] = useState([]);
  const [barData, setBarData] = useState({});

  const maxChartData = 10;

  const graphOptions = {
    indexAxis: "y",
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          // color: '#2b819b',
        },
      },
      x: {
        grid: {
          color: "#2b819b",
        },
      },
    },
  };

  // Update the list of words and frequencies to use as data for the bar chart.
  // Only update the arrays if there exists both definitions and frequencies for
  // that word and it isn't already in the array.
  // Once the arrays reach max size only store the most recent words.
  function updateGraphInfo(data) {
    if (data.results && data.frequency) {
      if (
        wordArray.length === 0 ||
        (wordArray.length > 0 && !wordArray.includes(data.word))
      ) {
        setWordArray((current) => [...current, data.word]);
        setFreqArray((current) => [...current, data.frequency]);
      }
      if (wordArray.length >= maxChartData) {
        setWordArray((current) => [...current.slice(1)]);
        setFreqArray((current) => [...current.slice(1)]);
      }
    }
  }

  // Re-render the bar chart every time a user enters a word by using wordArray and
  // freqArray as dependencies, which are updated every fetch in updateGraphInfo().
  useEffect(() => {
    setBarData({
      labels: wordArray,
      datasets: [
        {
          data: freqArray,
          borderWidth: 2,
          backgroundColor: "#2b819b",
          maxBarThickness: 50,
        },
      ],
    });
  }, [wordArray, freqArray]);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await WordsAPI(word);
    setIsLoading(false);
    setSearchAttempt(true);
    setSearchedWord(word);
    setData(data);
    updateGraphInfo(data);
  };

  return (
    <section
      className="Define-Section text-light mx-auto mt-5"
      style={{ maxWidth: "768px", backgroundColor: "var(--bs-darker)" }}
    >
      <h1 className="Define-H1 text-center m-auto pb-4">Dictionary</h1>
      <h2
        className="Define-H1 text-center m-auto pb-4"
        style={{ color: "#CCCCCC", fontSize: "26.5px" }}
      >
        Compare the frequencies of different words!
      </h2>
      <SearchBar
        value={word}
        onChange={(e) => setWord(e.target.value.trim())}
        onSearch={fetchData}
      />
      {isLoading && <LoadingAnimation />}
      {!isLoading && data && data.results && data.results.length > 0 ? (
        <>
          <Definitions data={data} />
          <DefinitionVisual barData={barData} graphOptions={graphOptions} />
        </>
      ) : (
        !isLoading &&
        searchAttempt && <NoResultsMessage searchedWord={searchedWord} />
      )}
    </section>
  );
};

export default WordsPage;
