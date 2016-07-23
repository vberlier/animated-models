
var viewer

var activeModel = ''

var activeFrame = ''
var playingAnimation = false
var tick = 1

var animationFrames = {}
var allFramesSelected = false

var models = {}
var textures = {}

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

  $(document).on('scroll', function(event) {
    $(document).scrollLeft(0)
    $(document).scrollTop(0)
  })

  $('#topbar-export').click(function(event) {
    event.stopPropagation()
    exportModal.show()
    playingAnimation = true
    $('#timeline-option-play-button').click()
  })

  $('#frames').click(function(event) {
    event.stopPropagation()
    if (activeModel != '') {
      viewer.hide(activeModel)
      activeModel = ''
    }
    $('.frame-element.selected').removeClass('selected')
    allFramesSelected = false
  })

  $('#viewer-action-reset').click(function(event) {
    event.stopPropagation()
    viewer.reset()
  })
  $('#viewer-action-target').click(function(event) {
    event.stopPropagation()
    if (Object.keys(animationFrames).indexOf(activeFrame) >= 0) {
      viewer.lookAt(activeFrame)
    } else if (Object.keys(animationFrames).indexOf(activeModel) >= 0) {
      viewer.lookAt(activeModel)
    }
  })

  $('#frames-sidebar-loadFrames').click(function(event) {
    event.stopPropagation()
    modal.show()
  })
  $('#frames-sidebar-selectAll').click(function(event) {
    event.stopPropagation()
    $('.frame-element').addClass('selected')
    allFramesSelected = true
  })
  $('#frames-sidebar-delete').click(function(event) {
    event.stopPropagation()
    if (allFramesSelected) {
      $('.frame-element').remove()
      viewer.removeAll()
      animationFrames = {}
      $('.timeline-frame-element').remove()
    } else if (activeModel != '') {
      $('.frame-element[data-name="' + activeModel + '"]').remove()
      viewer.remove(activeModel)
      delete animationFrames[activeModel]
      $('.timeline-frame-element[data-name="' + activeModel + '"]').remove()
    }
    allFramesSelected = false
    activeModel = ''
  })

  $('#timeline-option-play-button').click(function(event) {
    event.stopPropagation()
    var button = $(this)
    if (playingAnimation) {
      playingAnimation = false
      button.html('<svg><use xlink:href="#svg-play">')
      button.attr('title', 'Play')
    } else {
      playingAnimation = true
      button.html('<svg><use xlink:href="#svg-pause">')
      button.attr('title', 'Pause')
      animateTimeline()
    }
  })
  $('#timeline-option-delete-all').click(function(event) {
    event.stopPropagation()
    $('.timeline-frame-element').remove()
    playingAnimation = true
    $('#timeline-option-play-button').click()
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

    allFramesSelected = false

  })
  $('#modal-file-input').change(function(event) {
    event.stopPropagation()
    modal.load(this.files)
    this.value = ''
  })

  $('#export-overlay').click(function(event) {
    event.stopPropagation()
    exportModal.hide()
  })
  $('#export-modal').click(function(event) {
    event.stopPropagation()
  })

  $('#export-modal-close').click(function(event) {
    event.stopPropagation()
    exportModal.hide()
  })
  $('#export-modal-export').click(function(event) {
    event.stopPropagation()
    var modelPath = $('#export-model-path').val()
    var texturePath = $('#export-texture-path').val()
    exportModal.export(modelPath, texturePath)
    exportModal.hide()
  })

  $('#timeline-frames').mousewheel(function(event, delta) {
    event.stopPropagation()
    event.preventDefault()
    this.scrollLeft -= delta * 42
  })
  $('#timeline-frames').sortable({
    revert: 140,
    scroll: false,
    axis: 'x',
    placeholder: 'timeline-sorting-placeholder',
    start: function(event, ui) {
      ui.placeholder.html('<svg><use xlink:href="#svg-dropHere"></svg>')
      ui.placeholder.css('width', ui.item.css('width'))
    },
    receive: function(event, ui) {

      var html = []

      $(this).find('.frame-element').each(function() {

        if (allFramesSelected) {

          $('#frames-container').find('.frame-element').each(function() {
            var name = $(this).attr('data-name')
            var timeframe = createTimelineFrame(name, 1)
            html.push(timeframe)
          })

        } else {

          var name = $(this).attr('data-name')
          var timeframe = createTimelineFrame(name, 1)
          html.push(timeframe)

        }

      })

      $(this).find('.frame-element').replaceWith(html)

    }

  })

})



function animateTimeline() {

  if (!playingAnimation) {
    $('.timeline-frame-element.activeFrame').removeClass('activeFrame')
    viewer.hideAll()
    if (Object.keys(animationFrames).indexOf(activeModel) >= 0) {
      $('.frame-element[data-name="' + activeModel + '"]').click()
    }
    activeFrame = ''
    tick = 1
    return
  }

  var timelineFrames = []

  $('.timeline-frame-element').each(function() {
    var frame = $(this)
    timelineFrames.push({
      name: frame.attr('data-name'),
      duration: 1*frame.attr('data-duration'),
      element: frame
    })
  })

  var currentIndex = 0
  var currentFrameName = ''
  var currentFrameElement

  for (var i = 0; i < timelineFrames.length; i++) {
    var frame = timelineFrames[i]
    var previousIndex = currentIndex
    currentIndex += frame.duration
    if (tick > previousIndex && tick <= currentIndex) {
      currentFrameName = frame.name
      currentFrameElement = frame.element
      break
    }
  }

  if (currentFrameName == '') {
    tick = 1
    if (timelineFrames.length > 0) {
      currentFrameName = timelineFrames[0].name
      currentFrameElement = timelineFrames[0].element
    }
  }

  if (currentFrameName != '') {
    $('.timeline-frame-element.activeFrame').removeClass('activeFrame')
    currentFrameElement.addClass('activeFrame')
    activeFrame = currentFrameName
    viewer.hideAll()
    viewer.show(currentFrameName)
  } else {
    playingAnimation = true
    $('#timeline-option-play-button').click()
  }

  tick += 1

  window.setTimeout(function() {
    window.requestAnimationFrame(animateTimeline)
  }, 50)

}
