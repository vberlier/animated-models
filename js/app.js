
var app = angular.module('app', ['flow']);


app.controller('main', function($scope, $sce) {

  // modal stuff
  $scope.modal = {
    title: '',
    content: []
  }

  $scope.closeModal = function() {
    $scope.modal = {
      title: '',
      content: []
    }
  }

  $scope.modelsList = [];
  $scope.texturesList = [];

  // called when files are loaded
  $scope.load = function($flow) {

    var files = [];
    var errors = [];

    var models = {};
    var textures = {};

    // filter models and textures
    $flow.files.forEach(function(file, index) {

      var name = file.name;
      var len = name.length;

      if (name.toLowerCase().substr(len-5, len-1) == '.json') {
        models[name] = file;
        files.push(file);
      } else if (name.toLowerCase().substr(len-4, len-1) == '.png') {
        textures[name] = file;
        files.push(file);
      } else {
        errors.push('Can\'t load <strong>' + name + '</strong>, the file extension is invalid.')
      }

      $scope.modelsList = Object.keys(models);
      $scope.texturesList = Object.keys(textures);

    });

    $flow.files = files;

    // display errors
    if (errors.length > 0) {
      var modal = {
        title: 'An error occured while loading resources.',
        content: []
      };
      errors.forEach(function(msg) {
        modal.content.push($sce.trustAsHtml(msg));
      });
      $scope.modal = modal;
    }

  };

});
