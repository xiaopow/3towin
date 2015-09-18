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
      gameTime: 0
    });
  }
});

Accounts.onCreateUser(function(options, user) {
  console.log(user);
  CreditAccounts.insert({
    owner: user._id,
    username: user.username,
    createdAt: new Date(),
    credit: 1000
  });
  // such that if no game create a game, doesn't need to restart Meteor server
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
      gameTime: 0
    });
  }
  return user;
});