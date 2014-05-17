'use strict';

/** constants **/
var SELECT = "select";
var SAVE = "save";

/** tools , TODO: externalize it **/
var DATE_START = 1;
var DATE_END = 2;
var DATE = 3;

function unset(array,search){
	var index = array.indexOf(search);
	
	if (index > -1) {
		array.splice(index, 1);
	}
	return array;
}

function getDate(strDate,mode){
	var pattern = /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}) - (\d{2}):(\d{2})/;
	var date = null;
	if(mode == DATE_START)
		date = new Date(strDate.replace(pattern,'$3-$2-$1T$4:$5:00'));
	else if(mode == DATE_END)
		date = new Date(strDate.replace(pattern,'$3-$2-$1T$6:$7:00'));
	else
		date = new Date(strDate.replace(pattern,'$3-$2-$1'));
		
	return date;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function getId(strLink) {
	return strLink.split("#")[1];
}
/** end tools **/


/* Controllers */

//afup php tour conference app
var confApp = angular.module('confApp', []);



/**
	conference directive, use it to display a conference 
**/
confApp.directive('myConference', [function() {
    return {
      templateUrl: 'conference.html'
    };
}]);






var BUTTON_MESSAGE = "button";


/** 
eventHandler service
used to share event between multiple controllers
**/
confApp.service('eventHandler', function($rootScope) {

		var mapFnEvent = new Array();
		this.fireEvent = function(eventId,msg) {
			console.log('fire: ' + eventId + " msg:" +msg);
			$rootScope.$broadcast(eventId, msg);
		};
		
		
		this.linkEvent = function(eventId,fn) {
			$rootScope.$on(eventId, function(event, msg) {
					if(typeof(fn) === "function")
						fn(eventId, msg);
					console.log('received: ' + eventId + " msg:" +msg);
            });
		};

});


 
 /**
 //example to link event with a directive (not a good method)
confApp.directive('trigger', function($rootScope) {

	function link($rootScope , tElement, attr) {
		var scope=angular.element(tElement).scope();
		scope.fireEvent = function(eventId,msg) {
			console.log('firing: ' + msg);
			$rootScope.$broadcast(eventId, msg);
		};
	 }
	 return {
        link:link
		};
});
**/
/**
//example how to link listener with directives
confApp.directive('listener', function($rootScope) {
	 return {
        link: function($rootScope , element, attr) {
            $rootScope.$on('test', function(event, msg) {
                console.log('received: ' + msg);
            });
        }
	  };
});
**/

//demo controller
//use it to test how to share events between controllers
confApp.controller('exampleCtrl', ['$scope', 'eventHandler' ,function($scope,eventHandler) {
     $scope.msg = "pas de message";
	 $scope.test = function(eventId,msg){
		console.log("scope2" + eventId + " " + msg);
		$scope.msg = msg;
	};
	eventHandler.linkEvent(SELECT,$scope.test);
 }]);

//Conference list controller
confApp.controller('confCtrl', ['$scope', '$http', '$location', '$anchorScroll','eventHandler' ,function($scope, $http,$location,$anchorScroll,eventHandler) {
	
	//defined scope filters (automatically computed from conf (see http import) JSON)
	$scope.filters = {"languages":"lang","salles":"salle"};
	
	//current selected conf
	$scope.selectedConf = 0;
	
	//current saved conf
	$scope.savedConf = new Array();
  
  
	/**
		select conference action : when a user want to select a conf to see it 
		=> scroll to conf and add green border
	**/
	$scope.select = function(eventId,msg){
	  console.log("select fn");
			$location.hash(msg);
			$scope.selectedConf = ($scope.selectedConf == msg)? 0 : msg;
			$anchorScroll();
	 };
  
  
	/**
		Save conference action : when a user want to save a conf to print/export it in a further time
		=> record conf id in savedConf tab
		=> change conf background of saved conf
	**/
	$scope.save = function(eventId,msg){
	  console.log("save fn");
			$location.hash(msg);
			
			if(typeof $scope.savedConf[msg] == 'undefined')
				$scope.savedConf[msg] = msg;
			else
				unset($scope.savedConf,msg);
			//$scope.savedConf[msg] = (typeof $scope.savedConf[msg] != 'undefined') ? !$scope.savedConf[msg] : 1;
			$anchorScroll();
	  };
  
	//exemple test function to add multiple function to same event
	$scope.test = function(){
			$scope.save('save','1076');console.log($scope.savedConf);
	};
  
  
	//Examples : link event from eventHandlerservice to local scope functions
	eventHandler.linkEvent(SELECT,$scope.select);
	eventHandler.linkEvent(SAVE,$scope.save);
	eventHandler.linkEvent(SAVE,$scope.test);
  
	//send select event use eventHandler service
	$scope.fireSelectEvent = function(eId){
		eventHandler.fireEvent(SELECT,eId);
	};
	
	//save event use eventHandler service
	$scope.fireSaveEvent = function(eId){
		eventHandler.fireEvent(SAVE,eId);
	};

  
  //recuperation fichier JSON et traitement pour construire les listes de filtres (salles, langue, etc.)
  $http.get('jsonconfs.json').success(function(data) {
    $scope.confs = data;
	var conf_attr_name = "";
	for(var filtername in $scope.filters){
		$scope[filtername] = [];
	}
	
	//automatically construct filters from Afup conference Json
	angular.forEach($scope.confs, function(conf, key){
		for(var filtername in $scope.filters){
			conf_attr_name = $scope.filters[filtername];
			if (!inArray(conf[conf_attr_name],$scope[filtername])) {
				$scope[filtername].push(conf[conf_attr_name]);
		   }
		} 
	  });
		
		
  });


  //calculate duration between 2 dates	
  $scope.getDuree = function(date1,date2) {
	var d1 = new Date(date1);
	var d2 = new Date(date2);
	return moment.duration(d1.getTime()-d2.getTime()).asMinutes();
  }

  
  //get date obj from  string
  $scope.getDate = function(strDate) {
	return getDate(strDate);
  }

}]);






