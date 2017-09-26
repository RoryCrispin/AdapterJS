// Define extension popup bar text
AdapterJS.TEXT.EXTENSION = {
  REQUIRE_INSTALLATION_FF: 'To enable screensharing you need to install the Skylink WebRTC tools Firefox Add-on.',
  REQUIRE_INSTALLATION_CHROME: 'To enable screensharing you need to install the Skylink WebRTC tools Chrome Extension.',
  REQUIRE_REFRESH: 'Please refresh this page after the Skylink WebRTC tools extension has been installed.',
  BUTTON_FF: 'Install Now',
  BUTTON_CHROME: 'Go to Chrome Web Store'
};

// Define extension settings
AdapterJS.extensionInfo =  AdapterJS.extensionInfo || {
  chrome: {
    extensionId: 'ljckddiekopnnjoeaiofddfhgnbdoafc',
    extensionLink: 'https://chrome.google.com/webstore/detail/skylink-webrtc-tools/ljckddiekopnnjoeaiofddfhgnbdoafc',
    // Deprecated! Define this to use iframe method that works with previous extension codebase that does not honor "mediaSource" flag
    iframeLink: 'https://cdn.temasys.com.sg/skylink/extensions/detectRTC.html'
  },
  // Required only for Firefox 51 and below
  firefox: {
    extensionLink: 'https://addons.mozilla.org/en-US/firefox/addon/skylink-webrtc-tools/'
  },
  opera: {
    // Define the extensionId and extensionLink to integrate the Opera screensharing extension
    extensionId: null,
    extensionLink: null
  }
};

AdapterJS._mediaSourcePolyfillIsDefined = false;
AdapterJS._defineMediaSourcePolyfill = function () {
  // Sanity checks to prevent re-defining the polyfills again in any case.
  if (AdapterJS._mediaSourcePolyfillIsDefined) {
    return;
  }

  AdapterJS._mediaSourcePolyfillIsDefined = true;
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

  var checkIfConstraintsIsValid = function (constraints, successCb, failureCb) {
    // Append checks for overrides as these are mandatory
    // Browsers (not Firefox since they went Promise based) does these checks and they can be quite useful
    if (!(constraints && typeof constraints === 'object')) {
      throw new Error('GetUserMedia: (constraints, .., ..) argument required');
    } else if (typeof successCb !== 'function') {
      throw new Error('GetUserMedia: (.., successCb, ..) argument required');
    } else if (typeof failureCb !== 'function') {
      throw new Error('GetUserMedia: (.., .., failureCb) argument required');
    }
  };

  if (AdapterJS.webrtcDetectedType === 'moz') {
    // do nothing
  } else if (AdapterJS.webrtcDetectedType === 'webkit') {
    // do nothing
  } else if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    // Note: Not overriding getUserMedia() to reject "mediaSource" as to prevent "Invalid calling object" errors.
    // Nothing here because edge does not support screensharing
    console.warn('Edge does not support screensharing feature in getUserMedia');

  } else if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    // don't do anything. Screensharing is not supported
    console.warn('Safari does not support screensharing feature in getUserMedia');
  } else if (AdapterJS.webrtcDetectedType === 'plugin') {
    baseGetUserMedia = window.navigator.getUserMedia;

    navigator.getUserMedia = function (constraints, successCb, failureCb) {
      checkIfConstraintsIsValid(constraints, successCb, failureCb);

      if (constraints.video && typeof constraints.video === 'object' && constraints.video.hasOwnProperty('mediaSource')) {
        var updatedConstraints = clone(constraints);

        // Wait for plugin to be ready
        AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
          // Check if screensharing feature is available
          if (!!AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature && !!AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
            // Do strict checks for the source ID - "screen", "window" or ["screen", "window"]
            // Note that the screen/window can be JS selected using constraints.video.optional[n].screenId

            if (AdapterJS.WebRTCPlugin.plugin.screensharingKeys) {
              // Param: ["screen", "window"]
              // Legacy: Also s upport for "Screensharing" and "screensharing"
              if ((Array.isArray(updatedConstraints.video.mediaSource) &&
                    updatedConstraints.video.mediaSource.indexOf('screen') > -1 &&
                    updatedConstraints.video.mediaSource.indexOf('window') > -1)
                  || updatedConstraints.video.mediaSource === AdapterJS.WebRTCPlugin.plugin.screensharingKey
                  || updatedConstraints.video.mediaSource === AdapterJS.WebRTCPlugin.plugin.screensharingKeys.screenOrWindow
                 ) {
                updatedConstraints.video.mediaSource = AdapterJS.WebRTCPlugin.plugin.screensharingKeys.screenOrWindow;
              // Param: ["screen"] or "screen"
              } else if ((Array.isArray(updatedConstraints.video.mediaSource) &&
                updatedConstraints.video.mediaSource.indexOf('screen') > -1) || updatedConstraints.video.mediaSource === 'screen') {
                updatedConstraints.video.mediaSource = AdapterJS.WebRTCPlugin.plugin.screensharingKeys.screen;
              // Param: ["window"] or "window"
              } else if ((Array.isArray(updatedConstraints.video.mediaSource) &&
                updatedConstraints.video.mediaSource.indexOf('window') > -1) || updatedConstraints.video.mediaSource === 'window') {
                updatedConstraints.video.mediaSource = AdapterJS.WebRTCPlugin.plugin.screensharingKeys.window;
              } else {
                failureCb(new Error('GetUserMedia: Only "screen", "window", ["screen", "window"] are supported as mediaSource constraints'));
                return;
              }
            }

            // Support for legacy plugins : set the sourceId to the mediaSource value
            updatedConstraints.video.optional = updatedConstraints.video.optional || [];
            updatedConstraints.video.optional.push({ sourceId: updatedConstraints.video.mediaSource });

            baseGetUserMedia(updatedConstraints, successCb, failureCb);

          } else {
            failureCb(new Error('Your version of the WebRTC plugin does not support screensharing'));
            return;
          }
        });
      } else {
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = getUserMedia = window.getUserMedia = navigator.getUserMedia;
    if (navigator.mediaDevices && typeof Promise !== 'undefined') {
      navigator.mediaDevices.getUserMedia = requestUserMedia;
    }
  }
};

if (typeof window.require !== 'function') {
  AdapterJS._defineMediaSourcePolyfill();
}
