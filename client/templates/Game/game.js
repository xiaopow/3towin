var gameId

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
    Meteor.call("addPlayerBet",gameId,"dice1",1);
  },
  'click #dice1 #button5': function () {
    Meteor.call("addPlayerBet",gameId,"dice1",5);
  },
  'click #dice1 #button10': function () {
    Meteor.call("addPlayerBet",gameId,"dice1",10);
  },
  'click #dice2 #button1': function () {
    Meteor.call("addPlayerBet",gameId,"dice2",1);
  },
  'click #dice2 #button5': function () {
    Meteor.call("addPlayerBet",gameId,"dice2",5);
  },
  'click #dice2 #button10': function () {
    Meteor.call("addPlayerBet",gameId,"dice2",10);
  },
  'click #dice3 #button1': function () {
    Meteor.call("addPlayerBet",gameId,"dice3",1);
  },
  'click #dice3 #button5': function () {
    Meteor.call("addPlayerBet",gameId,"dice3",5);
  },
  'click #dice3 #button10': function () {
    Meteor.call("addPlayerBet",gameId,"dice3",10);
  },
  'click #dice4 #button1': function () {
    Meteor.call("addPlayerBet",gameId,"dice4",1);
  },
  'click #dice4 #button5': function () {
    Meteor.call("addPlayerBet",gameId,"dice4",5);
  },
  'click #dice4 #button10': function () {
    Meteor.call("addPlayerBet",gameId,"dice4",10);
  },
  'click #dice5 #button1': function () {
    Meteor.call("addPlayerBet",gameId,"dice5",1);
  },
  'click #dice5 #button5': function () {
    Meteor.call("addPlayerBet",gameId,"dice5",5);
  },
  'click #dice5 #button10': function () {
    Meteor.call("addPlayerBet",gameId,"dice5",10);
  },
  'click #dice6 #button1': function () {
    Meteor.call("addPlayerBet",gameId,"dice6",1);
  },
  'click #dice6 #button5': function () {
    Meteor.call("addPlayerBet",gameId,"dice6",5);
  },
  'click #dice6 #button10': function () {
    Meteor.call("addPlayerBet",gameId,"dice6",10);
  },
});