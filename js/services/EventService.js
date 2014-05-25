planningPHPTourApp.service('eventHandler', function($rootScope) {

		var mapFnEvent = new Array();
		this.SELECT = "select";
		
		this.fireEvent = function(eventId,msg) {
			//console.log('fire: ' + eventId + " msg:" +msg);
			$rootScope.$broadcast(eventId, msg);
		};
		
		
		this.linkEvent = function(eventId,fn) {
			
			//if(!inArray(encodeURIComponent(fn.toString()),mapFnEvent))
			//{
				//s�curit� pour avoir une string unique par fonction
				//TODO: fait � la va vite, � utiliser si pas le choix mais clairement pas optimis�
				//[MAj] semble plus n�cessaire utilis�]
				//mapFnEvent.push(encodeURIComponent(fn.toString()));
				$rootScope.$on(eventId, function(event, msg) {
						if(typeof(fn) === "function")
							fn(msg);
						//console.log('received: ' + eventId + " msg:" +msg);
				});
			//}
		};

});

//recherche si une occurence se trouve dans un tableau
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}