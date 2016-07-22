
var viewer

var activeModel = ''

var animationFrames = {}
var allFramesSelected = false

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

  $(document).on('scroll', function(event) {
    $(document).scrollLeft(0)
    $(document).scrollTop(0)
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
    if (Object.keys(animationFrames).indexOf(activeModel) >= 0) {
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
