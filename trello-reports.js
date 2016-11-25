

var listsId = {};

var listsStyles = {};

listsId = [
   '58374c0fe478b165395e0349'
  ,'58374c0fe478b165395e034a'
  ,'58374c0fe478b165395e034b'
  ,'58374c0fe478b165395e034c'
];

listsStyles['TODO'] = {'name': 'todo', 'color': '#F44336'};
listsStyles['WIP'] = {'name': 'wip', 'color': '#FF9800'};
listsStyles['REVIEW'] = {'name': 'review', 'color': '#FDD835'};
listsStyles['DONE'] = {'name': 'done', 'color': '#4CAF50'};

$( document ).ready(function() {
  deferreds = [];
  members = {};

  var dateObj = new Date();
  var date = 'D&iacute;a ' + dateObj.getDay() + ' - ' + dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + '/' + dateObj.getFullYear();

  $('#date').html( date );

  TrelloReport.authorize().then(authenticationSuccess);

});


var authenticationSuccess = function() {

  console.log('Successful authentication');

  TrelloReport.obtainCardsFromLists(listsId).then(function(cards){

    groupedCards = TrelloReport.groupCardsByUser(cards);

    //console.log(JSON.stringify(groupedCards));

    var mail = '';

    Object.keys(groupedCards)
    .sort( function(a, b){ return groupedCards[a].userName > groupedCards[b].userName} )
    .forEach(function(userId) {

      mail += '<div>';

      mail += '<p style="font-weight:bold">' + groupedCards[userId].userName + '</p>';

      mail += '<ul style="list-style-type:none">';

      groupedCards[userId].cards
        .sort(function(a, b) {return a.listData.name < b.listData.name})
        .forEach(function(card){
        mail += '<li><span style="color:' + listsStyles[card.listData.name].color + '; font-weight:bold;">[' +
                 card.listData.name + ']</span> ' + card.name + '</li>';
      });

      mail += '</ul>';

      mail += '</div>';

    });

    $('#mail').html( mail );

  });



};
