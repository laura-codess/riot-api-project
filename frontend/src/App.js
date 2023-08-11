import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

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
      setPlayer1MatchData(response1.data);
      console.log("Player 1 matches: " + player1MatchData);
      const response2 = await axios.get("http://localhost:8000/getMatches", {
        params: {
          playerName: playerInfo2.name,
        }
      });
      setPlayer2MatchData(response2.data);
      console.log("Player 2 matches: " + player2MatchData);

    } catch (error) {
      console.log("Error fetching same matches: ", error);
    }
  }
  useEffect(() => {
      // check if both player match data arrays have data
      // if(player1MatchData.length > 0 && player2MatchData.length > 0) {
      //   const sameMatches = [];
      //   for(let i = 0; i < player1MatchData.length; i++) {
      //     for(let j = 0; j < player2MatchData.length; j++) {
      //       if(player1MatchData[i] === player2MatchData[j]) {
      //         sameMatches.push(player1MatchData[i]);
      //       }
      //     }
      //   }
      //   setSameMatches(sameMatches); // update the state with same matches
      //   console.log(sameMatches);
      // }
      
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

  // this makes it crash
  async function analyzeMatches() {
    try {
      await getSameMatches();
      const response = await axios.post("http://localhost:8000/analyzeMatches", {
        sameMatches: sameMatches,
        playerName: playerInfo1.name
      });
      setWins(response.data);
      console.log("The number of wins you guys had together is: " + wins);
    } catch (error) {
      console.log("Error grabbing wins: ", error);
    }
  }
 
  

  // html part of code
  return (
    <div className="App">
      <h2>League Searcher</h2>

      <input type="text" onChange={e => setSearchText1(e.target.value)}></input>
      <button onClick={() => searchForPlayer(1)}>Player 1</button>
      <input type="text" onChange={e => setSearchText2(e.target.value)}></input>
      <button onClick={() => searchForPlayer(2)}>Player 2</button>
      {/* Display Player 1's Info and Icon */}
      {JSON.stringify(playerInfo1) !== '{}' ? 
      <>
        <p>{playerInfo1.name}</p>
        <p>Summoner level {playerInfo1.summonerLevel}</p>
        <img width="100" 
        height="100" 
        src={"http://ddragon.leagueoflegends.com/cdn/13.15.1/img/profileicon/" + playerIcon1 + ".png"} 
        alt="Player 1 Summoner Icon"></img>
      </> 
      : 
      <> <p> No data for Player 1 </p></>}

      {/* Displayer Player 2's Info and Icon */}
      {JSON.stringify(playerInfo2) !== '{}' ?
      <>
        <p>{playerInfo2.name}</p>
        <p>Summoner level {playerInfo2.summonerLevel}</p>
        <img 
        width="100" 
        height="100" 
        src={"http://ddragon.leagueoflegends.com/cdn/13.15.1/img/profileicon/" + playerIcon2 + ".png"}
        alt = "Player 2 Summoner Icon"></img>
      </>
      :
      <><p>No Data for Player 2</p></>}

      {/* Button to fetch the same matches*/}
      {playerInfo1.name && playerInfo2.name && (
        <div>
        <button onClick={getSameMatches}>Get Same Matches</button>
        </div>
      )} 
      
      <button onClick={async () => await analyzeMatches()}>Wins?</button>

    </div>
  );
}

export default App;

