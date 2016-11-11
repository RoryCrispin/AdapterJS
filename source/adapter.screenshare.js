(function () {

  'use strict';

  var baseGetUserMedia = null;

  AdapterJS.TEXT.EXTENSION = {
    REQUIRE_INSTALLATION_FF: 'To enable screensharing you need to install the Skylink WebRTC tools Firefox Add-on.',
    REQUIRE_INSTALLATION_CHROME: 'To enable screensharing you need to install the Skylink WebRTC tools Chrome Extension.',
    REQUIRE_REFRESH: 'Please refresh this page after the Skylink WebRTC tools extension has been installed.',
    BUTTON_FF: 'Install Now',
    BUTTON_CHROME: 'Go to Chrome Web Store',
    CHROME_EXTENSION_ID: 'ljckddiekopnnjoeaiofddfhgnbdoafc'
  };

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
    baseGetUserMedia = window.navigator.getUserMedia;

    navigator.getUserMedia = function (constraints, successCb, failureCb) {

      if (constraints && constraints.video && !!constraints.video.mediaSource) {
        // intercepting screensharing requests

        // Invalid mediaSource for firefox, only "screen" and "window" are supported
        if (constraints.video.mediaSource !== 'screen' && constraints.video.mediaSource !== 'window') {
          failureCb(new Error('GetUserMedia: Only "screen" and "window" are supported as mediaSource constraints'));
          return;
        }

        var updatedConstraints = clone(constraints);

        //constraints.video.mediaSource = constraints.video.mediaSource;
        updatedConstraints.video.mozMediaSource = updatedConstraints.video.mediaSource;

        // so generally, it requires for document.readyState to be completed before the getUserMedia could be invoked.
        // strange but this works anyway
        var checkIfReady = setInterval(function () {
          if (document.readyState === 'complete') {
            clearInterval(checkIfReady);

            baseGetUserMedia(updatedConstraints, successCb, function (error) {
              if (['PermissionDeniedError', 'SecurityError', 'NotAllowedError'].indexOf(error.name) > -1 && window.parent.location.protocol === 'https:') {
                AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION.REQUIRE_INSTALLATION_FF,
                  AdapterJS.TEXT.EXTENSION.BUTTON_FF,
                  'https://addons.mozilla.org/en-US/firefox/addon/skylink-webrtc-tools/', true, true);
              } else {
                failureCb(error);
              }
            });
          }
        }, 1);

      } else { // regular GetUserMediaRequest
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = window.getUserMedia = navigator.getUserMedia;
    /* Comment out to prevent recursive errors
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return new Promise(function(resolve, reject) {
        window.getUserMedia(constraints, resolve, reject);
      });
    };*/

  } else if (window.navigator.webkitGetUserMedia && window.webrtcDetectedBrowser !== 'safari') {
    baseGetUserMedia = window.navigator.getUserMedia;

    navigator.getUserMedia = function (constraints, successCb, failureCb) {
      if (constraints && constraints.video && !!constraints.video.mediaSource) {
        if (window.webrtcDetectedBrowser !== 'chrome') {
          // This is Opera, which does not support screensharing
          failureCb(new Error('Current browser does not support screensharing'));
          return;
        }

        var updatedConstraints = clone(constraints);
        // <img> to load, test and check if extension is installed (make sure your extension has icons)!
        var extensionIcon = document.createElement('img');

        extensionIcon.src = 'chrome-extension://' + AdapterJS.TEXT.EXTENSION.CHROME_EXTENSION_ID + '/icon.png';

        extensionIcon.onload = function() {
          chrome.runtime.sendMessage(AdapterJS.TEXT.EXTENSION.CHROME_EXTENSION_ID, {
            type: 'are-you-there'
          }, function (versionMsg) {
            if (!versionMsg) {
              failureCb(new Error('Extension is disabled for screen retrieval'));
              return;
            }

            chrome.runtime.sendMessage(AdapterJS.TEXT.EXTENSION.CHROME_EXTENSION_ID, {
              type: 'get-sourceId',
              sourceType: constraints.video.mediaSource || 'desktop'
            }, function (sourceIdMsg) {
              if (!sourceIdMsg) {
                failureCb(new Error('Failed retrieving selected screen'));

              } else if (sourceIdMsg.type === 'permission-denied') {
                failureCb(new Error('Permission denied for screen retrieval'));

              } else if (sourceIdMsg.type === 'source-id') {
                updatedConstraints.video.mandatory = updatedConstraints.video.mandatory || {};
                updatedConstraints.video.mandatory.chromeMediaSource = 'desktop'; // 'screen'
                updatedConstraints.video.mandatory.maxWidth = window.screen.width > 1920 ? window.screen.width : 1920;
                updatedConstraints.video.mandatory.maxHeight = window.screen.height > 1080 ? window.screen.height : 1080;

                if (sourceIdMsg.screenSourceId) {
                  updatedConstraints.video.mandatory.chromeMediaSourceId = sourceIdMsg.screenSourceId;
                }

                if (updatedConstraints.audio) {
                  if (typeof updatedConstraints.audio === 'boolean') {
                    updatedConstraints.audio = {};
                  }

                  updatedConstraints.audio.mandatory = updatedConstraints.audio.mandatory || {};
                  updatedConstraints.audio.mandatory = {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceIdMsg.screenSourceId
                  };
                }

                delete updatedConstraints.video.mediaSource;

                baseGetUserMedia(updatedConstraints, successCb, failureCb);
              }
            });
          });
        };

        extensionIcon.onerror = function() {
          AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION.REQUIRE_INSTALLATION_CHROME, AdapterJS.TEXT.EXTENSION.BUTTON_CHROME,
            'https://chrome.google.com/webstore/detail/skylink-webrtc-tools/' + AdapterJS.TEXT.EXTENSION.CHROME_EXTENSION_ID, true, true);
          failureCb(new Error('Failed retrieving selected screen as extension is not installed'));
        };

      } else {
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = window.getUserMedia = navigator.getUserMedia;
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return new Promise(function(resolve, reject) {
        window.getUserMedia(constraints, resolve, reject);
      });
    };

  } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    // nothing here because edge does not support screensharing
    console.warn('Edge does not support screensharing feature in getUserMedia');

  } else {
    baseGetUserMedia = window.navigator.getUserMedia;

    navigator.getUserMedia = function (constraints, successCb, failureCb) {
      if (constraints && constraints.video && !!constraints.video.mediaSource) {
        // would be fine since no methods
        var updatedConstraints = clone(constraints);

        // wait for plugin to be ready
        AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
          // check if screensharing feature is available
          if (!!AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature &&
            !!AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
            // set the constraints
            updatedConstraints.video.optional = updatedConstraints.video.optional || [];
            updatedConstraints.video.optional.push({
              sourceId: AdapterJS.WebRTCPlugin.plugin.screensharingKey || 'Screensharing'
            });

            delete updatedConstraints.video.mediaSource;
          } else {
            failureCb(new Error('Your version of the WebRTC plugin does not support screensharing'));
            return;
          }
          baseGetUserMedia(updatedConstraints, successCb, failureCb);
        });
      } else {
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = getUserMedia = 
       window.getUserMedia = navigator.getUserMedia;
    if ( navigator.mediaDevices &&
      typeof Promise !== 'undefined') {
      navigator.mediaDevices.getUserMedia = requestUserMedia;
    }
  }
})();
