'use strict';
var DATE_START = 1;
var DATE_END = 2;
var DATE = 3;

/** tools **/
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
/** **/

/** event manager for external tools 
use it to interact with angular **/


function eventHandlerSingleton(eventId){
	 if ( arguments.callee._singletonInstance )
		return arguments.callee._singletonInstance;
	 arguments.callee._singletonInstance = this;
	 
	 this.event = new Event(eventId);
}
/**
function eventHandler() {
 
	if ( typeOf maClasse.initialized == "undefined" ) {
	eventHandler.prototype.getListener(eventId) = function() {
		return new eventHandlerSingleton(eventId);
	// code
	}

	eventHandler.prototype.getTrigger(eventId) = function() {
	// code
	}
	eventHandler.initialized = true;
}

  

  event.eventName = "name-of-custom-event";

  if (document.createEvent) {
    element.dispatchEvent(event);
  } else {
    element.fireEvent("on" + event.eventType, event);
  }
 
 }

/** **/

//this.event = new Event("test");

/* Controllers */

var confApp = angular.module('confApp', []);

confApp.directive('myConference', [function() {

	/*function test (scope, element, attr) {
		 element.on('mousedown', function(event) {
			console.log(element.attr("id"));
			$rootScope.$broadcast('test', "tutu");
		  });
	  };*/
	  
    return {
	  //link:test,
      templateUrl: 'conference.html'
    };
}]);


confApp.directive('oldtrigger', [function($rootScope) {


	function linked($rootScope, element, attr) {
		 element.on('mousedown', function(event) {
			//perform(element);
			$rootScope.$broadcast('test', "test");
			console.log(element.attr("id"));
		  });
	  };
	  
	 return {
	  link:linked
	  };
}]);


function goReceive(){
	alert("receive");
}
/**
function triggerFunction(rootScope,msg) {
			console.log('firing: ' + msg);
			rootScope.broadcast('test', msg);
};

**/




var BUTTON_MESSAGE = "button";


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
		
		/**this.linkEvent = function(eventId,fn) {
			
			if (typeof mapFnEvent[eventId] == 'undefined') {
				mapFnEvent[eventId] = new Array();
			}
			
			if(typeof(fn) === "function") {
				var index = mapFnEvent[eventId].length;
				mapFnEvent[eventId][index] = fn;
			}
			
			$rootScope.$on(eventId, function(event, msg) {
				mapFnEvent[eventId].forEach(function(fn) {
					if(typeof(fn) === "function")
						fn(eventId, msg);
					console.log('received: ' + eventId + " msg:" +msg);
				});
            });
		};**/
});
/**
confApp.factory('fireEvent', function(eventId,msg) {
			console.log('firing: ' + msg);
			$rootScope.$broadcast(eventId, msg);
		});**/

 
confApp.directive('trigger', function($rootScope) {

	function link($rootScope , tElement, attr) {
		var scope=angular.element(tElement).scope();
		scope.fireEventt = function(eventId,msg) {
			console.log('firing: ' + msg);
			$rootScope.$broadcast(eventId, msg);
		};
	 }
	 return {
        link:link
		};
});

	
confApp.directive('listener', function($rootScope) {

	/*function link($rootScope) {
		alert("ok");
		  $rootScope.$on('test', function(event, msg) {
                console.log('received: ' + msg);
            });
	  };*/
	 return {
        link: function($rootScope , element, attr) {
            $rootScope.$on('test', function(event, msg) {
                console.log('received: ' + msg);
            });
        }
	  };
});

function myCtrl($scope, $rootScope, $timeout) {
    
    // This one doesn't get picked up by the service as it's link hasn't run by the time this controller runs
    $scope.fireEvent('sync');
    // You can stick it in a timeout instead
    $timeout(function() { $scope.fireEvent('async'); });
    console.log('finished controller');
}

confApp.controller('exampleCtrl', ['$scope', 'eventHandler' ,function($scope,eventHandler) {
     $scope.msg = "pas de message";
	 $scope.test = function(eventId,msg){
		console.log("scope2" + eventId + " " + msg);
		$scope.msg = msg;
	};
	eventHandler.linkEvent("test",$scope.test);
 }]);
 
confApp.controller('confCtrl', ['$scope', '$http', '$location', '$anchorScroll','eventHandler' ,function($scope, $http,$location,$anchorScroll,eventHandler) {

  $scope.filters = {"languages":"lang","salles":"salle"};
  $scope.selectedConf = 0;
  $scope.savedConf = new Array();
  
  $scope.select = function(eventId,msg){
  console.log("select fn");
		$location.hash(msg);
		$scope.selectedConf = ($scope.selectedConf == msg)? 0 : msg;
		$anchorScroll();
  };
  
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
  
  $scope.test = function(){$scope.save('save','1076');console.log($scope.savedConf);};
  
  eventHandler.linkEvent("select",$scope.select);
  eventHandler.linkEvent("save",$scope.save);
  eventHandler.linkEvent("save",$scope.test);
  $scope.fireSelectEvent = function(eId){
		eventHandler.fireEvent("select",eId);
	};
	
	$scope.fireSaveEvent = function(eId){
		eventHandler.fireEvent("save",eId);
	};
  /**$scope.salles = [];
  $scope.languages = [];**/
  
  //recuperation fichier JSON et traitement pour construire les listes de filtres (salles, langue, etc.)
  $http.get('jsonconfs.json').success(function(data) {
    $scope.confs = data;
	var conf_attr_name = "";
	for(var filtername in $scope.filters){
		$scope[filtername] = [];
	}
	
	angular.forEach($scope.confs, function(conf, key){
	
		for(var filtername in $scope.filters){
			conf_attr_name = $scope.filters[filtername];
			if (!inArray(conf[conf_attr_name],$scope[filtername])) {
				$scope[filtername].push(conf[conf_attr_name]);
		   }
		} 
		   
		   /**if(!inArray(conf.lang,$scope.languages)){
		   }**/
	  });
		
		
  });
  
  $scope.bgColor = "grey";
  $scope.count = 0;
  
  $scope.changeBackground = function(color) {
      $scope.bgColor = color;
    }
	
  $scope.getDuree = function(date1,date2) {
	var d1 = new Date(date1);
	var d2 = new Date(date2);
	return moment.duration(d1.getTime()-d2.getTime()).asMinutes();
  }
  
  $scope.changed = function(value,element) {
	console.log(element + "=" + value);
  }
  
  $scope.getDate = function(strDate) {
	return getDate(strDate);
  }
	/**
  $scope.getId = function(strLink) {
		return strLink.split("#")[1];
    //return getId(strLink); 
  }**/
  
	$scope.affiche = function($event) {
      console.log("id element :" + $event.target.id);
    }
	

}]);






