/*var mq = window.matchMedia( "(min-width: 768px)" );

if(mq.matches) {
    // window width is more than 768px

} else {
    // window width is less than 768px
    $.fn.royalSlider = function(){};

}*/

jQuery(document).ready(function($)
{
  $('.royalSlider').css('display', 'block');
  
    $(".royalSlider").royalSlider({
        autoHeight: false,
        arrowsNav:true,
        arrowsNavAutoHide: false,
        arrowsNavHideOnTouch: true,
        fadeinLoadedSlide: true,
        slidesOrientation: 'horizontal',
        autoScaleSlider: false, 
        controlNavigationSpacing: 0,
        controlNavigation: 'thumbnails',
        globalCaption:true,
        startSlideId: 1,
        imageScaleMode: 'none',
        imageAlignCenter:false,
        loop: true,
        loopRewind: false,
        numImagesToPreload: 10,
        keyboardNavEnabled: true,
        usePreloader: false,
        deeplinking:
        {
          enabled: true,
          prefix: 'slider-'
        },
        thumbs: {
        autoCenter: true,
        fitInViewport: true,
        touch: false,
        drag: false,
        transitionSpeed: 0
      }
    });

    

    var slider = $(".royalSlider").data('royalSlider'),
      prevSlideVideo,
      playSlideVideo = function() {
        if(prevSlideVideo) {
          prevSlideVideo.pause();
        }
        var video = slider.currSlide.content.find('video');
        if(video.length) {
          prevSlideVideo = video[0];
          prevSlideVideo.play();
        } else {
          prevSlideVideo = null;
        }
        
      };
  slider.ev.on('rsAfterSlideChange', playSlideVideo);
  playSlideVideo();      
});