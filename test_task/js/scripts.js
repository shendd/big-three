var app = angular.module('testTask', []);

app.controller('MainCtrl', function($scope) {
	$scope.$on("CasesShowChange", function(event, msg) {		
		$scope.$broadcast("CasesShowChangeFromMain", msg);
	});
	$scope.$on("HistShowChange", function(event, msg) {
		$scope.$broadcast("HistShowChangeFromMain", msg);
	});
	$scope.$on("OutputShowChange", function(event, msg) {
		$scope.$broadcast("OutputShowChangeFromMain", msg);
	});
	$scope.$on("ResultChange", function(event, msg) {
		$scope.$broadcast("ResultChangeFromMain", msg);
	});

}).controller('CloudCtrl', function($scope) {
	var cloudChange = function() {
		$modal.modal('hide');
		$('#cloud_container').hide();
		$('#right_png').removeClass('blur');
		$('#cases_nav').removeClass('todo').addClass('finished');
	};

	$scope.searchCases = function() {
		cloudChange();
		$scope.$emit("CasesShowChange", 1);
	};

}).controller('CasesCtrl', function($http, $scope) {
	$scope.$on("CasesShowChangeFromMain", function(event, msg) {	
		$scope.casesShow = msg;
	});	
	// get(url) url: route for .json file
	$http.get('json/cases2.json').success(function(data) {
		$scope.cases = data;
	}).error(function() {
		console.log('a $http request error occurred.');
	});

	var selectedList = [];

	$scope.updateSelectedList = function($event) {
		var ifChecked = $event.target.checked ? true: false;
		var caseName = $event.target.id;
		if (ifChecked) {
			selectedList.push(caseName);
		} else {
			var idx = selectedList.indexOf(caseName);
			selectedList.splice(idx, 1);
		}
	};

	$scope.showSelectedList = function() {
		var date = new Date();
		var time = date.toLocaleString();
		for (var i = 1; i <= selectedList.length; i++) {
			$('#number' + i).html(i);
			$('#case' + i).html(selectedList[i - 1]);
			$('#status').html('running');
			$('#time' + i).html(time);
			$('#check' + i).html('check');
		}
	};

	var postData = {
		cmd: 'start',
		opts: {},
		args: selectedList
	}

	var casesChange = function() {
		$('#cases_container').hide();
		$('#run_png').removeClass('blur');
		$('#run_nav').removeClass('todo').addClass('finished');
	};

	$scope.submit = function() {
		casesChange();
		$scope.$emit("HistShowChange", 1);

		console.log('data:' + postData['cmd'] + postData['args'])
		
		$http.post('http://192.168.23.2:8888/api/v3/yardstick/tasks/task', postData).success(function(result) {
			console.log(result['task_id'])
			url = 'http://192.168.23.2:8888/api/v3/yardstick/testresults?task_id='+result['task_id']+'&measurement='+postData['args'][0];
			// global variable
		}).error(function() {
			console.log('post error.');
		});	
		
	};

}).controller('HistoryCtrl', function($scope, $http) {
	$scope.$on("HistShowChangeFromMain", function(event, msg) {
		$scope.histShow = msg;
	});

	var timer1 = setInterval(function() {
		if($scope.histShow) {
			//update the status
			$http.get(url).success(function(data)
			{
				if(data['status']==1)
				{
					$('#status').html('finished');
				}
				else if(data['status']==2)
				{
					$('#status').html('error');
				}
			}).error(function() {
				console.log('a $http request error occurred.');
			});
		}
	}, 20000);

	$scope.check = function(){
		$('#history_container').hide();
		$('#output_png').removeClass('blur');
		$('#output_nav').removeClass('todo').addClass('finished');
		$scope.$emit("OutputShowChange", 1);

		$http.get(url).success(function(data) {
			$scope.jsonResult = data.result.results[0].series[0];
			$scope.$emit("ResultChange", $scope.jsonResult);
		}).error(function() {
			console.log('a $http request error occurred.');
		});
	};

}).controller('OutputCtrl', function($scope) {
	$scope.$on("OutputShowChangeFromMain", function(event, msg) {
		$scope.outputShow = msg;
	});
	$scope.$on("ResultChangeFromMain", function(event, msg) {
		$scope.result = msg;
	});

});
