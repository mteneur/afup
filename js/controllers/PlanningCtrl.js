planningPHPTourApp.controller('planningCtrl', ['$scope','$http', function($scope, $http) {
 	//Titre de la page
 	$scope.title = "PHP Tour 2014 : Sessions";

    //Titre des vues
    $scope.viewTitle = {"session":"Sessions", "calendar":"Agenda", "split":"Split View"}

	//Liste des filtres
	$scope.filters = {"conferenciers":"conferenciers"};

    //filtre de recherche
    $scope.search = new Array();

    //Conf selectionnées
    $scope.selectedConf = [];

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
            var conferenciers = conf['conferenciers'];
            for(var key in conferenciers){
                $scope['conferenciers'].push(conferenciers[key]);
            }
        });
	});

    //fonction utilisée par le filtre permettant de rechercher dans le titre OU dans le résumé un mot   
    $scope.byAll = function(conf){
        var salle = (typeof $scope.search.salle === 'undefined') ? 1 : contains(conf.salle,$scope.search.salle);
        var lang = (typeof $scope.search.lang === 'undefined') ? 1 : contains(conf.lang,$scope.search.lang);
        var free = (typeof $scope.search.query === 'undefined') ? 1 : (contains(conf.detail,$scope.search.query) || contains(conf.name,$scope.search.query));
        return  ( salle && lang && free);
    };

    $scope.toggleSession = function(conf, $event){
        
        $scope.selectedConf.push(conf);
        console.log($scope.selectedConf);
        var el = $event.target;        
        toggleButton(angular.element(el), 'add');


    }
}]);

/**
 * Toogle du bouton
 * @param  domObject el    Elément
 * @param  string    state Etat du bouton
 */
function toggleButton(el, state)
{
    var addClass = 'btn-primary';
    var removeClass = 'btn-danger';
    var text = 'Je participe !';

    if(state == 'add') {
        var tmpClass = addClass;
        addClass = removeClass;
        removeClass = tmpClass;
        text = 'Je ne participe plus.';
    }

    el.removeClass(removeClass)
    el.addClass(addClass)
    el.html(text);
}

/**
 * Permet de savoir si une chaine decaractère contient une autre chaine sans tenir compte de la casse
 * @param  string haystack  Stack complète
 * @param  string needle    Chaine à trouver
 * @return bool             Chaine trouvée
 */
function contains(haystack,needle) {
    return haystack.toLowerCase().indexOf((needle+'').toLowerCase()) > -1;
}