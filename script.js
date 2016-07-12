var INSTA_API_BASE_URL = "https://api.instagram.com/v1";
var app = angular.module('Instamood',[]);

app.controller('MainCtrl', function($scope, $http) {
 //  // get the access token if it exists
	$scope.hasToken = true;
	var token = window.location.hash;
	console.log(token);
  if (!token) {
    $scope.hasToken = false;
  }
  token = token.split("=")[1];

  $scope.getInstaPics = function() {
	  var path = "/users/self/media/recent";
	  var mediaUrl = INSTA_API_BASE_URL + path;
	  $http({
	    method: "JSONP",
	    url: mediaUrl,
	    params: {
	    	callback: "JSON_CALLBACK",
        // you need to add your access token here, as per the documentation
	    	access_token: token
	    }
	  }).then(function(response) {
	  	console.log(response);
    	$scope.picArray = response.data.data;
    // now analyze the sentiments and do some other analysis
    // on your images
    	for(var i=0; i<$scope.picArray.length; i++) {
    	    analyzeSentiments(i);
    	}
    	
    	// Ego score analysis: % of own pictures user liked
    	$scope.egoCounter = 0;
    	for(var i=0; i<$scope.picArray.length; i++) {
    		var pic = $scope.picArray[i];
    		if (pic.user_has_liked === true) {
    			egoCounter ++;
    		}
    	}
    	$scope.egoCounter = $scope.egoCounter/$scope.picArray.length;
    	
    	// Popularity analysis: avg # of likes per picture
    	$scope.popularity = 0;
    	for(var i=0; i<$scope.picArray.length; i++) {
    		var pic = $scope.picArray[i];
    		if (pic.likes.count >= 0) {
    			$scope.popularity = $scope.popularity + pic.likes.count/$scope.picArray.length;
    		}
    	}
    	// Active Days: Most common day of the week to 
    	// post a picture
    	var SundayCount = 0;
    	var MondayCount = 0;
    	var TuesdayCount = 0;
    	var WednesdayCount = 0;
    	var ThursdayCount = 0;
    	var FridayCount = 0;
    	var SaturdayCount = 0;
    	for(var i=0; i<$scope.picArray.length; i++) {
    		var pic = $scope.picArray[i];

    		var timestamp = $scope.picArray[i].created_time;
    		var a = new Date(timestamp*1000);
    		var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    		var dayOfWeek = days[a.getDay()];

    		if (dayOfWeek === 'Sunday') {
    			SundayCount = SundayCount + 1;
    		}
    		else if (dayOfWeek === 'Monday') {
    			MondayCount = MondayCount + 1;
    		}
    		else if (dayOfWeek === 'Tuesday') {
    			TuesdayCount = TuesdayCount + 1;
    		}
    		else if (dayOfWeek === 'Wednesday') {
    			WednesdayCount = WednesdayCount + 1;
    		}
    		else if (dayOfWeek === 'Thursday') {
    			ThursdayCount = ThursdayCount + 1;
    		}
    		else if (dayOfWeek === 'Friday') {
    			FridayCount = FridayCount + 1;
    		}
    		else if (dayOfWeek === 'Saturday') {
    			SaturdayCount = SaturdayCount + 1;
    		}
    	}
    	var weekArray = [SundayCount, MondayCount, TuesdayCount, WednesdayCount, ThursdayCount, FridayCount, SaturdayCount];
  		$scope.maxDay = weekArray[0];
  		for (var j=0; j<weekArray.length; j++) {
  			if (weekArray[j] > $scope.maxDay) {
  			 	$scope.maxDay = weekArray[j]; // so if weekArray is bigger than max, replace max
  			}
  		}
 
    	// Brevity: Average caption length
    	$scope.brevity = 0;
    	for(var i=0; i<$scope.picArray.length; i++) {
    		var pic = $scope.picArray[i];
    		$scope.brevity = pic.caption.text.length + $scope.brevity;
    	}

    	// Visibility Thirst: Avg # of hashtags per caption
    	$scope.visibilityThirst = 0;
    	for(var i=0; i<$scope.picArray.length; i++) {
    		var pic = $scope.picArray[i];
    		$scope.visibilityThirst = pic.tags.length + $scope.visibilityThirst;
    	}
    });
	};
	$scope.getInstaPics();


	$scope.avgPostivity = 0;
	var analyzeSentiments = function(imgIdx) {
    // when you call this function, $scope.picArray should have an array of all 
    // your instas. Use the sentiment analysis API to get a score of how positive your 
    // captions are
	    $http({
	    	method: "GET",
	    	url: "https://twinword-sentiment-analysis.p.mashape.com/analyze/",
	    	params: {
	    		text: $scope.picArray[imgIdx].caption.text,
	    	},
	    	headers: {
	    		"X-Mashape-Key": "YLCHFOZfglmshAfrlZ5JnST9TkbFp1hBYxJjsnGmmXMJJ7iPgk"
	    	}
	    }).then(function(response) {
	    	// store postivity back on the picture
	    	// since there is no score, create a score with value response.data.score
	    	$scope.picArray[imgIdx]["score"] = response.data.score;
	    	// update global positivity counter
	    	
	    });	
	};

});
