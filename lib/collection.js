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
      var totalBalance = CreditAccounts.findOne({owner: userId}).credit;
      console.log("totalBalance" + totalBalance);
      var gameBalance = Math.min(100, totalBalance);
      console.log("gameBalance" + gameBalance);

      CreditAccounts.update({
        owner: userId
      },{
        $inc: { credit: - gameBalance }
      });
      console.log("addPlayerBetCalled " + gameId + dice + bet)
      var set = {players: {}};
      set['players'][userId] = gameBalance - bet;
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
  }

})