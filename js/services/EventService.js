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
				//sécurité pour avoir une string unique par fonction
				//TODO: fait à la va vite, à utiliser si pas le choix mais clairement pas optimisé
				//[MAj] semble plus nécessaire utilisé]
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