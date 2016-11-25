/*
Reglas de código:

- "get" es solo para getters, si un método realiza alguna orpeacion para obtener un valor, se llama "obtain"

- Los parámetros en singular corresponden a un solo objeto, en plural a un array.
  Ej. : "listsIds" es un array, "listId" es uno solo

- Un sustantivo identifica a un objeto.
  Ej. : "card" es un objeto tipo card, "cardId" es un solo valor que representa un id de una "card"

*/

_API_LISTS = 'lists';
_API_MEMBERS = 'members';
_API_BOARDS = 'boards';
_API_CARDS = 'cards';

var error = function(errorMsg) {
  console.log('Error: ' + errorMsg);
};



TrelloReport = {

  authorize : function() {

    var deferred = new $.Deferred();

    Trello.authorize({

      type: 'redirect',
      name: 'trello-reports.js',
      persist: 'true',
      scope: {
        read: true,
        write: false,
        account: false
      },
      expiration: 'never',
      success: function() {
        deferred.resolve();
      },
      error: error
    });

    return deferred.promise();

  },

  obtainCardsFromList : function( listId ) {
    return TrelloReport.obtainData(listId, _API_LISTS, 'cards');
  },

  obtainCardsFromLists : function( listsIds ) {

    //Dios mio ayudame a refactorizar esto!

    var deferred = new $.Deferred();

    var deferreds = [];

    var cardsList = [];

    listsIds.forEach(function(listId) {
          var deferredForList = new $.Deferred();

          TrelloReport.obtainCardsFromList(listId).then( function(cards) {

            var listDeferrents = [];

            cards.forEach(function( card ){

              var deferredForCard = new $.Deferred();

              TrelloReport.obtainUsersData( card.idMembers ).then( function(usersData){

                TrelloReport.obtainListData( card.idList ).then( function(listData){

                  card.usersData = usersData; // User data injection
                  card.listData = listData; // List data injection
                  cardsList.push( card );
                  deferredForCard.resolve();

                });

              });

              listDeferrents.push(deferredForCard);

            });

            $.when.apply(null, listDeferrents).done(function() {
              deferredForList.resolve();
            });

          });

          deferreds.push( deferredForList.promise() );
    });

    $.when.apply(null, deferreds).done(function() {
      deferred.resolve(cardsList);
    });

    return deferred.promise();

  },



  obtainUsersData : function( usersIds ) {
    return TrelloReport.obtainArrayData(usersIds, _API_MEMBERS);
  },

  obtainArrayData : function( dataIds, apiCall, apiSpecification = '', apiParams = {}  ) {
    var deferred = new $.Deferred();

    var deferreds = [];

    var dataArray = {};

    dataIds.forEach(function(dataId) {
          var deferredForData = new $.Deferred();

          TrelloReport.obtainData(dataId, apiCall, apiSpecification, apiParams)
            .then( function(data) {

            dataArray[dataId] = data;
            deferredForData.resolve();

          });

          deferreds.push( deferredForData.promise() );
    });

    $.when.apply(null, deferreds).done(function() {
      deferred.resolve(dataArray);
    });

    return deferred.promise();
  },


  obtainBoardData : function( boardId ) {
    return TrelloReport.obtainData(boardId, _API_BOARDS);
  },

  obtainListData : function( listId ) {
    return TrelloReport.obtainData(listId, _API_LISTS);
  },

  obtainUserData : function( userId ) {
    return TrelloReport.obtainData(userId, _API_MEMBERS, '', {fields: 'fullName'});
  },

  obtainData : function( dataId, apiCall, apiSpecification = '', apiParams = {} ) {
    var deferred = new $.Deferred();

    var call = apiCall + '/' + dataId;

    if ( apiSpecification != '' ) call += '/' + apiSpecification

    Trello.get( call, apiParams,
    function( data ){
      deferred.resolve(data);
    }, error);

    return deferred.promise();
  },


  groupCardsByUser : function( cards ){
    var cardsGroupedByUser = {};

    cards.forEach(function( card ){

      Object.keys(card.usersData).forEach( function(userId){
        if ( cardsGroupedByUser[userId] == undefined ){
          cardsGroupedByUser[userId] = {userName: card.usersData[userId].fullName, cards: []};
        }
        cardsGroupedByUser[userId].cards.push(card);
      });

    });

    return cardsGroupedByUser;
  }

};
