
var modal = {

  show: function() {

    $('#overlay').removeClass('hidden')
    modal.reset()

  },

  hide: function() {

    $('#overlay').addClass('hidden')
    modal.reset()

  },

  reset: function() {

    models = {}
    textures = {}
    mcmetas = {}
    $('.modal-file-list-element').remove()

  },

  load: function(files) {

    for (var i = 0; i < files.length; i++) {

      var file = files[i]

      ;(function(file) {

        var name = file.name

        var type
        if (name.match(/\.json$/))
          type = 'model'
        else if (name.match(/\.png$/))
          type = 'texture'
        else if (name.match(/\.png\.mcmeta$/))
          type = 'mcmeta'

        var reader = new FileReader()
        reader.onload = function(event) {

          var result = event.target.result

          if (type == 'model') {

            var model
            try {
              model = JSON.parse(result)
              models[name] = {
                errors: checkModel(model),
                parsed: true,
                contextErrors: [],
                data: model,
                raw: result
              }
            } catch (e) {
              models[name] = {
                errors: ["Couldn't parse model. " + e.message + "."],
                parsed: false,
                contextErrors: [],
                data: {},
                raw: result
              }
            }

          } else if (type == 'texture') {

            var img = new Image()
            img.src = result
            textures[name] = {
              errors: checkTexture(img),
              used: false,
              contextErrors: [],
              data: img,
              raw: result
            }

          } else if (type == 'mcmeta') {

            var mcmeta
            try {
              mcmeta = JSON.parse(result)
              mcmetas[name] = {
                errors: checkMcmeta(mcmeta),
                parsed: true,
                contextErrors: [],
                data: mcmeta,
                raw: result
              }
            } catch (e) {
              mcmetas[name] = {
                errors: ["Couldn't parse mcmeta. " + e.message + "."],
                parsed: false,
                contextErrors: [],
                data: {},
                raw: result
              }
            }

          }

          checkContext(models, textures, mcmetas)
          displayFileList(models, textures, mcmetas)

        }

        if (type == 'model')
          reader.readAsText(file)
        else if (type == 'texture')
          reader.readAsDataURL(file)
        else if (type == 'mcmeta')
          reader.readAsText(file)

      })(file)

    }

  },


}



function displayFileList(models, textures, mcmetas) {

  var modelList = Object.keys(models).sort(alphanum)
  var textureList = Object.keys(textures).sort(alphanum)
  var mcmetaList = Object.keys(mcmetas).sort(alphanum)

  var fileList = $('#modal-input-file-list')
  fileList.html('')

  for (var i = 0; i < modelList.length; i++) {

    var name = modelList[i]
    var model = models[name]

    var element = createListElement('model', model, name)
    fileList.append(element)

  }

  for (var i = 0; i < textureList.length; i++) {

    var name = textureList[i]
    var texture = textures[name]

    var element = createListElement('texture', texture, name)
    fileList.append(element)

  }

  for (var i = 0; i < mcmetaList.length; i++) {

    var name = mcmetaList[i]
    var mcmeta = mcmetas[name]

    var element = createListElement('mcmeta', mcmeta, name)
    fileList.append(element)

  }

}



function createListElement(type, file, name) {

  var icons = {
    'model': '<svg class="basic"><use xlink:href="#svg-square"></svg>',
    'texture': '<svg class="basic"><use xlink:href="#svg-image"></svg>',
    'mcmeta': '<svg class="basic"><use xlink:href="#svg-texture"></svg>'
  }

  var icon = icons[type]

  var total = file.errors.length + file.contextErrors.length

  var html = '<div class="modal-file-list-element'
  if (total > 0)
    html += ' with-problem">'
  else
    html += '">'

  html += '<div class="modal-list-left">' + icon + ' ' + name + '</div>'

  html += '<div class="modal-list-right">'
  if (total > 0) {
    html += '<span class="red">' + (total > 1 ? total + ' errors' : '1 error') +  '<svg><use xlink:href="#svg-dropdown"></svg></span>'
  } else {
    html += '<span class="green">Loaded</span>'
  }
  html += '</div>'

  html += '<div class="modal-list-delete"><a class="basic" title="Remove File"><svg><use xlink:href="#svg-cancel"></svg></a></div>'

  if (file.errors.length > 0 || file.contextErrors.length > 0) {

    html += '<div class="modal-list-errors hidden"><ul>'

    for (var i = 0; i < file.errors.length; i++) {
      var msg = file.errors[i]
      html += '<li>' + msg + '</li>'
    }
    for (var i = 0; i < file.contextErrors.length; i++) {
      var msg = file.contextErrors[i]
      html += '<li>' + msg + '</li>'
    }

    html += '</ul></div>'
  }

  html += '</div>'

  var element = $(html)

  if (total > 0) {
    element.click(function(event) {
      event.stopPropagation()
      $('.modal-list-errors', element).toggleClass('hidden')
    })
  }

  $('.modal-list-delete a', element).click(function(event) {
    event.stopPropagation()
    if (type == 'model')
      delete models[name]
    else if (type == 'texture')
      delete textures[name]
    else if (type == 'mcmeta')
      delete mcmetas[name]
    element.remove()
    checkContext(models, textures, mcmetas)
    displayFileList(models, textures, mcmetas)
  })

  return element

}
