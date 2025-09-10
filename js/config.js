jQuery(document).ready(function($) {
    $('.royalSlider').css('display', 'block');

    var isMobile = window.innerWidth <= 768;

    var slider = $(".royalSlider").royalSlider({
        autoHeight: false,
        arrowsNav: true,
        arrowsNavAutoHide: false,
        arrowsNavHideOnTouch: true,
        fadeinLoadedSlide: true,
        slidesOrientation: 'horizontal',
        autoScaleSlider: false,
        controlNavigationSpacing: 0,
        controlNavigation: 'thumbnails',
        globalCaption: true,
        sliderDrag: isMobile,
        navigateByClick: false,
        startSlideId: 1,
        imageScaleMode: 'none',
        imageAlignCenter: false,
        loop: true,
        loopRewind: false,
        numImagesToPreload: 10,
        keyboardNavEnabled: true,
        usePreloader: false,
        deeplinking: {
            enabled: true,
            prefix: 'slider-'
        },
        thumbs: {
            autoCenter: true,
            fitInViewport: true,
            touch: isMobile,
            drag: false,
            transitionSpeed: 0
        }
    }).data('royalSlider');

    if (!isMobile) {
        $('.royalSlider').on('click', '.rsSlide, .slide, .description, .description-me, .intro', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        $('.royalSlider').on('click', 'video, a:not([onclick])', function(e) {
            e.stopPropagation();
        });
    }

    var prevSlideVideo,
        playSlideVideo = function() {
            if (prevSlideVideo) {
                prevSlideVideo.pause();
            }
            var video = slider.currSlide.content.find('video');
            if (video.length) {
                prevSlideVideo = video[0];
                var promise = prevSlideVideo.play();
                if (promise !== undefined) {
                    promise.catch(error => {
                        // Autoplay prevented
                    });
                }
            } else {
                prevSlideVideo = null;
            }
        };

    slider.ev.on('rsAfterSlideChange', playSlideVideo);
    playSlideVideo();
});