
var viewer

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

  $('#viewer-action-reset').click(function(event) {
    event.stopPropagation()
    viewer.reset()
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


})



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

    console.log('reset')

  }

}
