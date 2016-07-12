
var viewer

var activeModel = ''

var animationFrames = {}

var models = {}
var textures = {}
var mcmetas = {}

$(document).ready(function() {


  // initialize viewer

  var viewerWindow = $('#viewer').get(0)

  viewer = new ModelViewer(viewerWindow)
  $(window).resize(viewer.resize)

  viewer.controls.target0.set(0, -4, 0)
  viewer.controls.position0.set(8, 0, 20)
  viewer.controls.rotateSpeed = 0.3

  viewer.reset()


  // handle events

  $('#frames').click(function(event) {
    event.stopPropagation()
    if (activeModel != '') {
      viewer.hide(activeModel)
      activeModel = ''
    }
    $('.frame-element.selected').removeClass('selected')
  })

  $('#viewer-action-reset').click(function(event) {
    event.stopPropagation()
    viewer.reset()
  })
  $('#viewer-action-target').click(function(event) {
    event.stopPropagation()
    if (Object.keys(animationFrames).indexOf(activeModel) >= 0) {
      viewer.lookAt(activeModel)
    }
  })

  $('#frames-sidebar-loadFrames').click(function(event) {
    event.stopPropagation()
    modal.show()
  })

  $('#overlay').click(function(event) {
    event.stopPropagation()
    modal.hide()
  })
  $('#modal').click(function(event) {
    event.stopPropagation()
  })

  $('#modal-close').click(function(event) {
    event.stopPropagation()
    modal.hide()
  })

  $('#modal-load').click(function(event) {

    event.stopPropagation()

    var frames = getAnimationFrames()
    var frameNames = Object.keys(frames).concat(Object.keys(animationFrames)).sort(alphanum)
    var newFrames = {}

    for (var i = 0; i < frameNames.length; i++) {
      var name = frameNames[i]
      var frame
      if (Object.keys(frames).indexOf(name) >= 0) {
        frame = frames[name]
      } else {
        frame = animationFrames[name]
      }
      newFrames[name] = frame
    }

    animationFrames = newFrames

    modal.hide()

    displayAnimationFrames()

  })
  $('#modal-file-input').change(function(event) {
    event.stopPropagation()
    modal.load(this.files)
    this.value = ''
  })

})



function getAnimationFrames() {

  var frames = {}

  var modelList = Object.keys(models).sort(alphanum)

  for (var i = 0; i < modelList.length; i++) {

    var name = modelList[i]
    var model = models[name]

    if (model.errors.length == 0 && model.contextErrors.length == 0) {

      var textureNames = Object.keys(model.data.textures)
      var modeltextures = {}
      var rawTextureList = []

      for (var j = 0; j < textureNames.length; j++) {

        var textureReference = textureNames[j]
        var tmp = model.data.textures[textureReference].split('/')
        var texturename = tmp[tmp.length-1]

        var texture = textures[texturename + '.png']

        if (texture.data.width != texture.data.height) {
          var mcmetaname = texturename + '.png.mcmeta'
          var mcmeta = mcmetas[mcmetaname]
          rawTextureList.push({name: texturename, texture: texture.raw, mcmeta: mcmeta.raw})
          modeltextures[texturename] = {texture: texture.data, mcmeta: mcmeta.data}
        } else {
          rawTextureList.push({name: texturename, texture: texture.raw})
          modeltextures[texturename] = {texture: texture.data}
        }

      }

      var displayName = name.split('.json')[0]

      frames[displayName] = {
        model: model.data,
        textures: modeltextures,
        threeModel: new JsonModel(displayName, model.raw, rawTextureList)
      }

    }

  }

  return frames

}



function displayAnimationFrames() {

  var frameNames = Object.keys(animationFrames)
  var cont = $('#frames-container')
  cont.html('')

  viewer.removeAll()

  for (var i = 0; i < frameNames.length; i++) {

    var name = frameNames[i]
    var frame = animationFrames[name]

    var html = '<div class="frame-element"><div class="frame-preview noselect"><svg><use xlink:href="#svg-file"/></svg></div><div class="frame-name">' + name + '</div></div>'

    var frameElement = $(html)
    cont.append(frameElement)

    viewer.load(frame.threeModel)
    viewer.hide(name)

    ;(function(name, frame, frameElement) {

      frameElement.click(function(event) {
        event.stopPropagation()
        $('.frame-element.selected').removeClass('selected')
        frameElement.addClass('selected')
        var frameNames = Object.keys(animationFrames)
        for (var j = 0; j < frameNames.length; j++) {
          viewer.hide(frameNames[j])
        }
        viewer.show(name)
        activeModel = name
      })


    })(name, frame, frameElement)

  }


}
