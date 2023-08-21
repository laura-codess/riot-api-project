import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import React from 'react';
import './index.css'

function App() {
  const [searchText1, setSearchText1] = useState("");
  const [searchText2, setSearchText2] = useState("");
  const [playerInfo1, setPlayerInfo1] = useState({});
  const [playerInfo2, setPlayerInfo2] = useState({});
  const [playerIcon1, setPlayerIcon1] = useState(0);
  const [playerIcon2, setPlayerIcon2] = useState(0);
  const [player1MatchData, setPlayer1MatchData] = useState([]);
  const [player2MatchData, setPlayer2MatchData] = useState([]);
  const [sameMatches, setSameMatches] = useState([]);
  const [wins, setWins] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const[isCalculationDone, setIsCalculationDone] = useState(false);

  async function searchForPlayer(playerNumber) {
    const searchText = playerNumber === 1 ? searchText1 : searchText2;
    try {
      const response = await axios.get("http://localhost:8000/playerInfo", {
        params: {
          playerName: searchText
        }
      });
      const playerInfo = response.data;

      if (playerNumber === 1) {
        setPlayerInfo1(playerInfo);
        getPlayerIcon(playerInfo, 1);
      } else if (playerNumber === 2) {
        setPlayerInfo2(playerInfo);
        getPlayerIcon(playerInfo, 2);
      }
      
      console.log(playerInfo);

      // after updating playerinfo, fetch the player icon
      getPlayerIcon(playerInfo, playerNumber);
    } catch (error) {
      console.log("Error sending player name: ", error);
    }
  }

  async function getPlayerIcon(playerInfo, playerNumber) {
    if(!playerInfo) {
      console.log("Player info not available.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/playerIcon", {
        params: {
          playerName: playerInfo.name
        }
      });
      const playerIconNumber = response.data;
      
      if (playerNumber === 1) {
        setPlayerIcon1(playerIconNumber);
        console.log("Player 1 Icon updated:", playerIconNumber);
      } else if (playerNumber === 2) {
        setPlayerIcon2(playerIconNumber);
        console.log("Player 2 Icon updated:", playerIconNumber);
      }
      console.log(playerIconNumber);
    } catch (error) {
      console.log("Error sending player icon number: ", error);
    }
  }

  async function getSameMatches() {
    try {
      const response1 = await axios.get("http://localhost:8000/getMatches", {
        params: {
          playerName: playerInfo1.name,
        }
      });
      const response2 = await axios.get("http://localhost:8000/getMatches", {
        params: {
          playerName: playerInfo2.name,
        }
      });
      setPlayer1MatchData(response1.data);
      setPlayer2MatchData(response2.data);
      console.log("Player 1 matches: " + player1MatchData);
      console.log("Player 2 matches: " + player2MatchData);

    } catch (error) {
      console.log("Error fetching same matches: ", error);
    }
  }
  useEffect(() => {
      // for loop one, store all of the matches into a set
      const player1Set = new Set();
      for(let matchId of player1MatchData) {
        player1Set.add(matchId);
      }

      // for loop two, iterate through each of player2matches and see if it exists in set
      const sameMatchArray = [];
      for(let matchId of player2MatchData) {
        if(player1Set.has(matchId)) {
          sameMatchArray.push(matchId);
        }
      }

      setSameMatches(sameMatchArray);
      console.log(sameMatches);
      // if true, add to the sameMatchesArray

  }, [player1MatchData, player2MatchData]);
  
  async function analyzeMatches() {
    setIsLoading(true);
  
    getSameMatches()
      .then(() => {
        // perform the analysis using the updated sameMatches
        return axios.post("http://localhost:8000/analyzeMatches", {
          sameMatches: sameMatches,
          playerName: playerInfo1.name
        });
      })
      .then(response => {
        setWins(response.data);
        console.log(response.data);
        setIsLoading(false);
        setIsCalculationDone(true);
      })
      .catch(error => {
        console.log("Error grabbing wins: ", error);
        setIsLoading(false);
        setIsCalculationDone(false);
      });
  }
  
  // async function analyzeMatches() {
  //   try {
  //     setIsLoading(true);
  //     await getSameMatches();
      
  //     // perform the analysis using the updated sameMatches
  //     const response = await axios.post("http://localhost:8000/analyzeMatches", {
  //       sameMatches: sameMatches,
  //       playerName: playerInfo1.name
  //     })

  //     setWins(response.data);
  //     console.log(response.data);
  //     setIsLoading(false);
  //     setIsCalculationDone(true);
  //   } catch (error) {
  //     console.log("Error grabbing wins: ", error);
  //     setIsLoading(false);
  //     setIsCalculationDone(false);
  //   }
  // }
  

  // html part of code
  return (
    <div className="App">
      
      <div className='Title'>
      <h1 data-text="synergy:"></h1>
      <p className='SubHeader'>by laura &lt;3</p>
      </div>

      {/* HEADER */}
      <div className='middle'>
      {/* SEARCH BARS */}
      <div className='searchBars'>
        <div className='searchBar'>
          <p className='info'>player 1 name</p>
          <input type="text" onChange={e => setSearchText1(e.target.value)}></input>
          <button onClick={() => searchForPlayer(1)}>Search</button>
        </div>
        <div className='searchBar'>
          <p className='info'>player 2 name</p>
          <input type="text" onChange={e => setSearchText2(e.target.value)}></input>
          <button onClick={() => searchForPlayer(2)}>Search</button>
        </div>
      </div>

      <div className='MiddleBox'>
      {/* Display Player 1's Info and Icon */}
      <div className='PlayerInfo Left'>
      {JSON.stringify(playerInfo1) !== '{}' ? 
      <>
        <p className='in'>{playerInfo1.name}</p>
        <p className='in'>Level {playerInfo1.summonerLevel}</p>
        <img width="100" 
        height="100" 
        className='img'
        src={"http://ddragon.leagueoflegends.com/cdn/13.15.1/img/profileicon/" + playerIcon1 + ".png"} 
        alt="Player 1 Summoner Icon"></img>
      </> 
      : 
      <> <p></p></>}
      </div>

      {/* Display Player 2's Info and Icon */}
      <div className='PlayerInfo Right'>
      {JSON.stringify(playerInfo2) !== '{}' ?
      <>
        <p className='in'>{playerInfo2.name}</p>
        <p className='in'>Level {playerInfo2.summonerLevel}</p>
        <img 
        width="100" 
        height="100"
        className='img'
        src={"http://ddragon.leagueoflegends.com/cdn/13.15.1/img/profileicon/" + playerIcon2 + ".png"}
        alt = "Player 2 Summoner Icon"></img>
      </>
      :
      <><p></p></>}
      </div>
      </div>
      </div>
      {/* Gettings the Wins */}
      <div className='Bottom'>
      {playerInfo1.name && playerInfo2.name && (
        <button onClick={async () => await analyzeMatches()}>
          Calculate
        </button>
      )}
      {isLoading && <p>Loading...</p>}
      {wins !== null && isCalculationDone && !isLoading && (
        <div className='winMessage'>
          {wins >= 100 ? (
          <p>Wow! Amazing synergy! You've won {wins} the matches played together.</p>
          ) : wins >= 75 ? (
          <p>Great synergy! You've won {wins} out of {sameMatches.length} matches played together.</p>
          ) : wins >= 50 ? (
          <p>Good synergy! You've won {wins} out of {sameMatches.length} matches played together.</p>
          ) : wins >= 25 ? (
          <p>Pretty good synergy! You've won {wins} out of {sameMatches.length} matches played together.</p>
          ) : wins > 0 ? (
          <p>Some synergy! You've won {wins} out of {sameMatches.length} matches played together.</p>
          ) : (
          <p>No synergy yet! Keep playing to improve your teamwork.</p>
          )}
        </div>
      )}
      </div>

    </div>
  );
}

export default App;

