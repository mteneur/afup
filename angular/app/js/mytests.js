'use strict';
/*constructeur "dog"*//*
var dog = function(){
 var shout = "wouf wouf";
 this.aboyer = function(){
		console.log(shout);
	}
}
dog.prototype.aboyer = function(){
		console.log("wafwaf");
	}

var chien = new dog();
chien.aboyer();

// Provide the wiring information in a module
angular.module('myDogModule', []).
 
  // Teach the injector how to build a 'greeter'
  // Notice that greeter itself is dependent on '$window'
  factory('dogg', function($window) {
    // This is a factory function, and is responsible for 
    // creating the 'greet' service.
    return {
      aboyer: function(text) {
        $window.alert(text);
      }
    };
  });
  
  // And this controller definition
function MyDogController($scope, dogg) {
  $scope.aboie = function() {
    dogg.aboyer('wafwafwouf');
  };
}
*/

'use strict';

// Provide the wiring information in a module
angular.module('myModule', []).
  // Teach the injector how to build a 'greeter'
  // Notice that greeter itself is dependent on '$window'
  factory('greeter', ['$window', function($window) {
    // This is a factory function, and is responsible for 
    // creating the 'greet' service.
    return {
      greet: function(text) {
        $window.alert(text);
      }
    };
  }]);
 angular.module('myModule2', []).
  // Teach the injector how to build a 'greeter'
  // Notice that greeter itself is dependent on '$window'
  factory('chien', [ function() {
    // This is a factory function, and is responsible for 
    // creating the 'greet' service.
    return {
      aboie: function() {
        console.log("woufwouf");
      }
    };
  }]);

var myApp = angular.module('myApp',['myModule', 'myModule2','phonecatApp']) ;

