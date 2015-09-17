var gameId
var userId = Meteor.userId();

Meteor.subscribe("creditAccounts");

Meteor.subscribe("games", function() {
  var game = {}
    if (Games.findOne({live: true, players: "abc123"})) {
      game = Games.findOne({live: true, players: "abc123"});
      console.log("find participating game:\n" + game._id);
      gameId = game._id;
    } else {
      game = Games.findOne({live: true, open: true});
      console.log("find new game: \n" + game._id);
      gameId = game._id;
    }
});

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

var costPaid = function (gameId, userId) {
  var sum = 0;
  for (var i = 1; i <= 6; i++) {
    sum += getPlayerBetOnDice(gameId,"dice"+i);
  }
  return PnL = - (sum * 1.01);
}

var getPnL = function (gameId, userId) {
  if (! Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }

  if (getNumber3(gameId).length != 1) {
    var sum = 0;
    for (var i = 1; i <= 6; i++) {
      sum += getPlayerBetOnDice(gameId,"dice"+i);
    }
    return PnL = costPaid(gameId, userId) + sum;
  } else {
    //----------------cost-------------------
    var cost = costPaid(gameId, userId);
    //--------------winning pot--------------
    var winningDice = getNumber3(gameId)[0];
    console.log(winningDice);
    var winningpot = function(gameId, winningDice){
      var sum = 0;
      for (var i = 1; i <= 6; i++) {
        if(i != winningDice.substr(winningDice.length - 1)){
          sum += getDiceTotalBet(gameId,"dice"+i);
        }
      }
      console.log(sum);
      return sum;
    } 
    //------------Winning percentage---------
    var winningPercentage = function(gameId, winningDice){
      var playerBet = getPlayerBetOnDice(gameId,winningDice);
      var totalBet = getDiceTotalBet(gameId,winningDice);
      return playerBet/totalBet;
    }

    //------------Bet on Winning-------------
    var betOnWinning = function(gameId, winningDice){
      var playerBet = getPlayerBetOnDice(gameId,winningDice);
      return playerBet;
    }
    //------------Revenue--------------------
    var revenue = winningpot(gameId, winningDice) * winningPercentage(gameId, winningDice) + betOnWinning(gameId, winningDice);

    console.log(cost);
    console.log(revenue);
    return PnL = cost + revenue;
  }
}

Template.Game.helpers({
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
    var PnL = getPnL(gameId, userId);
    return PnL;
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
  'click #dice1 #button1': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice1",1);  
    }
  },
  'click #dice1 #button5': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice1",5);
    }
  },
  'click #dice1 #button10': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice1",10);
    }
  },
  'click #dice2 #button1': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice2",1);
    }
  },
  'click #dice2 #button5': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice2",5);
    }
  },
  'click #dice2 #button10': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice2",10);
    }
  },
  'click #dice3 #button1': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice3",1);
    }
  },
  'click #dice3 #button5': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice3",5);
    }
  },
  'click #dice3 #button10': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice3",10);
    }
  },
  'click #dice4 #button1': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice4",1);
    }
  },
  'click #dice4 #button5': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice4",5);
    }
  },
  'click #dice4 #button10': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice4",10);
    }
  },
  'click #dice5 #button1': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice5",1);
    }
  },
  'click #dice5 #button5': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice5",5);
    }
  },
  'click #dice5 #button10': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice5",10);
    }
  },
  'click #dice6 #button1': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 1) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice6",1);
    }
  },
  'click #dice6 #button5': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 5) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice6",5);
    }
  },
  'click #dice6 #button10': function () {
    if (Games.findOne({_id: gameId}).players[userId] < 10) {
      window.alert("Not enough credit");
    } else {
      Meteor.call("addPlayerBet",gameId,"dice6",10);
    }
  },
});