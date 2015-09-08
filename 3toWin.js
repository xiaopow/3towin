CreditAccounts = new Mongo.Collection("creditAccounts")

if (Meteor.isClient) {
  Meteor.subscribe("creditAccounts");

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

  Template.body.helpers({
    balance: function () {
      console.log(CreditAccounts.find({}).fetch());
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
    'click #button1': function () {
      // increment the counter when button is clicked
      Session.set('counter1', Session.get('counter1') + 1);
      Session.set('playerBet1', Session.get('playerBet1') + 1);
    },
    'click #button2': function () {
      // increment the counter when button is clicked
      Session.set('counter2', Session.get('counter2') + 1);
      Session.set('playerBet2', Session.get('playerBet2') + 1);
    },
    'click #button3': function () {
      // increment the counter when button is clicked
      Session.set('counter3', Session.get('counter3') + 1);
      Session.set('playerBet3', Session.get('playerBet3') + 1);
    },
    'click #button4': function () {
      // increment the counter when button is clicked
      Session.set('counter4', Session.get('counter4') + 1);
      Session.set('playerBet4', Session.get('playerBet4') + 1);
    },
    'click #button5': function () {
      // increment the counter when button is clicked
      Session.set('counter5', Session.get('counter5') + 1);
      Session.set('playerBet5', Session.get('playerBet5') + 1);
    },
    'click #button6': function () {
      // increment the counter when button is clicked
      Session.set('counter6', Session.get('counter6') + 1);
      Session.set('playerBet6', Session.get('playerBet6') + 1);
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
  Meteor.startup(function () {
    // code to run on server at startup
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
