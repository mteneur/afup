planningPHPTourApp.service('fullCalendarService', function(){
	this.SAVED_CLASS = 'savedEvent';
	this.SELECTED_CLASS = 'calendarSelect';
	this.CONFLICT_CLASS = 'conflictEvent';
	
    this.changeClassEvent = function(id, className){
        var calendar = angular.element('#calendar');
        var confEvent = calendar.fullCalendar('clientEvents', id)[0];
        var currentClass = confEvent.className;
        confEvent.className = className;
        
        if (currentClass.lastIndexOf("filtredEvent") != -1) {
            confEvent.className += " filtredEvent";
        }

        calendar.fullCalendar('updateEvent', confEvent);
    };
	
	var makeEvent = function(conf) {
                var newEvent = new Object();
                var eventDateStart = conf.date_start;
                var eventDateEnd = conf.date_end;

                newEvent.id = conf.id;
                newEvent.className = '';
                newEvent.title = conf.name;
                newEvent.start = new Date(eventDateStart);
                newEvent.end = new Date(eventDateEnd);
                newEvent.allDay = false;

                return newEvent;
            };
			
	this.init = function(confs) {
			var calendarEvents = [];
			angular.forEach(confs, function(conf, key) {
                    calendarEvents.push(makeEvent(conf));
					
                }); 
			angular.element('#calendar').fullCalendar('addEventSource', calendarEvents ,'stick');
	};


	//ca me semble faire des choses compliquées..
    this.filtredEvent = function(id, isFiltred) {
        var calendar = angular.element('#calendar');
        var confEvent = calendar.fullCalendar('clientEvents', id)[0];

        if(confEvent != undefined) {
            if(typeof confEvent.className !== 'string') {
                confEvent.className = '';
            }

            if (isFiltred) {
                confEvent.className += " filtredEvent";
            } else {
                confEvent.className = confEvent.className.replace(" filtredEvent", ""); 
            }

            calendar.fullCalendar('updateEvent', confEvent);
        }
    }

});