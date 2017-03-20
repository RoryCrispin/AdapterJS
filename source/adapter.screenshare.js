AdapterJS.defineMediaSourcePolyfill = function () {
  var baseGetUserMedia = null;

  var clone = function(obj) {
    if (null === obj || 'object' !== typeof obj) {
      return obj;
    }
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = obj[attr];
      }
    }
    return copy;
  };

  if (window.navigator.mozGetUserMedia) {
    console.log('using default firefox getUserMedia call');
  }
  else if (navigator.webkitGetUserMedia && window.webrtcDetectedBrowser !== 'safari') {
    baseGetUserMedia = navigator.mediaDevices.getUserMedia;
    AdapterJS.getUserMedia = navigator.mediaDevices.getUserMedia = function (constraints) {
      if (constraints && constraints.video && !!constraints.video.mediaSource &&
        window.webrtcDetectedBrowser !== 'chrome') {
        // This is Opera, which does not support screensharing
        return Promise.reject(new Error('Current browser does not support screensharing'));
      } else {
        return baseGetUserMedia(constraints);
      }
    };
  }
  else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    // nothing here because edge does not support screensharing
    console.warn('Edge does not support screensharing feature in getUserMedia');

  }
  else {
    baseGetUserMedia = navigator.mediaDevices.getUserMedia;
    AdapterJS.getUserMedia = navigator.mediaDevices.getUserMedia = function (constraints) {
      if (constraints && constraints.video && !!constraints.video.mediaSource) {
        // would be fine since no methods
        var updatedConstraints = clone(constraints);

        // wait for plugin to be ready
        return new Promise(function(resolve, reject) {
          AdapterJS.WebRTCPlugin.callWhenPluginReady(function () {
            // check if screensharing feature is available
            if (!!AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature && !!AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
              // set the constraints
              updatedConstraints.video.optional = updatedConstraints.video.optional || [];
              updatedConstraints.video.optional.push({
                sourceId: AdapterJS.WebRTCPlugin.plugin.screensharingKey || 'Screensharing'
              });

              delete updatedConstraints.video.mediaSource;
            } else {
              reject(new Error('Your version of the WebRTC plugin does not support screensharing'));
              return;
            }
            baseGetUserMedia(updatedConstraints).then(resolve)['catch'](reject);
          });
        });
      }
      else {
        return baseGetUserMedia(constraints);
      }
    };
  }
};

if (typeof window.require !== 'function') {
  AdapterJS.defineMediaSourcePolyfill();
}
