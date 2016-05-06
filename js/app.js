
var app = angular.module('app', ['flow']);

app.controller('main', function($scope) {

  $scope.load = function($flow) {

    files = $flow.files;

    $scope.models = {};
    $scope.textures = {};

    $flow.files = files.filter(function(value){
      return value.name.toLowerCase().endsWith('.json') || value.name.toLowerCase().endsWith('.png')
    });

    files = $flow.files;

    $flow.files = files.sort(function(a, b) {
      var a = a.name;
      var b = b.name;
      if ((a.toLowerCase().endsWith('.json') && b.toLowerCase().endsWith('.json')) || (a.toLowerCase().endsWith('.png') && b.toLowerCase().endsWith('.png'))) {
        return [a, b].sort()[0] == a ? -1 : 1;
      } else {
        return a.toLowerCase().endsWith('.json') ? -1 : 1;
      }
    });

    files = $flow.files;

  };

});
