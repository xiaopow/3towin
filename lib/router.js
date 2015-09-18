var requireLogin = function() { 
  if (! Meteor.user()) {
   // If user is not logged in render landingpage
   this.redirect('/'); 
   this.next();
 } else {
   //if user is logged in render whatever route was requested
   this.next();
 }
}

// Before any routing run the requireLogin function. 
// Except in the case of "landingpage". 
// Note that you can add more pages in the exceptions if you want. (e.g. About, Faq, contact...) 
Router.onBeforeAction(requireLogin, {except: ['Landing']});

Router.configure({
  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [
      Meteor.subscribe('games'),
      Meteor.subscribe('creditAccounts')
    ];
  }
});

// ------------------------------------ Landing Page

Router.route('/', function() {
  this.render('Landing');
});