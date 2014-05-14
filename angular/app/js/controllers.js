'use strict';
var DATE_START = 1;
var DATE_END = 2;
var DATE = 3;

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
/* Controllers */

var confApp = angular.module('confApp', []);

confApp.directive('conference', function() {
    return {
      templateUrl: 'conference.html'
    };
});

confApp.controller('confCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.filters = {"languages":"lang","salles":"salle"};
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






