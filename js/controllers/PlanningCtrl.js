planningPHPTourApp.controller('planningCtrl', ['$scope','$http', '$rootScope', '$location', '$anchorScroll', 'eventHandler', 'fullCalendarService',function($scope, $http, $rootScope,$location,$anchorScroll,eventHandler,fullCalendarService) {
 	//Titre de la page
 	$scope.title = "PHP Tour 2014";

    //Titre des vues
    $scope.viewTitle = {"session":"Sessions", "calendar":"Agenda", "split":"Split View"}

	//Liste des filtres
	$scope.filters = {"conferenciers":"conferenciers"};

    //Conf selectionnées
    $scope.selectedConf = [];
	
	//Conf en conflit
    $scope.conflictConfs = [];
	
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

		var addClass = fullCalendarService.SAVED_CLASS;
		
		
		if(conf.id in $scope.conflictConfs)
			delete($scope.conflictConfs[conf.id]);
			
        if(conf.id in $scope.selectedConf) {
            delete($scope.selectedConf[conf.id]);
			addClass = '';
            //toggleButton(angular.element($event.target), 'add');
        } else {
            if($scope.checkConflict(conf)) {
                addClass = fullCalendarService.CONFLICT_CLASS; 
				$scope.conflictConfs[conf.id] = conf;				
            }
			//console.log("click");
            $scope.selectedConf[conf.id] = conf;
           // toggleButton(angular.element($event.target), 'remove');
        }

        fullCalendarService.changeClassEvent(conf.id, addClass);
    };

	//????
    $scope.highlightSessions = function(filtredConf){
        var filtred = true;
        if (filtredConf == null) {
            filtredConf = $scope.confs;
            filtred = false;
        }

        angular.forEach(filtredConf, function(selectedConf, key){
            fullCalendarService.filtredEvent(selectedConf.id, filtred);
        });
    }

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
        location.hash = "#search";
    }

	//pas sur de l'utilité et ca alourdit
    $scope.changeView = function() {
        var session = angular.element('.session');
        var agenda = angular.element('.agenda');
        var icon = angular.element('.agenda h2 span');

        var hiddenClass = 'hidden';
        var fullSizeClass = 'col-md-12';
        var normalSizeClass = 'col-md-7';

        var leftIcon = 'glyphicon-arrow-left';
        var rightIcon = 'glyphicon-arrow-right';

        if (session.hasClass(hiddenClass)) {
            session.removeClass(hiddenClass);
            agenda.removeClass(fullSizeClass).addClass(normalSizeClass);
            icon.removeClass(leftIcon).addClass(rightIcon);
        } else {
            session.addClass(hiddenClass);
            agenda.removeClass(normalSizeClass).addClass(fullSizeClass);
            icon.removeClass(rightIcon).addClass(leftIcon);
        }

        fullCalendarService.init($scope.confs);
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
    return (new Date(startA).getTime() < new Date(endB).getTime()) && (new Date(endA).getTime() > new Date(startB).getTime());
}