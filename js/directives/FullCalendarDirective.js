planningPHPTourApp.directive('fullcalendar', ['fullCalendarService','eventHandler',function(fullCalendarService,eventHandler) {
    return {
        restrict: 'E',
        template: '<div id="calendar"></div>',
        scope: { confs: '=confs' ,selected :'=selected' ,saved_confs : '=saved_confs'},
        link: function (scope, el, attrs) {
            var config = {
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
                slotEventOverlap: false,
                h: 2500,
                timeFormat: 'H:mm',
                columnFormat: {
                    week: 'dddd dd MMMM'
                },
                axisFormat: 'HH:mm',
                dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
                dayNamesShort: ['Dim','Lun','Mar','Mer','Jeu','Thu','Ven','Sam'],
                monthNames : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
                eventClick: function(event, jsEvent, view) {
					
					//modification de la classe de l'évènement via le service calendar

					if(event.className != fullCalendarService.SAVED_CLASS && event.className != fullCalendarService.CONFLICT_CLASS)
					{
						fullCalendarService.changeClassEvent(scope.selected,'');
						if(event.id != scope.selected)
							fullCalendarService.changeClassEvent(event.id,fullCalendarService.SELECTED_CLASS);
					}	
					//utilisation des events permet de decoupler le controlleur du fonctionnement de la vue
					//le controlleur n'a pas a connaitre comment la vue est contruite dans la mesure du possible
					//c'est a la vue de définir un fonctionnement en fonction des données du controlleur	
					eventHandler.fireEvent(eventHandler.SELECT,event.id);
                },
                eventRender: function(event, element) {
                },
                viewDisplay: function(calendarView) {
                    calendarView.setHeight(9999);
                }
            };

            angular.element('#calendar').fullCalendar(config);

            }
    }
}]);
