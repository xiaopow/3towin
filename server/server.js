Meteor.publish("creditAccounts", function () {
  return CreditAccounts.find({ owner: this.userId })
});

Meteor.publish("games", function () {
  return Games.find({});
});

Meteor.startup(function () {
  if (!Games.findOne({live: true, open: true})) {
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
  var oneSecondTimer = Meteor.setInterval(function(){
    var waitingGames = Games.find({open: true, minPlayer: true, waitingTime: {$gt: 0}}).fetch()
    for (var i = 0; i < waitingGames.length; i++) {
      Games.update({
        _id: waitingGames[i]._id
      },{
        $inc: { waitingTime: -1 }
      });
    }
    var playingGames = Games.find({live: true, open: false, gameTime: {$gt: 0}}).fetch()
    for (var i = 0; i < playingGames.length; i++) {
      Games.update({
        _id: playingGames[i]._id
      },{
        $inc: { gameTime: -1 }
      });
    }
  }, 1000)
});

Accounts.onCreateUser(function(options, user) {
  console.log(user);
  CreditAccounts.insert({
    owner: user._id,
    username: user.username,
    createdAt: new Date(),
    credit: 1000
  });
  return user;
});