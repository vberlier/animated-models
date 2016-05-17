
// base error
function ModelStructureError(message) {
  this.message = message;
  this.name = 'ModelStructureError';
}

// checks if a model is correctly structured
function checkModelStructure(model) {

  // holds all potential errors
  var errors = [];

  // global model structure
  if (!model.hasOwnProperty('elements')) {
    errors.push('Missing "elements" tag');
  }
  if (!model.hasOwnProperty('textures')) {
    errors.push('Missing "textures" tag');
  }

  // if errors have been detected, throw the ModelStructureError
  if (errors.length) {
    throw new ModelStructureError(errors.join(' | '));
  }

  if (!(model.elements instanceof Array)) {
    errors.push('The "elements" tag should be an array');
  }
  if (Object.prototype.toString.call(model.textures) != '[object Object]') {
    errors.push('The "textures" tag should be an object');
  }

  if (errors.length) {
    throw new ModelStructureError(errors.join(' | '));
  }

  // tracks the element index
  var count = 0;

  // test all elements
  model.elements.forEach(function(element) {

    // increment index
    count++;

    // test for x, y, and z "from" and "to" coordinates
    for (var i = 0; i < 3; i++) {
      // which coordinate is being checked
      var coord = ['x', 'y', 'z'][i]

      // from and to coordinates
      var begin = element.from[i];
      var end = element.to[i];

      // tests below

      if (begin > end) {
        errors.push('Element <strong>' + count + '</strong>, the <strong>' + coord + '</strong> "from" coordinate (<strong>' + begin + '</strong>) is bigger than the "to" coordinate (<strong>' + end + '</strong>)')
      }

      if (begin < -16) {
        errors.push('Element <strong>' + count + '</strong>, the <strong>' + coord + '</strong> "from" coordinate (<strong>' + begin + '</strong>) is below the <strong>-16</strong> pixels limit')
      }

      if (end > 32) {
        errors.push('Element <strong>' + count + '</strong>, the <strong>' + coord + '</strong> "to" coordinate (<strong>' + end + '</strong>) is over the <strong>+32</strong> pixels limit')
      }

    }

    // test textures
    if (element.hasOwnProperty('faces')) {

      for (var side in element.faces) {

        var face = element.faces[side];
        var texture = face.texture;

        if (!model.textures.hasOwnProperty(texture.substring(1))) {
          errors.push('Element <strong>' + count + '</strong>, the texture reference is invalid (<strong>' + texture + '</strong>) for face <strong>' + side + '</strong>')
        }
      }

    }

  });

  // if errors have been detected, throw the ModelStructureError
  if (errors.length) {
    throw new ModelStructureError(errors.join(' | '));
  }

  // return the model
  return model;

}
