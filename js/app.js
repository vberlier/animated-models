
var app = angular.module('app', ['flow']);


app.controller('main', function($scope, $sce) {

  // modal window object model
  $scope.modal = {
    title: 'Warning',
    content: []
  }

  // triggered by the 'Close' button
  $scope.closeModal = function() {
    // resets modal window properties
    $scope.modal = {
      title: 'Warning',
      content: []
    };
  }

  // errors model
  $scope.errors = {
    // internal error list
    list: [],
    // called when a new error occurs
    push: function(string) {

      // push the new error
      this.list.push(string);

      // override the modal content
      $scope.modal.content = this.list.map(function(msg) {return $sce.trustAsHtml(msg)});

    }
  };

  // loaded models filenames
  $scope.modelsList = [];
  // loaded textures filenames
  $scope.texturesList = [];

  // update global state when files are loaded
  $scope.load = function($flow) {

    // file array buffer
    var files = [];

    // result
    var models = {};
    var textures = {};

    // set modal title just in case
    $scope.modal.title = 'An error occured while loading resources.';
    $scope.errors.list = [];

    // only keep '.json' and '.png' extensions from $flow
    $flow.files.forEach(function(file, index) {

      var name = file.name;
      var len = name.length;

      if (name.toLowerCase().substr(len-5, len-1) == '.json') {
        // register model
        models[name] = file;
        files.push(file);
      } else if (name.toLowerCase().substr(len-4, len-1) == '.png') {
        // register texture
        textures[name] = file;
        files.push(file);
      } else {
        // the filename extension is invalid
        $scope.errors.push('Can\'t load <strong>' + name + '</strong>, the file extension is invalid.')
      }

    });

    // loaded files buffers
    var modelsList = Object.keys(models).sort(alphanum);
    var texturesList = Object.keys(textures).sort(alphanum);

    // the result after loading files
    var loaded = {
      models: [],
      textures: []
    }

    // load models
    modelsList.forEach(function(modelName) {

      // get the corresponding file
      var model = models[modelName];
      var file = model.file;

      // prepare to read a file
      var reader = new FileReader();

      // when the reader is loaded
      reader.onload = function(event) {
        try {
          // try to parse the json model and add it to the loaded variable
          var result = JSON.parse(this.result);
          loaded.models.push({
            name: modelName,
            data: result
          });
        } catch (e) {
          // if there's an error, remove the file from the selection and it's name from the models list
          $flow.files = $flow.files.filter(function(file) {
            return file.name != modelName;
          });
          $scope.modelsList = $scope.modelsList.filter(function(name){
            return name != modelName;
          });
          // if that's a SyntaxError then it's because of an error in the json
          if (e instanceof SyntaxError) {
            // push a new error with the details (which are browser specific)
            $scope.errors.push('Can\'t load model <strong>' + modelName + '</strong>, json parsing failed. ' + e.message.trim().split(' in JSON ').join(' ') + '.');
          } else {
            // throw the exception if it's anything else
            throw e;
          }
        }
      }

      // read the model
      reader.readAsText(file);

    });

    // load textures
    texturesList.forEach(function(textureName) {

      // get the corresponding file
      var texture = textures[textureName];
      var file = texture.file;

      // prepare to read a file
      var reader = new FileReader();

      // when the reader is loaded
      reader.onload = function(event) {
        // add the image to the loaded variable
        loaded.textures.push({
          name: textureName,
          data: this.result
        })
      }

      // read the image
      reader.readAsDataURL(file);

    });

    console.log(loaded);

    // update filenames list models
    $scope.modelsList = modelsList;
    $scope.texturesList = texturesList;

    // update file selection
    $flow.files = files;

  };

  // remove files
  $scope.remove = function(name, $flow) {
    // filter the file selection
    $flow.files = $flow.files.filter(function(file) {
      return file.name != name;
    });
    // reload the view
    $scope.load($flow);
  }

});
