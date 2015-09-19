Meteor.publish("creditAccounts", function () {
  return CreditAccounts.find({ owner: this.userId })
});

Meteor.publish("games", function () {
  return Games.find({});
});

var createNewGame = function () {
  Games.insert({
    dice1: {},
    dice2: {},
    dice3: {},
    dice4: {},
    dice5: {},
    dice6: {},
    players: {},
    result: {},
    live: true,
    open: true,
    log: [],
    createdAt: new Date(),
    minPlayer: false,
    waitingTime: 5,
    gameTime: 10
  });
};

var getDiceTotalBet = function (gameId,dice) {
  var diceBets = Games.findOne({_id: gameId})[dice];
  var sum = 0;
  for ( var key in diceBets ) {
    if ( diceBets.hasOwnProperty(key) ) {
      sum += diceBets[key];
    }
  }
  return sum;
}

var checkGameAndDistributeStake = function (gameId) {
  console.log("finished Game: " + gameId);
  if (Games.findOne({_id: gameId})["result"]["winningDice"].length != 1) {
    var set = {result: {haveWinner: false}}
    Games.update({
      _id: gameId
    },{
      $set: set,
      $push: {log: {betTime: new Date(), message: "Draw game, all bets return to player accounts."}}
    })
    var playerBalances = Games.findOne({_id: gameId}).players
    var playerIds = [];
    for ( var key in playerBalances ) {
      playerIds.push(key);
    }
    for (var i = 0; i < playerIds.length; i++) {
      var betSum = 0;
      var playerBalance = playerBalances[playerIds[i]];
      for (var j = 1; j <= 6; j++) {
        var bet = Games.findOne({_id: gameId})["dice"+j][playerIds[i]] || 0;
        betSum += bet;
      }
      var total = playerBalance + betSum;
      CreditAccounts.update({
        owner: playerIds[i]
      },{
        $inc: { credit: total }
      })
    }
  } else {
    var gameObject = Games.findOne({_id: gameId});
    var winningDice = gameObject["result"]["winningDice"][0];
    var totalStake = 0;
    var totalWinnings = 0;
    var winningSplit = {};
    var logMessage = ""
    for (var i = 1; i <= 6; i++) {
      totalStake += getDiceTotalBet(gameId,"dice"+i);
    }
    var totalStakeLessRake = totalStake * 0.99;
    var winningPlayers = gameObject[winningDice];
    var winningDiceTotalStake = getDiceTotalBet(gameId,winningDice);
    for (var key in winningPlayers ) {
      var winningPercentage = winningPlayers[key] / winningDiceTotalStake;
      var winnings = +(totalStakeLessRake * winningPercentage).toFixed(2);
      totalWinnings += winnings;
      winningSplit[key] = winnings;
      CreditAccounts.update({
        owner: key
      },{
        $inc: { credit: winnings }
      });
      logMessage += key + " won " + winnings + " winnings.\n"
      console.log(winnings);
    }

    var set = {result: {haveWinner: true}}
    set['result']["winningSplit"] = winningSplit;

    Games.update({
      _id: gameId
    },{
      $set: set,
      $push: {log: {betTime: new Date(), message: logMessage}}
    })

    var playerGameBalancesLeft = gameObject["players"]
    for (var key in playerGameBalancesLeft ) {
      var balanceLeft = playerGameBalancesLeft[key] || 0;
      CreditAccounts.update({
        owner: key
      },{
        $inc: { credit: balanceLeft }
      });
    }
    var rake = +(totalStake - totalWinnings).toFixed(2);
    console.log("totalStake: " + totalStake + " totalWinnings: " + totalWinnings);
    console.log("rake: " + rake);
    CreditAccounts.update({
      username: "vmxlabs"
    },{
      $inc: { credit: rake }
    });
  }
};

Meteor.startup(function () {
  if (!Games.findOne({live: true, open: true})) {
    createNewGame();   
  }
  var oneSecondTimer = Meteor.setInterval(function(){
    var waitingGames = Games.find({open: true, minPlayer: true, waitingTime: {$gte: 0}}).fetch()
    for (var i = 0; i < waitingGames.length; i++) {
      if (waitingGames[i]["waitingTime"] === 0) {
        Games.update({
          _id: waitingGames[i]._id
        },{
          $set: { open: false }
        });
        createNewGame();
      } else {
        Games.update({
          _id: waitingGames[i]._id
        },{
          $inc: { waitingTime: -1 }
        });
      }
    }
    var playingGames = Games.find({live: true, open: false, gameTime: {$gte: 0}}).fetch()
    for (var i = 0; i < playingGames.length; i++) {
      if (playingGames[i]["gameTime"] === 0) {
        checkGameAndDistributeStake(playingGames[i]._id);
        Games.update({
          _id: playingGames[i]._id
        },{
          $set: { live: false }
        });
      } else {
        Games.update({
          _id: playingGames[i]._id
        },{
          $inc: { gameTime: -1 }
        });
      }
    }
  }, 1000)
});

Accounts.onCreateUser(function(options, user) {
  console.log(user);
  CreditAccounts.insert({
    owner: user._id,
    username: user.username,
    createdAt: new Date(),
    inGame: [],
    credit: 1000
  });
  return user;
});