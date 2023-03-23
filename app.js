const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertingCase = (playerObj) => {
  return {
    playerId: playerObj.player_id,
    playerName: playerObj.player_name,
    jerseyNumber: playerObj.jersey_number,
    role: playerObj.role,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray.map((eachPlayer) => convertingCase(eachPlayer)));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayersQuery = `
    INSERT INTO 
       cricket_team(player_name,jersey_number,role)
    VALUES (
       '${playerName}',
        ${jerseyNumber},
        ${role}
    );`;
  await db.run(addPlayersQuery);

  response.send("Player Added to Team");
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerIdQuery = `
    SELECT 
       * 
    FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId}`;
  const player = await db.get(getPlayerIdQuery);
  response.send({
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  });
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatedPlayersQuery = `
    UPDATE 
      cricket_team
    SET 
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = ${role}
    WHERE 
      player_id = ${playerId};`;
  await db.run(updatedPlayersQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
       cricket_team
    WHERE 
       player_id = ${playerId};
       `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
