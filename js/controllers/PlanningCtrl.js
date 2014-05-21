/**
TODO: essayer de redre l'utilisation du calendrier dans le controlleur générique et spécifier via des modules/configs externes que l'on peut
facilement plugger/deplugger (voir si on peut faire de l'ijection par exemple)

ATTENTION des filtres sont utilisés du répertoire "filtres" , comme 'unique'
**/

/** constants (for event handler) **/
var SELECT = "conf_select";
var SAVE = "conf_save";



/** 
eventHandler service
used to share event between multiple controllers
**/
//permet de sauvegarder les évènements je ne comprends pas pourquoi il en créé plein au lancement du template
var linkedEvents = new Array();
planningPHPTourApp.service('eventHandler', function($rootScope) {

		var mapFnEvent = new Array();
		this.fireEvent = function(eventId,msg) {
			console.log('fire: ' + eventId + " msg:" +msg);
			$rootScope.$broadcast(eventId, msg);
		};
		
		
		this.linkEvent = function(eventId,fn) {
			
			if(!inArray(encodeURIComponent(fn.toString()),linkedEvents))
			{
				//sécurité pour avoir une string unique par fonction
				//TODO: fait à la va vite, à utiliser si pas le choix mais clairement pas optimisé
				linkedEvents.push(encodeURIComponent(fn.toString()));
				$rootScope.$on(eventId, function(event, msg) {
						if(typeof(fn) === "function")
							fn(eventId, msg);
						console.log('received: ' + eventId + " msg:" +msg);
				});
			}
		};

});
/**
**/

//utilisation de variables globales car les templates "partial" rechargent le controlleur et les données scope sont réinitialisées
//les variables globales permettent de sauvegarder l'état des données
//TODO: on doit mal s'y prendre mais j'ai pas trouver d'autres solutions
var aSavedConf = new Array();
var calendarEvents = new Array();
var jsonConfsData = '';
var calendarObj = '';

/** controller**/
planningPHPTourApp.controller('planningCtrl', ['$scope','$rootScope','$http', '$location', '$anchorScroll','eventHandler', function($scope, $rootScope, $http,$location,$anchorScroll,eventHandler) {
 	//Titre de la page
 	$scope.title = "PHP Tour 2014 : Sessions";

    //Titre des vues
    $scope.viewTitle = {"session":"Sessions", "calendar":"Agenda", "split":"Split View"}

    //Vue courante
    $scope.moduleState = 'session';

	//current selected conf
	$rootScope.selectedConf = -1;
	
	//current saved conf
	$rootScope.savedConf = aSavedConf;
	
	//filtre de recherche
	$scope.search = new Array();
	
	//Permet de retrouver les données json à chaque rechargement du controlleur sans re-parser le tout
	$scope.confs = jsonConfsData;
	
	//Chargement des conférences si elles ne l'ont pas été déjà
	if($scope.confs == '')
		$http.get('data/data.json').success(function(data) {
			$scope.confs = data;
			console.log("ini");
			jsonConfsData = $scope.confs;
		});

	/*** TOOLS 
	(a voir si on les garde dans le controlleur ou si on les sort) 
	***/
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

	//change l'état du menu
    $scope.changeModuleState = function(moduleState)
    {
        $scope.moduleState = moduleState;
    };
	
	
	//fonction utilisée par le filtre permettant de rechercher dans le titre OU dans le résumé un mot	
	$scope.byAll = function(conf){
		var salle = (typeof $scope.search.salle === 'undefined') ? 1 : contains(conf.salle,$scope.search.salle);
		var lang = (typeof $scope.search.lang === 'undefined') ? 1 : contains(conf.lang,$scope.search.lang);
		var free = (typeof $scope.search.query === 'undefined') ? 1 : (contains(conf.detail,$scope.search.query) || contains(conf.name,$scope.search.query));
			
		return  ( salle && lang && free);
	};
	/*************************** fin des outils *********************************/
	
	/******************************************************
	Gestion des évènements et fonctions associées
	******************************************************/
	
	//Fonction permettant sélectionner une conférence (CAD afficher cadre vert + scroller vers la conf)
	$scope.select = function(eventId,msg){
	  console.log("select fn");
			$location.hash(msg);
			$rootScope.selectedConf = ($rootScope.selectedConf == msg)? 0 : msg;
			$anchorScroll();
	 };
  
  
	//Fonction permettant de sauvegarder/supprimer dans sa liste de choix une conférence (CAD afficher cadre vert + scroller vers la conf)
	$scope.save = function(eventId,msg){
	  console.log(eventId + " " +msg);
	 
			//si la conf n'était pas sauvegardée on la sauvegarde sinon on l'enlève de la liste
			if(typeof $rootScope.savedConf[msg] == 'undefined')
				$rootScope.savedConf[msg] = msg;
			else
				$rootScope.savedConf = unset($rootScope.savedConf,msg);

			aSavedConf = $rootScope.savedConf;
			console.log(aSavedConf);
			 console.log($rootScope.savedConf);
	  };
	
	//Connecte la fonction "select" à l'évènement SELECT
	eventHandler.linkEvent(SELECT,$scope.select);
	
	//envoie un évènement de sélection d'une conf via l'event handler
	//l'id de la conf est utilisé en paramètre
	$scope.fireSelectEvent = function(eId){
		eventHandler.fireEvent(SELECT,eId);
	};
	
	//envoie un évènement pour signaler qu'une conf est sauvegardée
	//l'id de la conf est utilisé en paramètre
	$scope.fireSaveEvent = function(eId){
		var overlap = $scope.checkConfDateRange(eId,true);
		
		if(overlap)
			alert("collision avec " + $scope.confs[overlap].name);
			
		$scope.save(SAVE,eId);
		eventHandler.fireEvent(SAVE,eId);
		console.log("event fired");		
	};
	
	//vérifie si une conférence chevauche une de celles sélectionnées
	$scope.checkConfDateRange= function(confIndex,bWantIndex){
	
		var overlap = false;
		var dateStart = $scope.confs[confIndex].date_start
		var dateEnd = $scope.confs[confIndex].date_end
		console.log("index :"+confIndex);
		for (var selectedConfIdex in $rootScope.savedConf)
		{console.log(selectedConfIdex +"index :"+confIndex);
			if(overlap = (selectedConfIdex != confIndex) && checkDatesRangeOverlap(dateStart,dateEnd,$scope.confs[selectedConfIdex].date_start,$scope.confs[selectedConfIdex].date_end))
				break;
		}
		
		if(bWantIndex && overlap)
			return selectedConfIdex;
		else
			return overlap;
	}
	
	/************************************* fin gestion des évènements ******************************************************************/
	
	
	
	
	
	
	/****************************************************
	calendar management 
	*******************************************************/
	
	//variable globale permettant de conserver l'objet calendar 
	//(à voir si c'est pertinent de le sauvegarder dans le scope mais du coup risquer de le perdre dans les partials)
	$scope.calendar = calendarObj;
	
	//liste des évènements du calendrier
	//Evite d'avoir à les récupérer à chaque calcul sur le calendrier
	//le tableau des évènements a les mêmes ids que les conférences afin de faciliter la correspondance
	$scope.events = calendarEvents;
	
	//permet de colorier un évènement du calendrier
	$scope.colorCalendarEvent = function(idSession) {
		console.log("hello");
		if($scope.calendar != '')
		{
			var sessionEvent = $scope.calendar.fullCalendar( 'clientEvents', idSession)[0];
			console.log("calendar_color_changed"+sessionEvent);
			sessionEvent.backgroundColor = '#26FF00';
			//sessionEvent.className = className;
			$scope.calendar.fullCalendar('updateEvent', sessionEvent);
		}
		
	}
	
	//fonction permettant de signaler qu'une conf a été sauvegardée
	$scope.saveCalendarEvent = function(eId,msg){
		console.log($rootScope.savedConf);
		if($scope.calendar != '')
		{
			var sessionEvent = $scope.events[msg];
			//console.log("saveCalendarEvent" + sessionEvent);
			
			sessionEvent.saved = (typeof $rootScope.savedConf[msg] != 'undefined'); //permet d'avoir l'état d'un évènement , s'il était déjà sauvegardé on le désélectionne (== plus dans la liste)
			sessionEvent.backgroundColor = sessionEvent.saved ? '#26FF00':''; // selon l'état de l'évènement on applique la couleur
			$scope.calendar.fullCalendar('updateEvent', sessionEvent);
		}
	}
	
	
	
	//fonction qui construit le calendrier et enregistre dans une variable le résultat
	//TODO: peut etre la renommer vu qu'elle ne retourne rien ...
	//TODO : voir si on peut éviter de le construire à chaque appel sur la vue
	$scope.getCalendar = function() {
				console.log("getCalendar");
				$scope.calendar = $('#calendar');
				calendarObj = $scope.calendar;
				$scope.calendar.fullCalendar(getFullCalendarConfiguration());
				//ne construit qu'une fois la liste des évènements (vu que le calendrier semble être appelé à chaque initialisation de la vue
				
				if($scope.events.length < 1)
				{
					angular.forEach($scope.confs, function (conf,id) {
						$scope.events[id] = makeEvent(conf,id);
					});
					calendarEvents = $scope.events;
					$scope.updateColors();
				}	
				$scope.calendar.fullCalendar('addEventSource', $scope.events ,'stick');
				
				//on lie la fonction de sauvegarde à l'évènement
				//TODO : mis ici car le template est chargé plusieurs fois et du coup on créé plusieurs liens.
				//une sécurité a été ajoutée dans le handler mais elle est pas super.
				eventHandler.linkEvent(SAVE,$scope.saveCalendarEvent);
	};
	
	//met à jour les couleurs du calendrier
	//Utilisé lors du chargement du calendrier qui doit colorer les évènements sélectionnés dans une autre page
	$scope.updateColors = function() {	
		//on parcourt les conférences sauvegardées
		for (var selectedConfIdex in $rootScope.savedConf)
		{
			//les évènements ont le meme id que les confs ce qui permet de retrouver l'évènement calendrier facilement
			$scope.events[selectedConfIdex].backgroundColor = '#26FF00'; // on applique la couleur à l'évènement sélectionné
			$scope.calendar.fullCalendar('updateEvent', $scope.events[selectedConfIdex]); //MAJ du calendrier
		}
	}

	//fonction permettant d'ajouter un évènement au calendrier
	$scope.addEvent = function(event){
		$scope.calendar.fullCalendar('renderEvent', makeEvent(event) ,'stick');
		};
	/****************************** fin calendar management *******************************/

}]);
/******************* fin controller *********************************/



/********************* TOOLS ***************************************/
//recherche si une occurence se trouve dans un tableau
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

//stristr à la PHP
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

//permet de savoir si une chaine decaractère contient une autre chaine sans tenir compte de la casse
function contains(haystack,needle) {
	return haystack.toLowerCase().indexOf((needle+'').toLowerCase()) > -1;
}

//configuration du calendar 
//TODO: l'externaliser dans un fichier de conf ?
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
						rootScope.$broadcast(SELECT, event.id);
					}
		});

		return config;
};

//fonction permettant de contruire un évènement à la sauce full calendar
function makeEvent(session,id) {
    	var newEvent = new Object();

    	//var time = session.get('timeSlot').split(' - ');
    	var eventDateStart = session.date_start;
    	var eventDateEnd = session.date_end;

    	newEvent.id = id;
    	newEvent.className = '';
		newEvent.title = session.name;
		newEvent.start = new Date(eventDateStart);
		newEvent.end = new Date(eventDateEnd);
		newEvent.allDay = false;

		return newEvent;
	};

//vérifie si une durée chevauche une autre
function checkDatesRangeOverlap(startA,endA,startB,endB) {
	return (new Date(startA).getTime() <= new Date(endB).getTime())  &&  (new Date(endA).getTime() >= new Date(startB).getTime());
}

//supprime une donnée d'un tableau
function unset(array, valueOrIndex){
    var output=[];
    for(var i in array){
        if (i!=valueOrIndex)
            output[i]=array[i];
    }
    return output;
}

function functionName(fun) {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}
/************************* fin TOOLS ***************************/