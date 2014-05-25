planningPHPTourApp.service('fullCalendarService', function(){
    this.changeClassEvent = function(id, className){
        var calendar = angular.element('#calendar');
        var confEvent = calendar.fullCalendar('clientEvents', id)[0];
        confEvent.className = className;
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
});