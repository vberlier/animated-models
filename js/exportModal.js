

var exportModal = {

  show: function() {

    $('#export-overlay').removeClass('hidden')
    exportModal.reset()

  },

  hide: function() {

    $('#export-overlay').addClass('hidden')
    exportModal.reset()

  },

  reset: function() {

    var framesCount = $('.timeline-frame-element').length

    if (framesCount > 0) {
      $('#export-modal-main').removeClass('hidden')
      $('#export-modal-export').removeClass('hidden')
      $('#export-nothing').addClass('hidden')
      $('#export-model-path').val('block/glass')
      $('#export-texture-path').val('blocks/' + $('.timeline-frame-element').attr('data-name'))
    } else {
      $('#export-modal-main').addClass('hidden')
      $('#export-modal-export').addClass('hidden')
      $('#export-nothing').removeClass('hidden')
    }

  },

  export: function(modelPath, texturePath) {

    console.log('export')

  }

}
