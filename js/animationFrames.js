

function getAnimationFrames() {

  var frames = {}

  var modelList = Object.keys(models).sort(alphanum)

  for (var i = 0; i < modelList.length; i++) {

    ;(function() {

      var name = modelList[i]
      var model = models[name]

      if (model.errors.length == 0 && model.contextErrors.length == 0) {

        var textureNames = Object.keys(model.data.textures)
        var modeltextures = {}

        for (var j = 0; j < textureNames.length; j++) {

          var textureReference = textureNames[j]
          var tmp = model.data.textures[textureReference].split('/')
          var texturename = tmp[tmp.length-1]

          var texture = textures[texturename + '.png']

          modeltextures[texturename] = texture.data

        }

        var bundle = bundleTextures(model.data, modeltextures)

        var displayName = name.split('.json')[0]

        frames[displayName] = {
          model: bundle.model,
          texture: bundle.texture,
          threeModel: new JsonModel(displayName, bundle.model, [{name: 'bundle', texture: bundle.texture}])
        }

      }

    })()

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

    var html = '<div class="frame-element" data-name="' + name + '"><div class="frame-preview"><svg><use xlink:href="#svg-file"/></svg></div><div class="frame-name">' + name + '</div></div>'

    var frameElement = $(html)
    cont.append(frameElement)

    viewer.load(frame.threeModel)
    viewer.hide(name)

    ;(function(name, frame, frameElement) {

      frameElement.click(function(event) {
        event.stopPropagation()
        playingAnimation = true
        $('#timeline-option-play-button').click()
        $('.frame-element.selected').removeClass('selected')
        frameElement.addClass('selected')
        viewer.hideAll()
        viewer.show(name)
        activeModel = name
        allFramesSelected = false
      })

      frameElement.draggable({
        connectToSortable: "#timeline-frames",
        helper: "clone",
        containment: "#wrapper",
        appendTo: '#wrapper',
        scroll: false,
        stack: '.frame-element',
        start: function(event, ui) {

          if (!allFramesSelected) {
            frameElement.click()
          }

        }
      })


    })(name, frame, frameElement)

  }


}



function createTimelineFrame(name, duration) {

  var timelineFrame = $('<div class="timeline-frame-element" data-name="' + name + '" data-duration="' + duration + '" style="width: ' + (duration * 7.4) + 'em;"><div class="timeline-frame-element-actions"><div class="timeline-frame-action-element"><a class="timeline-frame-clone basic" title="Duplicate"><svg><use xlink:href="#svg-duplicate"></svg></a></div><div class="timeline-frame-action-element"><a class="timeline-frame-delete basic" title="Delete"><svg><use xlink:href="#svg-close"></svg></a></div></div><div class="timeline-frame-element-name">' + name + '</div><div class="timeline-frame-element-options"><input type="text" value="' + duration + '"></div></div>')

  timelineFrame.find('.timeline-frame-clone').click(function(event) {
    event.stopPropagation()
    timelineFrame.after(createTimelineFrame(timelineFrame.attr('data-name'), timelineFrame.attr('data-duration')))
  })

  timelineFrame.find('.timeline-frame-delete').click(function(event) {
    event.stopPropagation()
    timelineFrame.remove()
  })

  timelineFrame.find('input').change(function(event) {
    var input = this.value
    if (input.match(/^\d+$/) && input*1 > 0) {
      timelineFrame.attr('data-duration', input)
      timelineFrame.css('width', input*1 * 7.4 + 'em')
      $(this).css({
        color: '#afafaf',
        background: 'rgba(255, 255, 255, 0.4)'
      })
    } else {
      $(this).css({
        color: '#e99595',
        background: '#ffe4e4'
      })
    }
  })

  return timelineFrame

}



function bundleTextures(baseModel, textures) {

  var model = $.extend(true, {}, baseModel)

  var baseWidth = 16
  var baseHeight = 16

  var textureSize = 16

  var textureNames = Object.keys(textures)

  textureNames.forEach(function(name, index) {
    var texture = textures[name]
    if (texture.width > baseWidth) baseWidth = texture.width
    if (texture.height > baseHeight) baseHeight = texture.height
  })

  var totalPixels = baseWidth * baseHeight * textureNames.length

  while (Math.pow(textureSize, 2) < totalPixels)
    textureSize *= 2

  var canvas = document.createElement('canvas')
  canvas.setAttribute('width', textureSize)
  canvas.setAttribute('height', textureSize)
  var context = canvas.getContext('2d')

  var xPos = 0
  var yPos = 0

  var texturesMaps = {}

  for (var i = 0; i < textureNames.length; i++) {
    var name = textureNames[i]
    var texture = textures[name]
    context.drawImage(texture, xPos, yPos)
    texturesMaps[name] = [xPos, yPos, texture.width, texture.height]
    xPos += baseWidth
    if (xPos + baseWidth > textureSize) {
      xPos = 0
      yPos += baseHeight
    }
  }

  for (var e = 0; e < model.elements.length; e++) {

    var element = model.elements[e]
    if (element.hasOwnProperty('faces')) {

      var sides = Object.keys(element.faces)

      for (var i = 0; i < sides.length; i++) {

        var side = sides[i]
        var face = element.faces[side]

        var tmp = model.textures[face.texture.substr(1)].split('/')
        var name = tmp[tmp.length-1]

        if (Object.keys(texturesMaps).indexOf(name) >= 0) {

          var minx = face.uv[0]
          var miny = face.uv[1]
          var maxx = face.uv[2]
          var maxy = face.uv[3]

          var xPos = texturesMaps[name][0]
          var yPos = texturesMaps[name][1]

          var width = texturesMaps[name][2]
          var height = texturesMaps[name][3]

          face.uv[0] = (minx * (width/baseWidth) * (baseWidth/16) + xPos) / textureSize * 16
          face.uv[1] = (miny * (height/baseHeight) * (baseHeight/16) + yPos) / textureSize * 16
          face.uv[2] = (maxx * (width/baseWidth) * (baseWidth/16) + xPos) / textureSize * 16
          face.uv[3] = (maxy * (height/baseHeight) * (baseHeight/16) + yPos) / textureSize * 16

        }

        face.texture = '#main'

      }

    }

  }

  model.textures = {
    main: 'bundle'
  }

  return {
    model: JSON.stringify(model),
    texture: canvas.toDataURL('image/png')
  }

}
