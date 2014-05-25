planningPHPTourApp.controller('planningCtrl', ['$scope','$http', '$rootScope', '$location', '$anchorScroll', 'eventHandler', 'fullCalendarService',function($scope, $http, $rootScope,$location,$anchorScroll,eventHandler,fullCalendarService) {
 	//Titre de la page
 	$scope.title = "PHP Tour 2014 : Sessions";

    //Titre des vues
    $scope.viewTitle = {"session":"Sessions", "calendar":"Agenda", "split":"Split View"}

	//Liste des filtres
	$scope.filters = {"conferenciers":"conferenciers"};

    //Conf selectionnées
    $scope.selectedConf = [];
	
	$scope.showConf = '';

	
	//Chargement des conférences
  	$http.get('data/data.json').success(function(data) {
  		$scope.confs = data;
		var conf_attr_name = "";

		//Initialisation des filtres
		for(var filtername in $scope.filters){
			$scope[filtername] = [];
		}

		//Remplissage du filtre conférencier
        angular.forEach($scope.confs, function(conf, key){
			($scope.confs[key]).idLang = ''+conf.lang + conf.lang;
            var conferenciers = conf['conferenciers'];
            for(var key in conferenciers){
                $scope['conferenciers'].push(conferenciers[key]);
            }
        });
		
		fullCalendarService.init($scope.confs);
	});

    $scope.toggleSession = function(conf, $event){        
        var addClass = 'savedEvent';

        if(conf.id in $scope.selectedConf) {
            var conflitId = $scope.checkConflict(conf);
            if (conflitId) {
                var conflitedConf = $scope.selectedConf[conflitId];
                fullCalendarService.changeClassEvent(conflitedConf.id, 'savedEvent');
            }

            delete($scope.selectedConf[conf.id]);
            addClass = '';
            //toggleButton(angular.element($event.target), 'add');
        } else {
            if($scope.checkConflict(conf)) {
                addClass = 'conflictEvent';        
            }
			console.log("click");
            $scope.selectedConf[conf.id] = conf;
           // toggleButton(angular.element($event.target), 'remove');
        }

        fullCalendarService.changeClassEvent(conf.id, addClass);
    };

    $scope.checkConflict = function(newConf){
        var overlap   = false;
        var id        = newConf.id;
        var dateStart = newConf.date_start;
        var dateEnd   = newConf.date_end;
        
        angular.forEach($scope.selectedConf, function(conf, key){
            if ((id != conf.id) && checkDatesRangeOverlap(dateStart,dateEnd,conf.date_start,conf.date_end)) {
                overlap = conf.id;
            }
        });

        return overlap;
    }

    $scope.top = function() {
        location.hash = "#top";
    }
	
	//gère l'évènement "selection"
	//n'intervient pas dans la vue, c est a la vue de définir les actions selon la valeur des données
	$scope.eventSelected = function(msg) {
	
		if($scope.showConf != msg)
		{
			$location.hash(msg);
			$scope.showConf = msg;
			$anchorScroll();
		}else
			$scope.showConf='';
	
		$scope.$apply()
	}
	eventHandler.linkEvent(eventHandler.SELECT,$scope.eventSelected);

}]);

//A voir si on les intègre au ctrl
/** pas a faire dans ctrl je pense, le switch ne concerne que la vue en fonction de la variable qui garde les confs sélectionnées
function toggleButton(el, state)
{
    var addClass = 'btn-primary';
    var removeClass = 'btn-danger';
    var text = 'Je participe !';

    if(state != 'add') {
        var tmpClass = addClass;
        addClass = removeClass;
        removeClass = tmpClass;
        text = 'Je ne participe plus.';
    }

    el.removeClass(removeClass)
    el.addClass(addClass)
    el.html(text);
}**/

function checkDatesRangeOverlap(startA,endA,startB,endB) {
    return (new Date(startA).getTime() <= new Date(endB).getTime()) && (new Date(endA).getTime() >= new Date(startB).getTime());
}