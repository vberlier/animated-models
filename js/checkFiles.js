

function checkModel(model) {

  var errors = []

  var hasElements = true
  var hasTextures = true

  if (!model.hasOwnProperty('elements')) {
    errors.push('Couldn\'t find the "elements" property.')
    hasElements = false
  }
  if (hasElements && model.elements.length < 1) {
    errors.push('Couldn\'t find any element.')
    hasElements = false
  }
  if (!model.hasOwnProperty('textures')) {
    errors.push('Couldn\'t find the "textures" property.')
    hasTextures = false
  }
  if (hasTextures && Object.keys(model.textures).length < 1) {
    errors.push('Couldn\'t find any texture in the "textures" property.')
    hasTextures = false
  }

  if (hasElements) {

    for (var index = 0; index < model.elements.length; index++) {

      var element = model.elements[index]

      var hasFrom = true
      var hasTo = true
      var hasRotation = false
      var hasFaces = true

      if (!element.hasOwnProperty('from')) {
        errors.push('Couldn\'t find the "from" property in element "' + index + '".')
        hasFrom = false
      }
      if (hasFrom && element['from'].length != 3) {
        errors.push('The "from" property in element "' + index + '" is invalid.')
        hasFrom = false
      }

      if (!element.hasOwnProperty('to')) {
        errors.push('Couldn\'t find the "to" property in element "' + index + '".')
        hasTo = false
      }
      if (hasTo && element['to'].length != 3) {
        errors.push('The "to" property in element "' + index + '" is invalid.')
        hasTo = false
      }

      for (var i = 0; i < 3; i++) {
        var coord = ['x', 'y', 'z'][i]
        var f = 0
        var t = 0
        if (hasFrom)
          f = element['from'][i]
        if (hasTo)
          t = element['to'][i]
        if (hasFrom && hasTo && f > t)
          errors.push('The "from" property is bigger than the "to" property for coordinate "' + coord + '" in element "' + index + '".')
        if (hasFrom && f < -16)
          errors.push('The "from" property is smaller than -16 for coordinate "' + coord + '" in element "' + index + '".')
        if (hasTo && t < -16)
          errors.push('The "to" property is smaller than -16 for coordinate "' + coord + '" in element "' + index + '".')
        if (hasFrom && f > 32)
          errors.push('The "from" property is bigger than 32 for coordinate "' + coord + '" in element "' + index + '".')
        if (hasTo && t > 32)
          errors.push('The "to" property is bigger than 32 for coordinate "' + coord + '" in element "' + index + '".')
      } // from to

      if (element.hasOwnProperty('rotation')) {

        hasRotation = true

        var rot = element.rotation

        var hasOrigin = true
        var hasAxis = true
        var hasAngle = true

        if (!rot.hasOwnProperty('origin')) {
          errors.push('Couldn\'t find the "origin" property in "rotation" for element "' + index + '".')
          hasOrigin = false
        }
        if (hasOrigin && rot.origin.length != 3) {
          errors.push('The "origin" property in "rotation" for element "' + index + '" is invalid.')
          hasOrigin = false
        }

        if (!rot.hasOwnProperty('axis')) {
          errors.push('Couldn\'t find the "axis" property in "rotation" for element "' + index + '".')
          hasAxis = false
        }
        if (hasAxis && ['x', 'y', 'z'].indexOf(rot.axis) == -1) {
          errors.push('The "axis" property in "rotation" for element "' + index + '" is invalid.')
          hasAxis = false
        }

        if (!rot.hasOwnProperty('angle')) {
          errors.push('Couldn\'t find the "angle" property in "rotation" for element "' + index + '".')
          hasAngle = false
        }
        if (hasAngle && [-45, -22.5, 0, 22.5, 45].indexOf(rot.angle) == -1) {
          errors.push('The "angle" property in "rotation" for element "' + index + '" is invalid.')
          hasAngle = false
        }

        if (hasOrigin) {
          for (var i = 0; i < 3; i++) {
            var coord = ['x', 'y', 'z'][i]
            var o = rot.origin
            if (o < -16)
              errors.push('The "origin" property is smaller than -16 for coordinate "' + coord + '" in "rotation" for element "' + index + '".')
            if (o > 32)
              errors.push('The "origin" property is bigger than 32 for coordinate "' + coord + '" in "rotation" for element "' + index + '".')
          }
        }

      } // rotation

      if (!element.hasOwnProperty('faces'))
        hasFaces = false
      if (hasFaces && Object.keys(element.faces).length < 1)
        hasFaces = false

      if (hasFaces) {

        for (var i = 0; i < 6; i++) {

          var side = ['north', 'east', 'south', 'west', 'up', 'down'][i]

          if (element.faces.hasOwnProperty(side)) {

            var face = element.faces[side]

            var hasTex = true
            var hasUv = true
            var hasRot = false

            if (!face.hasOwnProperty('texture')) {
              errors.push('Couldn\'t find the "texture" property for face "' + side + '" in element "' + index + '".')
              hasTex = false
            }
            if (hasTex && (typeof face.texture != 'string' || face.texture.charAt(0) != '#' || face.texture.length < 2)) {
              errors.push('The "texture" property for face "' + side + '" in element "' + index + '" is invalid.')
              hasTex = false
            }

            if (hasTextures && hasTex) {
              var texturename = face.texture.substr(1)

              if (Object.keys(model.textures).indexOf(texturename) == -1) {
                errors.push('The texture name for face "' + side + '" in element "' + index + '" doesn\'t match any texture in the model\'s texture reference.')
                hasTex = false
              }
            }

            if (!face.hasOwnProperty('uv')) {
              errors.push('Couldn\'t find the "uv" property for face "' + side + '" in element "' + index + '".')
              hasUv = false
            }
            if (hasUv && face.uv.length != 4) {
              errors.push('The "uv" property for face "' + side + '" in element "' + index + '" is invalid.')
            }

            if (hasUv) {

              for (var j = 0; j < 4; j++) {
                var uvc = face.uv[j]
                if (uvc < 0)
                  errors.push('The "uv" property is smaller than 0 at index "' + j + '" for face "' + side + '" in element "' + index + '".')
                if (uvc > 16)
                  errors.push('The "uv" property is bigger than 16 at index "' + j + '" for face "' + side + '" in element "' + index + '".')
              }

            }

            if (face.hasOwnProperty('rotation')) {

              hasRot = true

              if ([0, 90, 180, 270].indexOf(face.rotation) == -1) {
                errors.push('The "rotation" property in face "' + side + '" for element "' + index + '" is invalid.')
              }

            }

          }

        }

      } // faces

    }

  } // elements

  return errors

}



function checkTexture(img) {

  var errors = []

  var width = img.width
  var height = img.height

  if (width && (width & (width - 1)) !== 0)
    errors.push('Texture width is not a power of 2.')
  if (height && (height & (height - 1)) !== 0)
    errors.push('Texture height is not a power of 2.')

  if (height != width)
    errors.push('Texture isn\'t a square, width and height are different.')

  return errors

}



function checkContext(models, textures) {

  var modelList = Object.keys(models)
  var textureList = Object.keys(textures)

  for (var i = 0; i < textureList.length; i++) {

    var name = textureList[i]
    var texture = textures[name]

    texture.contextErrors = []
    texture.used = false

  }

  for (var i = 0; i < modelList.length; i++) {

    var name = modelList[i]
    var model = models[name]

    model.contextErrors = []

    if (model.data.hasOwnProperty('textures')) {
      var modeltextures = Object.keys(model.data.textures)
      for (var j = 0; j < modeltextures.length; j++) {

        var textureReference = modeltextures[j]
        var tmp = model.data.textures[textureReference].split('/')
        var texturename = tmp[tmp.length-1] + '.png'

        if (textureList.indexOf(texturename) == -1) {
          model.contextErrors.push('Couldn\'t find texture "' + texturename + '".')
        } else {

          var texture = textures[texturename]
          texture.used = true

          if (texture.errors.length > 0 || texture.contextErrors.length > 0) {
            model.contextErrors.push('Couldn\'t load texture "' + texturename + '", the texture is invalid.')
          }

        }

      }
    }

  }

  for (var i = 0; i < textureList.length; i++) {

    var name = textureList[i]
    var texture = textures[name]

    if (!texture.used) {
      texture.contextErrors.push('The texture isn\'t used by any model.')
    }

  }

}
