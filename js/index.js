
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


})
