'use strict';

/* jasmine specs for controllers go here */
describe('PhoneCat controllers', function() {

  describe('PhoneListCtrl', function(){
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/phones.json').
          respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);

      scope = $rootScope.$new();
      ctrl = $controller(PhoneListCtrl, {$scope: scope});

    }));


    it('should create "phones" model with 2 phones fetched from xhr', function() {
      expect(scope.phones).toBeUndefined();
      $httpBackend.flush();

      expect(scope.phones).toEqual([{name: 'Nexus S'},
                                   {name: 'Motorola DROID'}]);
    });


    it('should set the default value of orderProp model', function() {
      expect(scope.orderProp).toBe('age');
    });
	
	
  
  });
 /** describe('MyController', function(){
    var scope, ctrl, $httpBackend;
	
	// load the relevant application modules then load a special
  // test module which overrides the $window with a mock version,
  // so that calling window.alert() will not block the test
  // runner with a real alert box. This is an example of overriding
  // configuration information in tests.
	  beforeEach(module(function($provide) {
		$provide.value('$window', {
		  alert: jasmine.createSpy('alert')
		});
	  }));
  
	it('should alert on $window', inject(function(greeter, $window) {
    greeter.greet('Hello World');
    expect($window.alert).toHaveBeenCalledWith('Hello World');
  }));
	});**/
});
