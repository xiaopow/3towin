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
    waitingTime: 60,
    gameTime: 180
  });
}

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