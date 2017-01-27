var app = angular.module('myapp',["ngRoute"]);
var user_list = [];
if(localStorage.user_list) {
	user_list  = JSON.parse(localStorage.getItem('user_list'));
}
var current_user = {};
if(localStorage.current_user) {
	current_user  = JSON.parse(localStorage.getItem('current_user'));
}
var current_id = -1;
if(localStorage.current_id) {
	current_id  = localStorage.getItem('current_id');
}
var message = [];
if(localStorage.message) {
	message  = JSON.parse(localStorage.getItem('message'));
}
app.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl : 'login.html'
	})
	.when('/register', {
		templateUrl : 'register.html'
	})
	.when('/login', {
		templateUrl : 'login.html'
	})
	.when('/profile', {
		templateUrl : 'profile.html'
	})
	.when('/home', {
		templateUrl : 'home.html'
	})
	.when('/logout', {
		templateUrl : 'login.html',
		controller : 'logoutCtrl'
	})
	.when('/message', {
		templateUrl : 'message.html'
	})
	.when('/message_detail/:id', {
		templateUrl : 'message_detail.html'
	})
	.otherwise({
		redirectTo:'/login'
	})
});

app.service('validate', function(){
	this.is_user_exist = function(username) {
		var len = user_list.length;
		for(var i=0;i<len;i++) {
			if(user_list[i].username == username) {
				return true;
			}
		}
		return false;
	}
	this.login_validate = function(username,password) {
		var len = user_list.length;
		for(var i=0;i<len;i++) {
			if(user_list[i].username == username && user_list[i].password == password) {
				current_user = user_list[i];
				current_id = user_list[i].id;
				return true;
			}
		}
		return false;
	}
});

app.service('user',function() {
	this.newuser = function(username,password,firstname,lastname,email,phone,location) {
		var u = {};
		u.username = username;
		u.password = password;
		u.firstname = firstname;
		u.lastname = lastname;
		u.email = email;
		u.phone = phone;
		u.location = location;
		return u;
	}
	this.getUserIndexbyId = function(id) {
		var len = user_list.length;
		for(var i=0;i<len;i++) {
			if(user_list[i].id==id) {
				return i;
			}
		}
	}
});
app.service("messages",function(){ 
	this.newmessage = function(id,recipient,sender,title,description,created_at,important){
		var m = {};
		m.id = id;
		m.recipient = recipient;
		m.recipient_img = "http://simpleicon.com/wp-content/uploads/user1.png";
		m.sender = sender;
		m.sender_img = "http://simpleicon.com/wp-content/uploads/user1.png";
		m.title = title;
		m.description = description;
		m.created_at = created_at;
		m.important = important;
		return m;
	}
	this.getMessagebyId = function(id) {
		var len = message.length;
		for (var i=0;i<len;i++) {
			if (message[i].id == id){
				return message[i];
			}
		}
	}
});

app.controller('registerCtrl',['$scope','$location','validate','user',function($scope,$location,validate,user) {
	$scope.register = function() {
		if(user_list.length>0) {
			if(validate.is_user_exist($scope.username)) {
				//user exist
				alert('username already exist');
				return;
			}
		}
		var u = user.newuser($scope.username,$scope.password,$scope.firstname,$scope.lastname,$scope.email,$scope.phone,$scope.location);
		user_list.push(u);
		localStorage.setItem('user_list',JSON.stringify(user_list));
		$location.path('/login');
	}
}]);

app.controller('loginCtrl',['$scope','$location','validate',function($scope,$location,validate) {
	if(current_id!=-1) {
		$location.path('/home');
	}
	$scope.login = function() {
		if(validate.login_validate($scope.username,$scope.password)) {
			localStorage.setItem('current_user',JSON.stringify(current_user));
			localStorage.setItem('current_id',current_id);
			$location.path("/home");
		}
		else {
			alert('username or password is invalid');
			//return;
		}
	}
}]);

app.controller('profileCtrl',['$scope','validate','user',function($scope,validate,user) {
	console.log(current_user);
	$scope.username = current_user.username;
	$scope.password = current_user.password;
	$scope.firstname = current_user.firstname;
	$scope.lastname = current_user.lastname;
	$scope.email = current_user.email;
	$scope.phone = current_user.phone;
	$scope.location = current_user.location;
	$scope.update = function () {
		if(validate.is_user_exist($scope.username) && $scope.username!=current_user.username) {
			alert('username already exist');
		}
		else {
			var u = user.newuser($scope.username,$scope.password,$scope.firstname,$scope.lastname,$scope.email,$scope.phone,$scope.location);
			user_list[user.getUserIndexbyId(current_id)]=u;
			current_user = u;
			localStorage.setItem('current_user',JSON.stringify(current_user));
			localStorage.setItem('user_list',JSON.stringify(user_list));
			alert('updated');
		}
	}
}]);

app.controller('homeCtrl',['$scope',function($scope) {
	//console.log(current_user.firstname);
	$scope.firstname = current_user.firstname;
	$scope.lastname = current_user.lastname;
}]);

app.controller('logoutCtrl',['$location', function($location){
	localStorage.removeItem('current_user');
	localStorage.removeItem('current_id');
	current_id = -1;
	current_user = {};
	$location.path('/login');
}]);

app.controller('messageCtrl',['$scope','$http','$location',function($scope,$http,$location){
	$scope.firstname = current_user.firstname;
	$scope.lastname = current_user.lastname;
	if(message.length==0) {
		$http.get('message.json')
		.then(function(response) {
			console.log(response);
			localStorage.message = JSON.stringify(response.data);
			$scope.message = response.data;
		});
	}
	else {
		$scope.message = message;
	}
}]);

app.controller('message_detailCtrl',['$scope','$routeParams','$location','messages','$filter',function($scope,$routeParams,$location,messages,$filter) {
	var recipient_id = $routeParams.id;
	var recipient_message = messages.getMessagebyId(recipient_id);
	console.log(recipient_id);
	console.log(recipient_message);
	$scope.m = recipient_message;
	$scope.delete =function() {
		message.splice(recipient_id,1);
		localStorage.message = JSON.stringify(message);
		$location.path('/message');
	}
	$scope.back = function () {
		$location.path('/message');
	}
	$scope.reply = function() {
		var recipient = recipient_message.recipient;
		var id = message[message.length-1].id+1;
		var sender = current_user.username;
		var created_at = $filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss');
		var msg = messages.newmessage(id,recipient,sender,$scope.title,$scope.description,created_at,$scope.important);
		message.push(msg);
		localStorage.message = JSON.stringify(message);
		$location.path('/message');
	}
}]);


