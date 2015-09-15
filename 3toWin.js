CreditAccounts = new Mongo.Collection("creditAccounts")
Games = new Mongo.Collection("games")

if (Meteor.isClient) {
  Meteor.subscribe("creditAccounts");
  Meteor.subscribe("games")

  Template.body.onRendered(function() {
    var game = {}
    if (Games.findOne({live: true, players: "abc123"})) {
      game = Games.findOne({live: true, players: "abc123"});
      console.log("find participating game:\n" + game);
    } else {
      game = Games.findOne({live: true, open: true});
      console.log("find new game:\n" + game);
    }
  })

  // counter starts at 0
  Session.setDefault('counter1', 0);
  Session.setDefault('counter2', 0);
  Session.setDefault('counter3', 0);
  Session.setDefault('counter4', 0);
  Session.setDefault('counter5', 0);
  Session.setDefault('counter6', 0);
  Session.setDefault('playerBet1', 0);
  Session.setDefault('playerBet2', 0);
  Session.setDefault('playerBet3', 0);
  Session.setDefault('playerBet4', 0);
  Session.setDefault('playerBet5', 0);
  Session.setDefault('playerBet6', 0);
  Session.setDefault('gameBalance',0);

  Template.body.helpers({
    joinGame: function () {
      var game = {}
      if (Games.findOne({live: true, players: "abc123"})) {
        game = Games.findOne({live: true, players: "abc123"});
        console.log("find participating game:\n" + game);
      } else {
        game = Games.findOne({live: true, open: true});
        console.log("find new game:\n" + game);
      }
    },
    gameBalance: function () {
      if (! Meteor.userId()) {
        return "Please log in first";
      }
      return Session.get('gameBalance');
    },
    balance: function () {
      if (! Meteor.userId()) {
        return "Please log in first";
      }
      return CreditAccounts.find({ owner: Meteor.userId()}).fetch()[0].credit; 
    },
    dice1: function () {
      return Session.get('counter1');
    },
    dice2: function () {
      return Session.get('counter2');
    },
    dice3: function () {
      return Session.get('counter3');
    },
    dice4: function () {
      return Session.get('counter4');
    },
    dice5: function () {
      return Session.get('counter5');
    },
    dice6: function () {
      return Session.get('counter6');
    },
    dice1Stake: function () {
      return Session.get('playerBet1') + "/" + Session.get('counter1');
    },
    dice2Stake: function () {
      return Session.get('playerBet2') + "/" + Session.get('counter2');
    },
    dice3Stake: function () {
      return Session.get('playerBet3') + "/" + Session.get('counter3');
    },
    dice4Stake: function () {
      return Session.get('playerBet4') + "/" + Session.get('counter4');
    },
    dice5Stake: function () {
      return Session.get('playerBet5') + "/" + Session.get('counter5');
    },
    dice6Stake: function () {
      return Session.get('playerBet6') + "/" + Session.get('counter6');
    },
  });


  Template.body.events({
    'submit .add-bet-1': function (event) {
      event.preventDefault();
      var addBet1 = parseInt(event.target.bet1.value);
      Session.set('counter1', Session.get('counter1') + addBet1);
      Session.set('playerBet1', Session.get('playerBet1') + addBet1);
      Session.set('gameBalance', Session.get('gameBalance') - addBet1);
        
      Session.set('gameBalance', Session.get('gameBalance') + Math.min(100,CreditAccounts.find({ owner: Meteor.userId()}).fetch()[0].credit));
    },
    'submit .add-bet-2': function (event) {
      event.preventDefault();
      var addBet2 = parseInt(event.target.bet2.value);
      Session.set('counter2', Session.get('counter2') + addBet2);
      Session.set('playerBet2', Session.get('playerBet2') + addBet2);
      Session.set('gameBalance', Session.get('gameBalance') - addBet2);
    },
    'submit .add-bet-3': function (event) {
      event.preventDefault();
      var addBet3 = parseInt(event.target.bet3.value);
      Session.set('counter3', Session.get('counter3') + addBet3);
      Session.set('playerBet3', Session.get('playerBet3') + addBet3);
      Session.set('gameBalance', Session.get('gameBalance') - addBet3);
    },
    'submit .add-bet-4': function (event) {
      event.preventDefault();
      var addBet4 = parseInt(event.target.bet4.value);
      Session.set('counter4', Session.get('counter4') + addBet4);
      Session.set('playerBet4', Session.get('playerBet4') + addBet4);
      Session.set('gameBalance', Session.get('gameBalance') - addBet4);
    },
    'submit .add-bet-5': function (event) {
      event.preventDefault();
      var addBet5 = parseInt(event.target.bet5.value);
      Session.set('counter5', Session.get('counter5') + addBet5);
      Session.set('playerBet5', Session.get('playerBet5') + addBet5);
      Session.set('gameBalance', Session.get('gameBalance') - addBet5);
    },
    'submit .add-bet-6': function (event) {
      event.preventDefault();
      var addBet6 = parseInt(event.target.bet6.value);
      Session.set('counter6', Session.get('counter6') + addBet6);
      Session.set('playerBet6', Session.get('playerBet6') + addBet6);
      Session.set('gameBalance', Session.get('gameBalance') - addBet6);
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

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
  }
})

if (Meteor.isServer) {
  Meteor.publish("creditAccounts", function () {
    return CreditAccounts.find({ owner: this.userId })
  });
  Meteor.publish("games", function () {
    return Games.find();
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
        createdAt: new Date(),
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
    return user;
  })
}
