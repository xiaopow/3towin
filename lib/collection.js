CreditAccounts = new Mongo.Collection("creditAccounts")
Games = new Mongo.Collection("games")

Meteor.methods({
  createNewCreditAccount: function () {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    CreditAccounts.insert({
      owner: Meteor.userId(),
      username: Meteor.user().username,
      createdAt: new Date(),
      credit: 1000
    });
  },

  addPlayerBet: function (gameId,dice,bet) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var userId = Meteor.userId();
    if (!Games.findOne({_id: gameId}).players[userId]){
      console.log("addPlayerBetCalled " + gameId + dice + bet)
      var set = {players: {}};
      set['players'][userId] = 100 - bet;
      set[dice] = {};
      set[dice][userId] = bet;
      console.log("set initial bet");
      Games.update({
        _id: gameId
      },{
        $set: set,
        $push: {log: {username: Meteor.user().username, userId: userId, betAmount: bet, dice: dice, betTime: new Date()}}
      });
    } else {
      var inc = {};
      inc['players.'+userId] = -bet;
      inc[dice+'.'+userId] = bet;
      console.log("increase Bet");
      console.log(inc);
      Games.update({
        _id: gameId
      },{
        $inc: inc,
        $push: {log: {username: Meteor.user().username, userId: userId, betAmount: bet, dice: dice, betTime: new Date()}}
      })
    }
  },

  getDiceTotalBet: function (gameId,dice) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var diceBets = Games.findOne({_id: gameId})[dice];
    var sum = 0;
    for ( var key in diceBets ) {
      if ( diceBets.hasOwnProperty(key) ) {
        sum += diceBets[key];
      }
    }
    return sum;
  },

  getPlayerBetOnDice: function (gameId,dice) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var userId = Meteor.userId();
    if (Games.findOne({_id: gameId, players: userId})) {
      return Games.findOne({_id: gameId}).dice.userId;
    } else {
      return "hello world";
    }
  }

})