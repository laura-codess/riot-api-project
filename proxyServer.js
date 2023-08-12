var express = require('express');
var cors = require('cors');
const axios = require('axios');
const { get } = require('http');
const bodyParser = require('body-parser');

var jsonParser = bodyParser.json();
var app = express();

app.use(cors({ origin: '*' }));

const api_key = "RGAPI-c40d247d-9ef0-4829-a5e8-b87338c59f6a"

function getPlayerPUUID(playerName) {
    return axios.get("https://na1.api.riotgames.com" + "/lol/summoner/v4/summoners/by-name/" + playerName + "?api_key=" + api_key)
        .then(response => {
            console.log(response.data);
            return response.data.puuid
        }).catch(err => err);
}

function getMatchArray(PUUID) {
    return axios.get("https://americas.api.riotgames.com" + "/lol/match/v5/matches/by-puuid/" + PUUID + "/ids?start=0&count=100" + "&api_key=" + api_key)
        .then(response => {
            console.log(response.data);
            return response.data
        }).catch(err => err);
}

// get the username, profile id, and level
app.get("/playerInfo", async (req, res) => {
    const playerName = req.query.playerName;
    const api_call = "https://na1.api.riotgames.com" + "/lol/summoner/v4/summoners/by-name/" + playerName + "?api_key=" + api_key;
    const allPlayerInfo = await axios.get(api_call)
        .then(response => response.data)
        .catch(err => err)
    
    console.log(allPlayerInfo);

    res.json(allPlayerInfo);

})

// get profile icon number
app.get("/playerIcon", async (req, res) => {
    const playerName = req.query.playerName;
    const api_call = "https://na1.api.riotgames.com" + "/lol/summoner/v4/summoners/by-name/" + playerName + "?api_key=" + api_key;
    try {
        const response = await axios.get(api_call);
        const playerInfo = response.data; // Correct property name
        const playerIcon = playerInfo['profileIconId']
        
        console.log(playerIcon);
        res.json(playerIcon);
    } catch (error) {
        console.error("Error fetching player icon:", error);
        res.status(error.response.status || 500).json({
            error: "Error fetching player icon"
        });
    }
});

// get match data
app.get("/getMatches", async (req, res) => {
    const playerName = req.query.playerName;

    const PUUID = await getPlayerPUUID(playerName);

    const matchArray = await getMatchArray(PUUID);
  

    console.log("Matches for player 1:" + matchArray);
    
    res.json(matchArray)
});

// this makes it crash
app.post("/analyzeMatches", jsonParser, async (req, res) => {
    const sameMatches = req.body.sameMatches;
    const playerName = req.body.playerName;
    console.log("Received request to analyzeMatches for:", playerName);
    console.log("Received sameMatches:", sameMatches); // Log sameMatches array
    
    console.log("This is the req.body:" + req.body);
    let count = 0;
    try {
        
        for (const match_id of sameMatches) {
            const api_call = "https://americas.api.riotgames.com/lol/match/v5/matches/" + match_id + "?api_key=" + api_key;
            try {
                const response = await axios.get(api_call);
                const matchinfo = response.data;
                const participants = matchinfo.info.participants;

                for (const participant of participants) {
                    if (participant.summonerName === playerName) {
                        const result = participant.win;
                        if (result) {
                            count++;
                        }
                    }
                }
            } catch (error) {
                console.log("An error occurred:", error.message);
            }
        }
        console.log("Sending response: " + count);
        res.json(count);
    } catch (error) {
        console.log("An error occurred:", error.message);
        res.status(500).json({ error: "An error occurred while processing the matches." });
    }
});

app.listen(8000, function() {
    console.log("Server started on port 8000");
});