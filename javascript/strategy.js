var me;

/*
game:
{
  "maxForfeitsInARow": 10,
  "maxDynamiteCount": 50,
  "id": "5B9E3176-4398-4849-98D3-4FA3772E36E6",
  "maxTurnCount": 500,
  "turn": 6,
  "pot": 1,
  "playerEntries": [
    {
      "player": {
        "id": "8D0CF861-40C5-48B8-B98A-DA51539267CD",
        "name": "Player 1"
      },
      "state": {
        "forfeitsInARow": 0,
        "score": 6,
        "disqualified": false,
        "remainingDynamiteCount": 50,
        "playTime": 0.0005140304565429688
      }
    },
    {
      "player": {
        "id": "5002C640-77E0-42A1-B91A-B18DC84DACF0",
        "name": "Player 2"
      },
      "state": {
        "forfeitsInARow": 0,
        "score": 0,
        "disqualified": false,
        "remainingDynamiteCount": 50,
        "playTime": 1.1708720922470093
      }
    }
  ],
  "maxPlayerTime": 60
}

result:
{
  "outcome": {
    "outcome": "win",
    "player": {
      "id": "8D0CF861-40C5-48B8-B98A-DA51539267CD",
      "name": "Mr T"
    }
  },
  "moveEntries": [
    {
      "player": {
        "id": "261B14DD-4B78-4EC0-9C6C-83F3B6EC8424",
        "name": "Node"
      },
      "move": "dynamite"
    },
    {
      "player": {
        "id": "8D0CF861-40C5-48B8-B98A-DA51539267CD",
        "name": "Mr T"
      },
      "move": "waterBalloon"
    }
  ],
  "timeEntries": [
    {
      "player": {
        "id": "261B14DD-4B78-4EC0-9C6C-83F3B6EC8424",
        "name": "Node"
      },
      "time": 0.009330987930297852
    },
    {
      "player": {
        "id": "8D0CF861-40C5-48B8-B98A-DA51539267CD",
        "name": "Mr T"
      },
      "time": 0.0000890493392944336
    }
  ]
}
*/

let outcome;
let dynamiteCount = 50;
let notDynamiteCount = 50;
let name = "❤️AMOR💘"
let history = []
let round = 0;

module.exports = {
    
    host: "10.0.1.2",
    port: 4040,
    name: name,
    youAre: function(player) {
        console.log(player.result);
        me = player;
    },
    playTurn: function(playerEntries, game) {
      round += 1
      if(round == 500){
        dynamiteCount = 50;
        notDynamiteCount = 50;
        history = []
        round = 0;
        return "rock";
      }
      if(history.length > 10)
        history = history.slice(history.length - 5, history.length);
      if(history.slice(history.length - 5, history.length).filter(h => h === "dynamite").length > 2){
        if(notDynamiteCount)
         return "waterBalloon";
      }
      //Om Draw lägg nästa dynamit
      if(outcome === 'draw' && dynamiteCount > 0){
        dynamiteCount -=1;
        return 'dynamite';
      }
      var moves = ['rock', 'rock','rock','rock','paper','paper', 'scissors']  
        
       if(notDynamiteCount <= 0){
        if(dynamiteCount > 0 && round % 2){
          dynamiteCount -= 1;
          return "dynamite";
        }
       }

        console.log(history)
        
        if( history.slice(history.length - 5, history.length).filter(h => h === "dynamite").length > 2){
          if(notDynamiteCount)
            return 'waterBalloon';
        }
        if(history.slice(history.length - 5, history.length).filter(h => h === "rock").length > 2){
          return "paper";
        }
        else if(history.slice(history.length - 5, history.length).filter(h => h === "paper").length > 2){
          return "scissors";
        }
        else if(history.slice(history.length - 5, history.length).filter(h => h === "scissors").length > 2){
          return "rock";
        }
        
        return moves[Math.floor(Math.random() * moves.length)]
    },
    turnDidEnd: function(result, playerEntries, game) {
        outcome = result.outcome.outcome;
        console.log('result: ' + JSON.stringify(result));
        if(result.moveEntries[0].player.name != name){
          history.push(result.moveEntries[0].move);
          if(result.moveEntries[0].move == "dynamite"){
            notDynamiteCount -= 1;
          }
        }
        else{
          history.push(result.moveEntries[1].move);
          if(result.moveEntries[1].move == "dynamite"){
            notDynamiteCount -= 1;
          }
        }
    }
};
