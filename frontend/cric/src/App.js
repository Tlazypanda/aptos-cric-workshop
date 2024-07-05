import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardMedia, Typography, Alert, AlertTitle, LinearProgress, Paper } from '@mui/material';

// PlayerCard Component
const PlayerCard = ({ player, onAdd, onRemove, isSelected, disabled }) => {
  return (
    <Card sx={{ width: 240, m: 1 }}>
      <CardHeader title={player.name} />
      <CardMedia
        component="img"
        height="140"
        image={require(`./assets/${player.jerseyNumber}.png`)}
        alt={player.name}
      />
      <CardContent>
        <Typography variant="body2">Rank: {player.rank}</Typography>
        <Typography variant="body2">Jersey: {player.jerseyNumber}</Typography>
        <Typography variant="body2">Batting: {player.battingStyle}</Typography>
        <Typography variant="body2">Bowling: {player.bowlingStyle}</Typography>
        <Typography variant="body2">Role: {player.role}</Typography>
        {isSelected ? (
          <Button onClick={() => onRemove(player.id)} variant="contained" fullWidth sx={{ mt: 2 }} disabled={disabled}>Remove</Button>
        ) : (
          <Button onClick={() => onAdd(player)} variant="contained" fullWidth sx={{ mt: 2 }} disabled={disabled}>Add to Team</Button>
        )}
      </CardContent>
    </Card>
  );
};

// PlayerSelection Component
const PlayerSelection = ({ addTeamMember, removeTeamMember, teamMembers, players }) => {
  const roleCount = {
    Batsman: teamMembers.filter(p => p.role === 'Batsman').length,
    Bowler: teamMembers.filter(p => p.role === 'Bowler').length,
    'All-rounder': teamMembers.filter(p => p.role === 'All-rounder').length,
    Wicket: teamMembers.filter(p => p.role === 'Wicket-keeper').length,
  };

  const isRoleQuotaExceeded = (role) => {
    switch (role) {
      case 'Batsman': return roleCount.Batsman >= 5;
      case 'Bowler': return roleCount.Bowler >= 5;
      case 'All-rounder': return roleCount['All-rounder'] >= 3;
      case 'Wicket-keeper': return roleCount.Wicket >= 1;
      default: return false;
    }
  };

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 2 }}>Available Players</Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {players.map(player => (
          <PlayerCard 
            key={player.id}
            player={player}
            onAdd={addTeamMember}
            onRemove={removeTeamMember}
            isSelected={teamMembers.some(member => member.id === player.id)}
            disabled={teamMembers.length >= 11 || isRoleQuotaExceeded(player.role)}
          />
        ))}
      </div>
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Your Team ({teamMembers.length}/11)</Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {teamMembers.map(player => (
          <PlayerCard 
            key={player.id}
            player={player}
            onRemove={removeTeamMember}
            isSelected={true}
          />
        ))}
      </div>
    </div>
  );
};

// MatchSimulation Component
const MatchSimulation = ({ team, opponent }) => {
  const [score, setScore] = useState({ team: 0, opponent: 0 });
  const [wickets, setWickets] = useState({ team: 0, opponent: 0 });
  const [overs, setOvers] = useState(0);
  const [winner, setWinner] = useState(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (overs < 20) {
        setScore(prevScore => ({
          team: prevScore.team + Math.floor(Math.random() * 15),
          opponent: prevScore.opponent + Math.floor(Math.random() * 15)
        }));
        setWickets(prevWickets => ({
          team: Math.min(prevWickets.team + (Math.random() > 0.8 ? 1 : 0), 10),
          opponent: Math.min(prevWickets.opponent + (Math.random() > 0.8 ? 1 : 0), 10)
        }));
        setOvers(prevOvers => prevOvers + 1);
      } else {
        clearInterval(interval);
        setWinner(score.team > score.opponent ? team : opponent);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [overs, score, team, opponent]);

  return (
    <div style={{ marginTop: 16 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Match Progress</Typography>
      <Typography>Overs: {overs}/20</Typography>
      <Typography>{team}: {score.team}/{wickets.team}</Typography>
      <Typography>{opponent}: {score.opponent}/{wickets.opponent}</Typography>
      <LinearProgress variant="determinate" value={(overs / 20) * 100} sx={{ mt: 2 }} />
      {winner && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>Match Ended</AlertTitle>
          {winner} wins the match!
        </Alert>
      )}
    </div>
  );
};

// Main App Component
const FantasyCricketApp = () => {
  const [players, setPlayers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isTeamDone, setIsTeamDone] = useState(false);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [selectedBetTeam, setSelectedBetTeam] = useState(null);

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const dummyPlayers = [
      { id: 1, name: "Virat Kohli", rank: 1, jerseyNumber: 18, battingStyle: "Right-handed", bowlingStyle: "Right-arm medium", role: "Batsman" },
      { id: 2, name: "Rohit Sharma", rank: 2, jerseyNumber: 45, battingStyle: "Right-handed", bowlingStyle: "Right-arm off break", role: "Batsman" },
      { id: 3, name: "Jasprit Bumrah", rank: 3, jerseyNumber: 93, battingStyle: "Right-handed", bowlingStyle: "Right-arm fast", role: "Bowler" },
      { id: 4, name: "KL Rahul", rank: 4, jerseyNumber: 1, battingStyle: "Right-handed", bowlingStyle: "Right-arm medium", role: "Wicket-keeper" },
      { id: 5, name: "Hardik Pandya", rank: 5, jerseyNumber: 33, battingStyle: "Right-handed", bowlingStyle: "Right-arm fast-medium", role: "All-rounder" },
      { id: 6, name: "Ravindra Jadeja", rank: 6, jerseyNumber: 8, battingStyle: "Left-handed", bowlingStyle: "Left-arm orthodox", role: "All-rounder" },
      { id: 7, name: "Rishabh Pant", rank: 7, jerseyNumber: 17, battingStyle: "Left-handed", bowlingStyle: "Right-arm medium", role: "Wicket-keeper" },
      { id: 8, name: "Mohammed Shami", rank: 8, jerseyNumber: 11, battingStyle: "Right-handed", bowlingStyle: "Right-arm fast", role: "Bowler" },
      //{ id: 9, name: "Shikhar Dhawan", rank: 9, jerseyNumber: 42, battingStyle: "Left-handed", bowlingStyle: "Right-arm off-break", role: "Batsman" },
      //{ id: 10, name: "Yuzvendra Chahal", rank: 10, jerseyNumber: 3, battingStyle: "Right-handed", bowlingStyle: "Right-arm leg-break", role: "Bowler" },
      //{ id: 11, name: "Bhuvneshwar Kumar", rank: 11, jerseyNumber: 15, battingStyle: "Right-handed", bowlingStyle: "Right-arm medium-fast", role: "Bowler" },
      { id: 12, name: "Suryakumar Yadav", rank: 12, jerseyNumber: 63, battingStyle: "Right-handed", bowlingStyle: "Right-arm medium", role: "Batsman" },
      { id: 13, name: "Axar Patel", rank: 13, jerseyNumber: 20, battingStyle: "Left-handed", bowlingStyle: "Left-arm orthodox", role: "All-rounder" },
      //{ id: 14, name: "Ishan Kishan", rank: 14, jerseyNumber: 32, battingStyle: "Left-handed", bowlingStyle: "Right-arm medium", role: "Wicket-keeper" },
      { id: 15, name: "Shardul Thakur", rank: 15, jerseyNumber: 54, battingStyle: "Right-handed", bowlingStyle: "Right-arm medium-fast", role: "All-rounder" },
    ];
    setPlayers(dummyPlayers);
  }, []);

  const addTeamMember = (player) => {
    if (teamMembers.length < 11) {
      setTeamMembers([...teamMembers, player]);
    } else {
      alert("You can't have more than 11 players in your team!");
    }
  };

  const removeTeamMember = (playerId) => {
    setTeamMembers(teamMembers.filter(player => player.id !== playerId));
  };

  const markTeamAsDone = () => {
    if (teamMembers.length === 11) {
      setIsTeamDone(true);
    } else {
      alert("Your team must have exactly 11 players!");
    }
  };

  const startMatch = () => {
    setIsMatchStarted(true);
  };

  const placeBet = (team) => {
    setSelectedBetTeam(team);
  };

  return (
    <Paper sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Banner */}
      <div style={{ width: 'auto', height: '700px', backgroundSize: 'cover', background: 'no-repeat', backgroundPosition: 'center', backgroundImage: "url(" + require('./win.jpg') + ")"} } />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
        <Typography variant="h3" sx={{ mb: 1 }}>Aptos Cricket: Bleed Blue</Typography>
        <Typography variant="h4" sx={{ mb: 4 }}>Fantasy Cricket App</Typography>

        {!isTeamDone ? (
          <div>
            <Typography variant="h5" sx={{ mb: 2 }}>Create Your Team</Typography>
            <PlayerSelection 
              addTeamMember={addTeamMember}
              removeTeamMember={removeTeamMember}
              teamMembers={teamMembers}
              players={players}
            />
            <Button variant="contained" onClick={markTeamAsDone} sx={{ mt: 2 }}>Mark Team as Done</Button>
          </div>
        ) : !isMatchStarted ? (
          <Button variant="contained" onClick={startMatch}>Start Match</Button>
        ) : !selectedBetTeam ? (
          <div>
            <Typography variant="h5" sx={{ mb: 2 }}>Place Your Bet</Typography>
            <Button variant="contained" onClick={() => placeBet('India')} sx={{ mr: 2 }}>Bet on India</Button>
            <Button variant="contained" onClick={() => placeBet('Opponent')}>Bet on Opponent</Button>
          </div>
        ) : (
          <div>
            <Typography variant="h5" sx={{ mb: 2 }}>Match in Progress</Typography>
            <Typography>You bet on: {selectedBetTeam}</Typography>
            <MatchSimulation team="India" opponent="Opponent" />
          </div>
        )}
      </div>
    </Paper>
  );
};

export default FantasyCricketApp;