var gameId
var minPlayerRequired = 2;

Meteor.subscribe("creditAccounts");
Meteor.subscribe("games");

var findGame = function () {
  var userId = Meteor.userId();
  var playersUserId = "players." + userId;
  var game = {}
  // if (Games.findOne({live: true, playersUserId: {"$exists": true}})) {
  if (CreditAccounts.findOne({owner: Meteor.userId()}).inGame.length > 0) {
    // game = Games.findOne({live: true, playersUserId: {"$exists": true}});
    gameId = CreditAccounts.findOne({owner: userId}).inGame[0];
    // gameId = game._id;
    console.log("already in game: " + gameId);
  } else {
    game = Games.findOne({live: true, open: true});
    console.log("found open live game: " + game._id);
    console.log(game);
    gameId = game._id;
  } 
}

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

var getPlayerBetOnDice = function (gameId,dice) {
  var userId = Meteor.userId();
    return Games.findOne({_id: gameId})[dice][userId] || 0;
}

var getParticipantNumber =  function (gameId) {
  if (! Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
  var players = Games.findOne({_id: gameId}).players;
  return Object.keys(players).length;
}

var getNumber3 = function (gameId) {
  if (! Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
  var array = [];
  for (var i = 1; i <= 6; i++) {
    array.push(getDiceTotalBet(gameId, "dice"+ i));
  }

  var sorted =  array.slice().sort(function(a,b){return b-a})
  console.log(array);
  console.log(sorted);

  var ranks = $.grep(sorted, function(item, idx) {
    return item != sorted[idx - 1];
  })
  console.log(ranks);

  var finalranks = array.slice().map(function(v){ return ranks.indexOf(v)+1 });

  console.log(finalranks);

  var results = [];
  for (var j = 0; j <= 5 ; j++){
    if (finalranks[j] == 3){
      results.push("dice"+(j+1));
    }
  }
  console.log(results);
  return results;
}

var getPnL = function (gameId, userId) {
  if (! Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
  if (getNumber3(gameId).length != 1) {
    return "draw game";
  } else {
    var betSum = 0;
    for (var i = 1; i <= 6; i++) {
      betSum += getPlayerBetOnDice(gameId,"dice"+i);
    }
    console.log("betSum: " + betSum);
    var winningDice = getNumber3(gameId)[0];
    var totalStake = 0;
    var winnings
    var gameBalance = Games.findOne({_id: gameId})["players"][userId] || 0
    var initGameBalance = gameBalance + betSum;
    console.log("initGameBalance: " + initGameBalance);
    var winningPercentage = getPlayerBetOnDice(gameId,winningDice) / getDiceTotalBet(gameId,winningDice);
    console.log("winningPercentage: " + winningPercentage);
    for (var i = 1; i <= 6; i++) {
      totalStake +=  getDiceTotalBet(gameId,"dice"+i);
    };
    totalStake = totalStake * 0.99;
    console.log("totalStake: " + totalStake);

    winnings = +(totalStake * winningPercentage).toFixed(2);

    console.log("winnings: " + winnings);
    return +((winnings + gameBalance) - initGameBalance).toFixed(2);
  }
}

Template.Game.helpers({
  findGame: function () {
    findGame();
  },
  gameStarts: function () {
    if ((Games.findOne({_id: gameId}).live) && (!Games.findOne({_id: gameId}).open) && (Games.findOne({_id: gameId}).gameTime > 0)) {
      return true;
    } else {
      return false;
    }
  },
  notJoinedGame: function () {
    return !(Meteor.userId() in Games.findOne({_id: gameId}).players);
  },
  joinedGame: function () {
    return (Meteor.userId() in Games.findOne({_id: gameId}).players);
  },
  gameBalance: function () {
    if (! Meteor.userId()) {
      return "Please log in first";
    }
    var userId = Meteor.userId();
    return Games.findOne({_id: gameId})["players"][userId] || 0
  },
  balance: function () {
    if (! Meteor.userId()) {
      return "Please log in first";
    }
    return CreditAccounts.find({ owner: Meteor.userId()}).fetch()[0].credit; 
  },
  participantNumber: function () {
    if (! Meteor.userId()) {
      return "Please log in first";
    }
    var participantNumber = getParticipantNumber(gameId);
    return  participantNumber;
  },
  status: function () {
    if (! Meteor.userId()) {
      return "Please log in first";
    }
    var participantNumber = getParticipantNumber(gameId);
    var waitingTimeRemaining = (Games.findOne({_id: gameId}).waitingTime);
    var gameTime = (Games.findOne({_id: gameId}).gameTime);
    if (participantNumber < 2) {
      return "Need Minimum 2 players to start game";
    } else if (participantNumber >= 2 && waitingTimeRemaining > 0 ){
      return "Game Start in "+ waitingTimeRemaining + " seconds";
    } else if (participantNumber >= 2 && gameTime > 0 ){
      return "Remaining Time "+ gameTime + " seconds";
    } else {
      return "Game finished, play a new game!"
    }
  },
  joinedGameAndNotReachMinPlayer: function () {
    var joined = Meteor.userId() in Games.findOne({_id: gameId}).players;
    var participantNumber = getParticipantNumber(gameId);
    if (joined && participantNumber < 2) {
      return true;
    } else {
      return false
    };
  },

  number3: function () {
    if (! Meteor.userId()) {
      return "Please log in first";
    }
    var number3 = getNumber3(gameId);
    return number3;
  },

  PnL: function () {
    if (! Meteor.userId()) {
      return "Please log in first";
    }
    var PnL = getPnL(gameId, Meteor.userId());
    return PnL;
  },

  gameFinished: function () {
    if (!Games.findOne({_id: gameId}).live) {
      return true;
    } else {
      return false;
    }
  },

  writeResult: function () {
    var number3 = getNumber3(gameId);
    Meteor.call("writeGameResult", gameId, number3);
  },

  dice1Stake: function () {
    var playerBet = getPlayerBetOnDice(gameId,"dice1");
    var totalBet = getDiceTotalBet(gameId,"dice1");
    return  playerBet + "/" + totalBet;
  },
  dice2Stake: function () {
    var playerBet = getPlayerBetOnDice(gameId,"dice2");
    var totalBet = getDiceTotalBet(gameId,"dice2");
    return  playerBet + "/" + totalBet;
  },
  dice3Stake: function () {
    var playerBet = getPlayerBetOnDice(gameId,"dice3");
    var totalBet = getDiceTotalBet(gameId,"dice3");
    return  playerBet + "/" + totalBet;
  },
  dice4Stake: function () {
    var playerBet = getPlayerBetOnDice(gameId,"dice4");
    var totalBet = getDiceTotalBet(gameId,"dice4");
    return  playerBet + "/" + totalBet;
  },
  dice5Stake: function () {
    var playerBet = getPlayerBetOnDice(gameId,"dice5");
    var totalBet = getDiceTotalBet(gameId,"dice5");
    return  playerBet + "/" + totalBet;
  },
  dice6Stake: function () {
    var playerBet = getPlayerBetOnDice(gameId,"dice6");
    var totalBet = getDiceTotalBet(gameId,"dice6");
    return  playerBet + "/" + totalBet;
  },
});

Template.Game.events({
  'click #dice1 .button1': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice1",1);  
    }
  },
  'click #dice1 .button5': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice1",5);
    }
  },
  'click #dice1 .button10': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice1",10);
    }
  },
  'click #dice2 .button1': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice2",1);
    }
  },
  'click #dice2 .button5': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice2",5);
    }
  },
  'click #dice2 .button10': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice2",10);
    }
  },
  'click #dice3 .button1': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice3",1);
    }
  },
  'click #dice3 .button5': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice3",5);
    }
  },
  'click #dice3 .button10': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice3",10);
    }
  },
  'click #dice4 .button1': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice4",1);
    }
  },
  'click #dice4 .button5': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice4",5);
    }
  },
  'click #dice4 .button10': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice4",10);
    }
  },
  'click #dice5 .button1': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice5",1);
    }
  },
  'click #dice5 .button5': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice5",5);
    }
  },
  'click #dice5 .button10': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice5",10);
    }
  },
  'click #dice6 .button1': function () {
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice6",1);
    }
  },
  'click #withdraw': function () {
    var betSum = 0;
    for (var i = 1; i <= 6; i++) {
      betSum += getPlayerBetOnDice(gameId,"dice"+i);
    }
    console.log("remove player "+betSum);
    Meteor.call("withdrawGame",gameId,Meteor.userId(),betSum);
  },
  'click #newGame': function () {
    Meteor.call("removeInGameId")
    location.reload();
  }
});