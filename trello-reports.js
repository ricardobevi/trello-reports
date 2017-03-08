

var listsId = {};

var listsStyles = {};

listsId = [
   '580a5f3cfa349774e00d7c00'
  ,'56c726f323c1c5b880ebc2fb'
  ,'56c726f54b93c2e1e4fe3aa1'
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

    console.log(JSON.stringify(groupedCards));

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
