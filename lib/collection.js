CreditAccounts = new Mongo.Collection("creditAccounts")
Games = new Mongo.Collection("games")

Meteor.methods({
  addPlayerBet: function (gameId,dice,bet) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var userId = Meteor.userId();

    if (!(userId in Games.findOne({_id: gameId}).players)){
      var totalBalance = CreditAccounts.findOne({owner: userId}).credit;
      console.log("totalBalance" + totalBalance);
      var gameBalance = Math.min(100, totalBalance);
      console.log("gameBalance" + gameBalance);

      CreditAccounts.update({
        owner: userId
      },{
        $inc: { credit: - gameBalance },
        $push: {inGame: gameId}
      });
      console.log("addPlayerBetCalled " + " " +gameId + " " +dice + " " + bet + " " + userId);
      
      var game = Games.findOne({_id: gameId})
      game['players'][userId] = gameBalance - bet;
      game[dice][userId] = bet;
      
      var set = {players: game['players']}
      set[dice] = game[dice]
      
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

    var players = Games.findOne({_id: gameId}).players;
    console.log("length"+Object.keys(players).length);
    if (Object.keys(players).length >= 2){
      Games.update({
        _id: gameId
      },{
        $set: {minPlayer: true}
      });
    }
  },

  withdrawGame: function (gameId,userId,betSum) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var userId = Meteor.userId();

    if (userId in Games.findOne({_id: gameId}).players){

      var gameBalance = Games.findOne({_id: gameId}).players[userId];

      var total = gameBalance + betSum;

      CreditAccounts.update({
        owner: userId
      },{
        $inc: { credit: total },
        $pop: { inGame: 1 }
      });

      var game = Games.findOne({_id: gameId})

      for (var i = 1; i <= 6; i++) {
        if(userId in game["dice"+i]) {
          delete game["dice"+i][userId];
          var set = {};
          set["dice"+i] = game["dice"+i];
          Games.update({
            _id: gameId
          },{
            $set: set
          });
        }
      };

      delete game["players"][userId]

      Games.update({
        _id: gameId
      },{
        $set: {players: game["players"]},
        $push: {log: {username: Meteor.user().username, userId: userId, betAmount: -betSum, betTime: new Date(), message: "Player withdraws game."}}
      });

    }
  },

  removeInGameId: function () {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    CreditAccounts.update({
      owner: Meteor.userId()
    },{
      $pop: { inGame: 1 }
    });
  },

  writeGameResult: function (gameId,threeArray) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var set = {result: {winningDice: threeArray}}
    Games.update({
      _id: gameId
    },{
      $set: set
    });
  }
})