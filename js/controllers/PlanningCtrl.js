/** constants **/
var SELECT = "conf_select";
var SAVE = "conf_save";

/** 
eventHandler service
used to share event between multiple controllers
**/
planningPHPTourApp.service('eventHandler', function($rootScope) {

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

planningPHPTourApp.controller('planningCtrl', ['$scope','$http', '$location', '$anchorScroll','eventHandler', function($scope, $http,$location,$anchorScroll,eventHandler) {
 	//Titre de la page
 	$scope.title = "PHP Tour 2014 : Sessions";

    //Titre des vues
    $scope.viewTitle = {"session":"Sessions", "calendar":"Agenda", "split":"Split View"}

    //Vue courante
    $scope.moduleState = 'session';

	//Liste des filtres
	$scope.filters = {"languages":"lang","salles":"salle"};

	//current selected conf
	$scope.selectedConf = 0;
	
	//current saved conf
	$scope.savedConf = new Array();
	
	//Chargement des conférences
  	$http.get('data/data.json').success(function(data) {
  		$scope.confs = data;
		var conf_attr_name = "";

		//Initialisation des filtres
		for(var filtername in $scope.filters){
			$scope[filtername] = [];
		}

		//Remplissage des filtres
		angular.forEach($scope.confs, function(conf, key){
			for(var filtername in $scope.filters){
				conf_attr_name = $scope.filters[filtername];
				if (!inArray(conf[conf_attr_name],$scope[filtername])) {
					$scope[filtername].push(conf[conf_attr_name]);
				}
			}
		});
	});

    $scope.buildAfupUrl = function(id, type) {
        var base = 'http://afup.org/pages/phptourlyon2014/conferenciers.php#'
        var suffixe = '';
        if (type == 'img') {
            base = 'http://afup.org/templates/phptourlyon2014/images/intervenants/';
            suffixe = '.jpg';
        }
		console.log(base + id + suffixe);
        if (id != '') {
            return base + id + suffixe;
        } else {
            return '';
        }
    };

    $scope.changeModuleState = function(moduleState)
    {
        $scope.moduleState = moduleState;
    };
	$scope.search = new Array();	
	$scope.byAll = function(conf){
		var salle = (typeof $scope.search.salle === 'undefined') ? 1 : contains(conf.salle,$scope.search.salle);
		var lang = (typeof $scope.search.lang === 'undefined') ? 1 : contains(conf.lang,$scope.search.lang);
		var free = (typeof $scope.search.query === 'undefined') ? 1 : (contains(conf.detail,$scope.search.query) || contains(conf.name,$scope.search.query));
			
		return  ( salle && lang && free);
	};
	
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
			
			//$anchorScroll();
			console.log("save");
			$scope.colorCalendarEvent(msg);
			
	  };
	
	eventHandler.linkEvent(SELECT,$scope.select);
	//send select event use eventHandler service
	$scope.fireSelectEvent = function(eId){
		eventHandler.fireEvent(SELECT,eId);
	};
	
	//save event use eventHandler service
	$scope.fireSaveEvent = function(eId){
		eventHandler.fireEvent(SAVE,eId);
		console.log("event fired");
		$scope.colorCalendarEvent(eId);
	};
	
	//calendar
	var calendar = "";
	$scope.events = new Array();
	/**$scope.makeEvent= function(session) {
    	var newEvent = new Object();

    	//var time = session.get('timeSlot').split(' - ');
    	var eventDateStart = session.date_start;
    	var eventDateEnd = session.date_end;
		
    	newEvent.id = session.id;
    	newEvent.className = '';
		newEvent.title = session.name;
		newEvent.start = eventDateStart.toDate();
		newEvent.end = eventDateEnd.toDate();
		newEvent.allDay = false;
		console.log(newEvent);
		return newEvent;
		
	};**/
	
	$scope.colorCalendarEvent = function(idSession) {
		console.log("hello");
		var sessionEvent = calendar.fullCalendar( 'clientEvents', idSession)[0];
		console.log("calendar_color_changed");
		sessionEvent.backgroundColor = '#26FF00';
		//sessionEvent.className = className;
		calendar.fullCalendar('updateEvent', sessionEvent);
		
	}
	
	$scope.getCalendar = function() {
				calendar = $('#calendar');
				calendar.fullCalendar(getFullCalendarConfiguration());		

				if($scope.events.length < 1)
					angular.forEach($scope.confs, function (conf) {
						$scope.events.push(makeEvent(conf));
					});
					
				calendar.fullCalendar('addEventSource', $scope.events ,'stick');
				/**$('#calendar').fullCalendar({
					eventClick: function(event, element) {
						event.title = "CLICKED!";
						console.log(element);
						$('#calendar').fullCalendar('updateEvent', event);
					}
				});**/

	};

	
	$scope.addEvent = function(event){
		calendar.fullCalendar('renderEvent', makeEvent(event) ,'stick');
		};
	

}]);



function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
/**
function stristr(haystack, needle, bool) {
  //  discuss at: http://phpjs.org/functions/stristr/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  //   example 1: stristr('Kevin van Zonneveld', 'Van');
  //   returns 1: 'van Zonneveld'
  //   example 2: stristr('Kevin van Zonneveld', 'VAN', true);
  //   returns 2: 'Kevin '

  var pos = 0;

  haystack += '';
  pos = haystack.toLowerCase()
    .indexOf((needle + '')
      .toLowerCase());
  if (pos == -1) {
    return false;
  } else {
    if (bool) {
      return haystack.substr(0, pos);
    } else {
      return haystack.slice(pos);
    }
  }
}**/

function contains(haystack,needle) {
	return haystack.toLowerCase().indexOf((needle+'').toLowerCase()) > -1;
}

function getFullCalendarConfiguration() {
    	var config = new Object({
			header: {
				left: '',
				center: '',
				right: ''
			},
			year: 2014,
			month: 5,
			date: 23,
			defaultView: "agendaWeek",
			weekends:false,
			hiddenDays: [ 3, 4, 5 ],
			editable: false,
			allDaySlot:false,
			slotMinutes:15,
			firstHour:9,
			minTime:9,
			maxTime:18,
			h: 2500,
			timeFormat: 'H(:mm)',
			columnFormat: {
				week: 'dddd dd MMMM'
			},
			axisFormat: 'HH:mm',
			dayNames: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],
			dayNamesShort: ['Lun','Mar','Mer','Jeu','Thu','Ven','Sam','Dim'],
			monthNames : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
			eventClick: function(event, element) {
						console.log(event.id);
						var rootScope = angular.element('html').scope();
						//$('#calendar').fullCalendar('updateEvent', event);
						rootScope.$broadcast(SELECT, event.id);
					}
		});

		return config;
};

function makeEvent(session) {
    	var newEvent = new Object();

    	//var time = session.get('timeSlot').split(' - ');
    	var eventDateStart = session.date_start;
    	var eventDateEnd = session.date_end;
		
    	newEvent.id = session.id;
    	newEvent.className = '';
		newEvent.title = session.name;
		newEvent.start = new Date(eventDateStart);
		newEvent.end = new Date(eventDateEnd);
		newEvent.allDay = false;

		return newEvent;
	};