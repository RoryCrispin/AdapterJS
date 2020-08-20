// Adapter's interface.
var AdapterJS = AdapterJS || window.AdapterJS || {};

AdapterJS.options = AdapterJS.options || {};

// uncomment to get virtual webcams
// AdapterJS.options.getAllCams = true;
AdapterJS.options.getAllCams = false;

// uncomment to prevent the install prompt when the plugin in not yet installed
// AdapterJS.options.hidePluginInstallPrompt = true;
AdapterJS.options.hidePluginInstallPrompt = true;

// uncomment to force the use of the plugin on Safari
// AdapterJS.options.forceSafariPlugin = true;
AdapterJS.options.forceSafariPlugin = true;

// AdapterJS version
AdapterJS.VERSION = '@@version';

// This function will be called when the WebRTC API is ready to be used
// Whether it is the native implementation (Chrome, Firefox, Opera) or
// the plugin
// You may Override this function to synchronise the start of your application
// with the WebRTC API being ready.
// If you decide not to override use this synchronisation, it may result in
// an extensive CPU usage on the plugin start (once per tab loaded)
// Params:
//    - isUsingPlugin: true is the WebRTC plugin is being used, false otherwise
//
AdapterJS.onwebrtcready = AdapterJS.onwebrtcready || function(isUsingPlugin) {
  // The WebRTC API is ready.
  // Override me and do whatever you want here
};

// New interface to store multiple callbacks, private
AdapterJS._onwebrtcreadies = [];

// Sets a callback function to be called when the WebRTC interface is ready.
// The first argument is the function to callback.\
// Throws an error if the first argument is not a function
AdapterJS.webRTCReady = function (baseCallback) {
  if (typeof baseCallback !== 'function') {
    throw new Error('Callback provided is not a function');
  }

  var callback = function () {
    // Make users having requirejs to use the webRTCReady function to define first
    // When you set a setTimeout(definePolyfill, 0), it overrides the WebRTC function
    // This is be more than 0s
    if (typeof window.require === 'function' &&
      typeof AdapterJS._defineMediaSourcePolyfill === 'function') {
      AdapterJS._defineMediaSourcePolyfill();
    }

    // All WebRTC interfaces are ready, just call the callback
    baseCallback(null !== AdapterJS.WebRTCPlugin.plugin);
  };



  if (true === AdapterJS.onwebrtcreadyDone) {
    callback();
  } else {
    // will be triggered automatically when your browser/plugin is ready.
    AdapterJS._onwebrtcreadies.push(callback);
  }
};

// Plugin namespace
AdapterJS.WebRTCPlugin = AdapterJS.WebRTCPlugin || {};

// The object to store plugin information
/* jshint ignore:start */
@Tem@include('pluginInfo.js', {})
/* jshint ignore:end */

AdapterJS.WebRTCPlugin.TAGS = {
  NONE  : 'none',
  AUDIO : 'audio',
  VIDEO : 'video'
};

// Unique identifier of each opened page
AdapterJS.WebRTCPlugin.pageId = Math.random().toString(36).slice(2);

// Use this whenever you want to call the plugin.
AdapterJS.WebRTCPlugin.plugin = null;

// Set log level for the plugin once it is ready.
// The different values are
// This is an asynchronous function that will run when the plugin is ready
AdapterJS.WebRTCPlugin.setLogLevel = null;

// Defines webrtc's JS interface according to the plugin's implementation.
// Define plugin Browsers as WebRTC Interface.
AdapterJS.WebRTCPlugin.defineWebRTCInterface = null;

// This function detects whether or not a plugin is installed.
// Checks if Not IE (firefox, for example), else if it's IE,
// we're running IE and do something. If not it is not supported.
AdapterJS.WebRTCPlugin.isPluginInstalled = null;

 // Lets adapter.js wait until the the document is ready before injecting the plugin
AdapterJS.WebRTCPlugin.pluginInjectionInterval = null;

// Inject the HTML DOM object element into the page.
AdapterJS.WebRTCPlugin.injectPlugin = null;

// States of readiness that the plugin goes through when
// being injected and stated
AdapterJS.WebRTCPlugin.PLUGIN_STATES = {
  NONE : 0,           // no plugin use
  INITIALIZING : 1,   // Detected need for plugin
  INJECTING : 2,      // Injecting plugin
  INJECTED: 3,        // Plugin element injected but not usable yet
  READY: 4            // Plugin ready to be used
};

// Current state of the plugin. You cannot use the plugin before this is
// equal to AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY
AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.NONE;

// True is AdapterJS.onwebrtcready was already called, false otherwise
// Used to make sure AdapterJS.onwebrtcready is only called once
AdapterJS.onwebrtcreadyDone = false;

// Log levels for the plugin.
// To be set by calling AdapterJS.WebRTCPlugin.setLogLevel
/*
Log outputs are prefixed in some cases.
  INFO: Information reported by the plugin.
  ERROR: Errors originating from within the plugin.
  WEBRTC: Error originating from within the libWebRTC library
*/
// From the least verbose to the most verbose
AdapterJS.WebRTCPlugin.PLUGIN_LOG_LEVELS = {
  NONE : 'NONE',
  ERROR : 'ERROR',
  WARNING : 'WARNING',
  INFO: 'INFO',
  VERBOSE: 'VERBOSE',
  SENSITIVE: 'SENSITIVE'
};

// Does a waiting check before proceeding to load the plugin.
AdapterJS.WebRTCPlugin.WaitForPluginReady = null;

// This methid will use an interval to wait for the plugin to be ready.
AdapterJS.WebRTCPlugin.callWhenPluginReady = null;

AdapterJS.documentReady = function () {
  return (document.readyState === 'interactive' && !!document.body) || document.readyState === 'complete';
}

// !!!! WARNING: DO NOT OVERRIDE THIS FUNCTION. !!!
// This function will be called when plugin is ready. It sends necessary
// details to the plugin.
// The function will wait for the document to be ready and the set the
// plugin state to AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY,
// indicating that it can start being requested.
// This function is not in the IE/Safari condition brackets so that
// TemPluginLoaded function might be called on Chrome/Firefox.
// This function is the only private function that is not encapsulated to
// allow the plugin method to be called.
window.__TemWebRTCReady0 = function () {
  if (AdapterJS.documentReady()) {
    AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY;
    AdapterJS.maybeThroughWebRTCReady();
  } else {
    // Try again in 100ms
    setTimeout(__TemWebRTCReady0, 100);
  }
};

AdapterJS.maybeThroughWebRTCReady = function() {
  if (!AdapterJS.onwebrtcreadyDone) {
    AdapterJS.onwebrtcreadyDone = true;

    // If new interface for multiple callbacks used
    if (AdapterJS._onwebrtcreadies.length) {
      AdapterJS._onwebrtcreadies.forEach(function (callback) {
        if (typeof(callback) === 'function') {
          callback(AdapterJS.WebRTCPlugin.plugin !== null);
        }
      });
    // Else if no callbacks on new interface assuming user used old(deprecated) way to set callback through AdapterJS.onwebrtcready = ...
    } else if (typeof(AdapterJS.onwebrtcready) === 'function') {
      AdapterJS.onwebrtcready(AdapterJS.WebRTCPlugin.plugin !== null);
    }
  }
};

// The result of ice connection states.
// - starting: Ice connection is starting.
// - checking: Ice connection is checking.
// - connected Ice connection is connected.
// - completed Ice connection is connected.
// - done Ice connection has been completed.
// - disconnected Ice connection has been disconnected.
// - failed Ice connection has failed.
// - closed Ice connection is closed.
AdapterJS._iceConnectionStates = {
  starting : 'starting',
  checking : 'checking',
  connected : 'connected',
  completed : 'connected',
  done : 'completed',
  disconnected : 'disconnected',
  failed : 'failed',
  closed : 'closed'
};

//The IceConnection states that has been fired for each peer.
AdapterJS._iceConnectionFiredStates = [];


// Check if WebRTC Interface is defined.
AdapterJS.isDefined = null;

// -----------------------------------------------------------
// Detected webrtc implementation. Types are:
// - 'moz': Mozilla implementation of webRTC.
// - 'webkit': WebKit implementation of webRTC.
// - 'plugin': Using the plugin implementation.
window.webrtcDetectedType = null;

//Creates MediaStream object.
window.MediaStream = (typeof MediaStream === 'function') ? MediaStream : null;

//Creates MediaStreamTrack object.
window.MediaStreamTrack = (typeof MediaStreamTrack === 'function') ? MediaStreamTrack : null;

//The RTCPeerConnection object.
window.RTCPeerConnection = (typeof RTCPeerConnection === 'function') ?
  RTCPeerConnection : null;

// Creates RTCSessionDescription object for Plugin Browsers
window.RTCSessionDescription = (typeof RTCSessionDescription === 'function') ?
  RTCSessionDescription : null;

// Creates RTCIceCandidate object for Plugin Browsers
window.RTCIceCandidate = (typeof RTCIceCandidate === 'function') ?
  RTCIceCandidate : null;

// Get UserMedia (only difference is the prefix).
// Code from Adam Barth.
window.getUserMedia = (typeof getUserMedia  === 'function') ?
  getUserMedia  : null;

// Attach a media stream to an element.
window.attachMediaStream = null;

// Re-attach a media stream to an element.
window.reattachMediaStream = null;

// Detected browser agent name. Types are:
// - 'firefox': Firefox browser.
// - 'chrome': Chrome browser.
// - 'opera': Opera browser.
// - 'safari': Safari browser.
// - 'IE' - Internet Explorer browser.
window.webrtcDetectedBrowser = null;

// Detected browser version.
window.webrtcDetectedVersion = null;

// The minimum browser version still supported by AJS.
window.webrtcMinimumVersion  = null;

// The type of DC supported by the browser
window.webrtcDetectedDCSupport = null;

// This function helps to retrieve the webrtc detected browser information.
// This sets:
// - webrtcDetectedBrowser: The browser agent name.
// - webrtcDetectedVersion: The browser version.
// - webrtcMinimumVersion: The minimum browser version still supported by AJS.
// - webrtcDetectedType: The types of webRTC support.
//   - 'moz': Mozilla implementation of webRTC.
//   - 'webkit': WebKit implementation of webRTC.
//   - 'plugin': Using the plugin implementation.
AdapterJS.parseWebrtcDetectedBrowser = function () {
  var hasMatch = null;

  // Detect Opera (8.0+)
  if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
    hasMatch = navigator.userAgent.match(/OPR\/(\d+)/i) || [];

    window.webrtcDetectedBrowser   = 'opera';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 26;
    window.webrtcDetectedType      = 'webkit';
    window.webrtcDetectedDCSupport = 'SCTP'; // Opera 20+ uses Chrome 33

  // Detect Bowser on iOS
  } else if (navigator.userAgent.match(/Bowser\/[0-9.]*/g)) {
    hasMatch = navigator.userAgent.match(/Bowser\/[0-9.]*/g) || [];

    var chromiumVersion = parseInt((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./i) || [])[2] || '0', 10);

    window.webrtcDetectedBrowser   = 'bowser';
    window.webrtcDetectedVersion   = parseFloat((hasMatch[0] || '0/0').split('/')[1], 10);
    window.webrtcMinimumVersion    = 0;
    window.webrtcDetectedType      = 'webkit';
    window.webrtcDetectedDCSupport = chromiumVersion > 30 ? 'SCTP' : 'RTP';


  // Detect Opera on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('OPiOS') > 0) {
    hasMatch = navigator.userAgent.match(/OPiOS\/([0-9]+)\./);

    // Browser which do not support webrtc yet
    window.webrtcDetectedBrowser   = 'opera';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 0;
    window.webrtcDetectedType      = null;
    window.webrtcDetectedDCSupport = null;

  // Detect Chrome on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('CriOS') > 0) {
    hasMatch = navigator.userAgent.match(/CriOS\/([0-9]+)\./) || [];

    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 0;
    window.webrtcDetectedType      = null;
    window.webrtcDetectedBrowser   = 'chrome';
    window.webrtcDetectedDCSupport = null;

  // Detect Firefox on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('FxiOS') > 0) {
    hasMatch = navigator.userAgent.match(/FxiOS\/([0-9]+)\./) || [];

    // Browser which do not support webrtc yet
    window.webrtcDetectedBrowser   = 'firefox';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 0;
    window.webrtcDetectedType      = null;
    window.webrtcDetectedDCSupport = null;

  // Detect IE (6-11)
  } else if (/*@cc_on!@*/false || !!document.documentMode) {
    hasMatch = /\brv[ :]+(\d+)/g.exec(navigator.userAgent) || [];

    window.webrtcDetectedBrowser   = 'IE';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1], 10);
    window.webrtcMinimumVersion    = 9;
    window.webrtcDetectedType      = 'plugin';
    window.webrtcDetectedDCSupport = 'SCTP';

    if (!webrtcDetectedVersion) {
      hasMatch = /\bMSIE[ :]+(\d+)/g.exec(navigator.userAgent) || [];

      window.webrtcDetectedVersion = parseInt(hasMatch[1] || '0', 10);
    }

  // Detect Edge (20+)
  } else if (!!window.StyleMedia || navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    hasMatch = navigator.userAgent.match(/Edge\/(\d+).(\d+)$/) || [];

    // Previous webrtc/adapter uses minimum version as 10547 but checking in the Edge release history,
    // It's close to 13.10547 and ObjectRTC API is fully supported in that version

    window.webrtcDetectedBrowser   = 'edge';
    window.webrtcDetectedVersion   = parseFloat((hasMatch[0] || '0/0').split('/')[1], 10);
    window.webrtcMinimumVersion    = 13.10547;
    window.webrtcDetectedType      = 'ms';
    window.webrtcDetectedDCSupport = null;

  // Detect Firefox (1.0+)
  // Placed before Safari check to ensure Firefox on Android is detected
  } else if (typeof InstallTrigger !== 'undefined' || navigator.userAgent.indexOf('irefox') > 0) {
    hasMatch = navigator.userAgent.match(/Firefox\/([0-9]+)\./) || [];

    window.webrtcDetectedBrowser   = 'firefox';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcMinimumVersion    = 33;
    window.webrtcDetectedType      = 'moz';
    window.webrtcDetectedDCSupport = 'SCTP';

  // Detect Chrome (1+ and mobile)
  // Placed before Safari check to ensure Chrome on Android is detected
  } else if ((!!window.chrome && !!window.chrome.webstore) || navigator.userAgent.indexOf('Chrom') > 0) {
    hasMatch = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./i) || [];

    window.webrtcDetectedBrowser   = 'chrome';
    window.webrtcDetectedVersion   = parseInt(hasMatch[2] || '0', 10);
    window.webrtcMinimumVersion    = 38;
    window.webrtcDetectedType      = 'webkit';
    window.webrtcDetectedDCSupport = window.webrtcDetectedVersion > 30 ? 'SCTP' : 'RTP'; // Chrome 31+ supports SCTP without flags

  // Detect Safari
  } else if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification) || navigator.userAgent.match(/AppleWebKit\/(\d+)\./) || navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
    hasMatch = navigator.userAgent.match(/version\/(\d+)\.(\d+)/i) || [];
    var AppleWebKitBuild = navigator.userAgent.match(/AppleWebKit\/(\d+)/i) || [];

    var isMobile      = navigator.userAgent.match(/(iPhone|iPad)/gi);
    var hasNativeImpl = AppleWebKitBuild.length >= 1 && AppleWebKitBuild[1] >= 604;
    window.webrtcDetectedBrowser   = 'safari';
    window.webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    window.webrtcDetectedMinorVersion = parseInt(hasMatch[2] || '0', 10);
    window.webrtcMinimumVersion    = 7;
    if (isMobile) {
      window.webrtcDetectedType    = hasNativeImpl ? 'AppleWebKit' : null;
    } else { // desktop
      var majorVersion = window.webrtcDetectedVersion;
      var minorVersion = parseInt(hasMatch[2] || '0', 10);
      var nativeImplIsOverridable = majorVersion == 11 && minorVersion < 2;
      window.webrtcDetectedType    = hasNativeImpl && !(AdapterJS.options.forceSafariPlugin && nativeImplIsOverridable) ? 'AppleWebKit' : 'plugin';
    }
    window.webrtcDetectedDCSupport = 'SCTP';
  }

  // Scope it to AdapterJS and window for better consistency
  AdapterJS.webrtcDetectedBrowser   = window.webrtcDetectedBrowser;
  AdapterJS.webrtcDetectedVersion   = window.webrtcDetectedVersion;
  AdapterJS.webrtcMinimumVersion    = window.webrtcMinimumVersion;
  AdapterJS.webrtcDetectedType      = window.webrtcDetectedType;
  AdapterJS.webrtcDetectedDCSupport = window.webrtcDetectedDCSupport;
  AdapterJS.webrtcDetectedMinorVersion = window.webrtcDetectedMinorVersion;
};

AdapterJS.addEvent = function(elem, evnt, func) {
  if (elem.addEventListener) { // W3C DOM
    elem.addEventListener(evnt, func, false);
  } else if (elem.attachEvent) {// OLD IE DOM
    elem.attachEvent('on'+evnt, func);
  } else { // No much to do
    elem[evnt] = func;
  }
};
// -----------------------------------------------------------
// Detected webrtc implementation. Types are:
// - 'moz': Mozilla implementation of webRTC.
// - 'webkit': WebKit implementation of webRTC.
// - 'plugin': Using the plugin implementation.
webrtcDetectedType = null;

// Set the settings for creating DataChannels, MediaStream for
// Cross-browser compability.
// - This is only for SCTP based support browsers.
// the 'urls' attribute.
checkMediaDataChannelSettings =
  function (peerBrowserAgent, peerBrowserVersion, callback, constraints) {
  if (typeof callback !== 'function') {
    return;
  }
  var beOfferer = true;
  var isLocalFirefox = AdapterJS.webrtcDetectedBrowser === 'firefox';
  // Nightly version does not require MozDontOfferDataChannel for interop
  var isLocalFirefoxInterop = AdapterJS.webrtcDetectedType === 'moz' && AdapterJS.webrtcDetectedVersion > 30;
  var isPeerFirefox = peerBrowserAgent === 'firefox';
  var isPeerFirefoxInterop = peerBrowserAgent === 'firefox' &&
    ((peerBrowserVersion) ? (peerBrowserVersion > 30) : false);

  // Resends an updated version of constraints for MozDataChannel to work
  // If other userAgent is firefox and user is firefox, remove MozDataChannel
  if ((isLocalFirefox && isPeerFirefox) || (isLocalFirefoxInterop)) {
    try {
      delete constraints.mandatory.MozDontOfferDataChannel;
    } catch (error) {
      console.error('Failed deleting MozDontOfferDataChannel');
      console.error(error);
    }
  } else if ((isLocalFirefox && !isPeerFirefox)) {
    constraints.mandatory.MozDontOfferDataChannel = true;
  }
  if (!isLocalFirefox) {
    // temporary measure to remove Moz* constraints in non Firefox browsers
    for (var prop in constraints.mandatory) {
      if (constraints.mandatory.hasOwnProperty(prop)) {
        if (prop.indexOf('Moz') !== -1) {
          delete constraints.mandatory[prop];
        }
      }
    }
  }
  // Firefox (not interopable) cannot offer DataChannel as it will cause problems to the
  // interopability of the media stream
  if (isLocalFirefox && !isPeerFirefox && !isLocalFirefoxInterop) {
    beOfferer = false;
  }
  callback(beOfferer, constraints);
};

// Handles the differences for all browsers ice connection state output.
// - Tested outcomes are:
//   - Chrome (offerer)  : 'checking' > 'completed' > 'completed'
//   - Chrome (answerer) : 'checking' > 'connected'
//   - Firefox (offerer) : 'checking' > 'connected'
//   - Firefox (answerer): 'checking' > 'connected'
checkIceConnectionState = function (peerId, iceConnectionState, callback) {
  if (typeof callback !== 'function') {
    console.warn('No callback specified in checkIceConnectionState. Aborted.');
    return;
  }
  peerId = (peerId) ? peerId : 'peer';

  if (!AdapterJS._iceConnectionFiredStates[peerId] ||
    iceConnectionState === AdapterJS._iceConnectionStates.disconnected ||
    iceConnectionState === AdapterJS._iceConnectionStates.failed ||
    iceConnectionState === AdapterJS._iceConnectionStates.closed) {
    AdapterJS._iceConnectionFiredStates[peerId] = [];
  }
  iceConnectionState = AdapterJS._iceConnectionStates[iceConnectionState];
  if (AdapterJS._iceConnectionFiredStates[peerId].indexOf(iceConnectionState) < 0) {
    AdapterJS._iceConnectionFiredStates[peerId].push(iceConnectionState);
    if (iceConnectionState === AdapterJS._iceConnectionStates.connected) {
      setTimeout(function () {
        AdapterJS._iceConnectionFiredStates[peerId]
          .push(AdapterJS._iceConnectionStates.done);
        callback(AdapterJS._iceConnectionStates.done);
      }, 1000);
    }
    callback(iceConnectionState);
  }
  return;
};

// Firefox:
// - Creates iceServer from the url for Firefox.
// - Create iceServer with stun url.
// - Create iceServer with turn url.
//   - Ignore the transport parameter from TURN url for FF version <=27.
//   - Return null for createIceServer if transport=tcp.
// - FF 27 and above supports transport parameters in TURN url,
// - So passing in the full url to create iceServer.
// Chrome:
// - Creates iceServer from the url for Chrome M33 and earlier.
//   - Create iceServer with stun url.
//   - Chrome M28 & above uses below TURN format.
// Plugin:
// - Creates Ice Server for Plugin Browsers
//   - If Stun - Create iceServer with stun url.
//   - Else - Create iceServer with turn url
//   - This is a WebRTC Function
createIceServer = null;

// Firefox:
// - Creates IceServers for Firefox
//   - Use .url for FireFox.
//   - Multiple Urls support
// Chrome:
// - Creates iceServers from the urls for Chrome M34 and above.
//   - .urls is supported since Chrome M34.
//   - Multiple Urls support
// Plugin:
// - Creates Ice Servers for Plugin Browsers
//   - Multiple Urls support
//   - This is a WebRTC Function
createIceServers = null;
//------------------------------------------------------------

//Creates MediaStream object.
MediaStream = (typeof MediaStream === 'function') ? MediaStream : null;

//The RTCPeerConnection object.
RTCPeerConnection = (typeof RTCPeerConnection === 'function') ?
  RTCPeerConnection : null;

// Creates RTCSessionDescription object for Plugin Browsers
RTCSessionDescription = (typeof RTCSessionDescription === 'function') ?
  RTCSessionDescription : null;

// Creates RTCIceCandidate object for Plugin Browsers
RTCIceCandidate = (typeof RTCIceCandidate === 'function') ?
  RTCIceCandidate : null;

// Get UserMedia (only difference is the prefix).
// Code from Adam Barth.
getUserMedia = null;

// Attach a media stream to an element.
attachMediaStream = null;

// Re-attach a media stream to an element.
reattachMediaStream = null;


// Detected browser agent name. Types are:
// - 'firefox': Firefox browser.
// - 'chrome': Chrome browser.
// - 'opera': Opera browser.
// - 'safari': Safari browser.
// - 'IE' - Internet Explorer browser.
webrtcDetectedBrowser = null;
webrtcDetectedMinorVersion = null;

// Detected browser version.
webrtcDetectedVersion = null;

// The minimum browser version still supported by AJS.
webrtcMinimumVersion  = null;

// The type of DC supported by the browser
webrtcDetectedDCSupport = null;

// The requestUserMedia used by plugin gUM
requestUserMedia = null;

// Check for browser types and react accordingly
AdapterJS.parseWebrtcDetectedBrowser();
if (['webkit', 'moz', 'ms', 'AppleWebKit'].indexOf(AdapterJS.webrtcDetectedType) > -1) {

  ///////////////////////////////////////////////////////////////////
  // INJECTION OF GOOGLE'S ADAPTER.JS CONTENT

  // Store the original native RTCPC in msRTCPeerConnection object
  if (navigator.userAgent.match(/Edge\/(\d+).(\d+)$/) && window.RTCPeerConnection) {
    window.msRTCPeerConnection = window.RTCPeerConnection;
  }

/* jshint ignore:start */
@Goo@include('node_modules/webrtc-adapter/out/adapter.js', {})
/* jshint ignore:end */

  // END OF INJECTION OF GOOGLE'S ADAPTER.JS CONTENT
  ///////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////
  // EXTENSION FOR CHROME, FIREFOX AND EDGE
  // Includes legacy functions
  // -- createIceServer
  // -- createIceServers
  // -- MediaStreamTrack.getSources
  //
  // and additional shims
  // -- attachMediaStream
  // -- reattachMediaStream
  // -- requestUserMedia
  // -- a call to AdapterJS.maybeThroughWebRTCReady (notifies WebRTC is ready)

  // Add support for legacy functions createIceServer and createIceServers
  if ( navigator.mozGetUserMedia ) {
    // Shim for MediaStreamTrack.getSources.
    MediaStreamTrack.getSources = function(successCb) {
      setTimeout(function() {
        var infos = [
          { kind: 'audio', id: 'default', label:'', facing:'' },
          { kind: 'video', id: 'default', label:'', facing:'' }
        ];
        successCb(infos);
      }, 0);
    };

    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      element.srcObject = stream;
      return element;
    };

    reattachMediaStream = function(to, from) {
      to.srcObject = from.srcObject;
      return to;
    };

    createIceServer = function (url, username, password) {
      console.warn('createIceServer is deprecated. It should be replaced with an application level implementation.');
      // Note: Google's import of AJS will auto-reverse to 'url': '...' for FF < 38

      var iceServer = null;
      var urlParts = url.split(':');
      if (urlParts[0].indexOf('stun') === 0) {
        iceServer = { urls : [url] };
      } else if (urlParts[0].indexOf('turn') === 0) {
        if (AdapterJS.webrtcDetectedVersion < 27) {
          var turnUrlParts = url.split('?');
          if (turnUrlParts.length === 1 ||
            turnUrlParts[1].indexOf('transport=udp') === 0) {
            iceServer = {
              urls : [turnUrlParts[0]],
              credential : password,
              username : username
            };
          }
        } else {
          iceServer = {
            urls : [url],
            credential : password,
            username : username
          };
        }
      }getUserMedia
      return iceServer;
    };

    createIceServers = function (urls, username, password) {
      console.warn('createIceServers is deprecated. It should be replaced with an application level implementation.');

      var iceServers = [];
      for (i = 0; i < urls.length; i++) {
        var iceServer = createIceServer(urls[i], username, password);
        if (iceServer !== null) {
          iceServers.push(iceServer);
        }
      }
      return iceServers;
    };
  } else if ( navigator.webkitGetUserMedia ) {
    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      if (AdapterJS.webrtcDetectedVersion >= 43) {
        element.srcObject = stream;
      } else if (typeof element.src !== 'undefined') {
        element.src = URL.createObjectURL(stream);
      } else {
        console.error('Error attaching stream to element.');
        // logging('Error attaching stream to element.');
      }
      return element;
    };

    reattachMediaStream = function(to, from) {
      if (AdapterJS.webrtcDetectedVersion >= 43) {
        to.srcObject = from.srcObject;
      } else {
        to.src = from.src;
      }
      return to;
    };

    createIceServer = function (url, username, password) {
      console.warn('createIceServer is deprecated. It should be replaced with an application level implementation.');

      var iceServer = null;
      var urlParts = url.split(':');
      if (urlParts[0].indexOf('stun') === 0) {
        iceServer = { 'url' : url };
      } else if (urlParts[0].indexOf('turn') === 0) {
        iceServer = {
          'url' : url,
          'credential' : password,
          'username' : username
        };
      }
      return iceServer;
    };

    createIceServers = function (urls, username, password) {
      console.warn('createIceServers is deprecated. It should be replaced with an application level implementation.');

      var iceServers = [];
      if (AdapterJS.webrtcDetectedVersion >= 34) {
        iceServers = {
          'urls' : urls,
          'credential' : password,
          'username' : username
        };
      } else {
        for (i = 0; i < urls.length; i++) {
          var iceServer = createIceServer(urls[i], username, password);
          if (iceServer !== null) {
            iceServers.push(iceServer);
          }
        }
      }
      return iceServers;
    };
  } else if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    attachMediaStream = function(element, stream) {
      element.srcObject = stream;
      return element;
    };
    reattachMediaStream = function(to, from) {
      to.srcObject = from.srcObject;
      return to;
    };

    // Polyfill getUserMedia()
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.getUserMedia = getUserMedia = function (constraints, successCb, errorCb) {
        navigator.mediaDevices.getUserMedia(constraints).then(successCb).catch(errorCb);
      };
    }
  } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      element.srcObject = stream;
      return element;
    };

    reattachMediaStream = function(to, from) {
      to.srcObject = from.srcObject;
      return to;
    };
  }

  // Need to override attachMediaStream and reattachMediaStream
  // to support the plugin's logic
  var attachMediaStream_base = attachMediaStream;

  if (AdapterJS.webrtcDetectedBrowser === 'opera') {
    attachMediaStream_base = function (element, stream) {
      if (AdapterJS.webrtcDetectedVersion > 38) {
        element.srcObject = stream;
      } else if (typeof element.src !== 'undefined') {
        element.src = URL.createObjectURL(stream);
      }
      // Else it doesn't work
    };
  }

  attachMediaStream = function (element, stream) {
    if ((AdapterJS.webrtcDetectedBrowser === 'chrome' ||
         AdapterJS.webrtcDetectedBrowser === 'opera') &&
        !stream) {
      // Chrome does not support "src = null"
      element.src = '';
    } else {
      attachMediaStream_base(element, stream);
    }
    return element;
  };
  var reattachMediaStream_base = reattachMediaStream;
  reattachMediaStream = function (to, from) {
    reattachMediaStream_base(to, from);
    return to;
  };

  // Propagate attachMediaStream and gUM in window and AdapterJS
  window.attachMediaStream      = attachMediaStream;
  window.reattachMediaStream    = reattachMediaStream;
  window.getUserMedia           = function(constraints, onSuccess, onFailure) {
    navigator.getUserMedia(constraints, onSuccess, onFailure);
  };
  AdapterJS.attachMediaStream   = attachMediaStream;
  AdapterJS.reattachMediaStream = reattachMediaStream;
  AdapterJS.getUserMedia        = getUserMedia;

  // Removed Google defined promises when promise is not defined
  if (typeof Promise === 'undefined') {
    requestUserMedia = null;
  }

  AdapterJS.maybeThroughWebRTCReady();

  // END OF EXTENSION OF CHROME, FIREFOX AND EDGE
  ///////////////////////////////////////////////////////////////////

} else { // TRY TO USE PLUGIN

  ///////////////////////////////////////////////////////////////////
  // WEBRTC PLUGIN SHIM
  // Will automatically check if the plugin is available and inject it
  // into the DOM if it is.
  // When the plugin is not available, will prompt a banner to suggest installing it
  // Use AdapterJS.options.hidePluginInstallPrompt to prevent this banner from popping
  //
  // Shims the follwing:
  // -- getUserMedia
  // -- MediaStream
  // -- MediaStreamTrack
  // -- MediaStreamTrack.getSources
  // -- RTCPeerConnection
  // -- RTCSessionDescription
  // -- RTCIceCandidate
  // -- createIceServer
  // -- createIceServers
  // -- attachMediaStream
  // -- reattachMediaStream
  // -- webrtcDetectedBrowser
  // -- webrtcDetectedVersion

  // IE 9 is not offering an implementation of console.log until you open a console
  if (typeof console !== 'object' || typeof console.log !== 'function') {
    /* jshint -W020 */
    console = {} || console;
    // Implemented based on console specs from MDN
    // You may override these functions
    console.log = function (arg) {};
    console.info = function (arg) {};
    console.error = function (arg) {};
    console.dir = function (arg) {};
    console.exception = function (arg) {};
    console.trace = function (arg) {};
    console.warn = function (arg) {};
    console.count = function (arg) {};
    console.debug = function (arg) {};
    console.count = function (arg) {};
    console.time = function (arg) {};
    console.timeEnd = function (arg) {};
    console.group = function (arg) {};
    console.groupCollapsed = function (arg) {};
    console.groupEnd = function (arg) {};
    /* jshint +W020 */
  }

  /* jshint -W035 */
  AdapterJS.WebRTCPlugin.WaitForPluginReady = function() {
    while (AdapterJS.WebRTCPlugin.pluginState !== AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY) {
      /* empty because it needs to prevent the function from running. */
    }
  };
  /* jshint +W035 */

  AdapterJS.WebRTCPlugin.callWhenPluginReady = function (callback) {
    if (AdapterJS.WebRTCPlugin.pluginState === AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY) {
      // Call immediately if possible
      // Once the plugin is set, the code will always take this path
      callback();
    } else {
      // otherwise start a 100ms interval
      var checkPluginReadyState = setInterval(function () {
        if (AdapterJS.WebRTCPlugin.pluginState === AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY) {
          clearInterval(checkPluginReadyState);
          callback();
        }
      }, 100);
    }
  };

  AdapterJS.WebRTCPlugin.setLogLevel = function(logLevel) {
    AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
      AdapterJS.WebRTCPlugin.plugin.setLogLevel(logLevel);
    });
  };

  AdapterJS.WebRTCPlugin.injectPlugin = function () {
    // only inject once the page is ready
    if (!AdapterJS.documentReady()) {
      return;
    }

    // Prevent multiple injections
    if (AdapterJS.WebRTCPlugin.pluginState !== AdapterJS.WebRTCPlugin.PLUGIN_STATES.INITIALIZING) {
      return;
    }

    AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.INJECTING;

    var existing = document.getElementById(AdapterJS.WebRTCPlugin.pluginInfo.pluginId);
    if (!!existing) {
      // There is already a plugin injected in the DOM.
      // Probably from multiple calls to node's requirecopy(AJS);
      // Take the existing one, and make it this AJS's plugin
      AdapterJS.WebRTCPlugin.plugin = existing;
      AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.INJECTED;
      if (AdapterJS.WebRTCPlugin.plugin.valid) {
        window[AdapterJS.WebRTCPlugin.pluginInfo.onload](); // call onload function to unlock AJS
      } else {
        // wait for plugin.valid with an interval
        var pluginValidInterval = setInterval(function () {
          if (AdapterJS.WebRTCPlugin.plugin.valid) {
            clearInterval(pluginValidInterval);
            window[AdapterJS.WebRTCPlugin.pluginInfo.onload](); // call onload function to unlock AJS
          }
        }, 100);
      }
      return;
    }

    if (AdapterJS.webrtcDetectedBrowser === 'IE' && AdapterJS.webrtcDetectedVersion <= 10) {
      var frag = document.createDocumentFragment();
      AdapterJS.WebRTCPlugin.plugin = document.createElement('div');
      AdapterJS.WebRTCPlugin.plugin.innerHTML = '<object id="' +
        AdapterJS.WebRTCPlugin.pluginInfo.pluginId + '" type="' +
        AdapterJS.WebRTCPlugin.pluginInfo.type + '" ' + 'width="1" height="1">' +
        '<param name="pluginId" value="' +
        AdapterJS.WebRTCPlugin.pluginInfo.pluginId + '" /> ' +
        '<param name="windowless" value="false" /> ' +
        '<param name="pageId" value="' + AdapterJS.WebRTCPlugin.pageId + '" /> ' +
        '<param name="onload" value="' + AdapterJS.WebRTCPlugin.pluginInfo.onload + '" />' +
        '<param name="tag" value="' + AdapterJS.WebRTCPlugin.TAGS.NONE + '" />' +
        // uncomment to be able to use virtual cams
        (AdapterJS.options.getAllCams ? '<param name="forceGetAllCams" value="True" />':'') +

        '</object>';
      while (AdapterJS.WebRTCPlugin.plugin.firstChild) {
        frag.appendChild(AdapterJS.WebRTCPlugin.plugin.firstChild);
      }
      document.body.appendChild(frag);

      // Need to re-fetch the plugin
      AdapterJS.WebRTCPlugin.plugin =
        document.getElementById(AdapterJS.WebRTCPlugin.pluginInfo.pluginId);
    } else {
      // Load Plugin
      AdapterJS.WebRTCPlugin.plugin = document.createElement('object');
      AdapterJS.WebRTCPlugin.plugin.id =
        AdapterJS.WebRTCPlugin.pluginInfo.pluginId;
      // IE will only start the plugin if it's ACTUALLY visible
      if (AdapterJS.webrtcDetectedBrowser === 'IE') {
        AdapterJS.WebRTCPlugin.plugin.width = '1px';
        AdapterJS.WebRTCPlugin.plugin.height = '1px';
      } else { // The size of the plugin on Safari should be 0x0px
              // so that the autorisation prompt is at the top
        AdapterJS.WebRTCPlugin.plugin.width = '0px';
        AdapterJS.WebRTCPlugin.plugin.height = '0px';
      }
      AdapterJS.WebRTCPlugin.plugin.type = AdapterJS.WebRTCPlugin.pluginInfo.type;
      AdapterJS.WebRTCPlugin.plugin.innerHTML = '<param name="onload" value="' +
        AdapterJS.WebRTCPlugin.pluginInfo.onload + '">' +
        '<param name="pluginId" value="' +
        AdapterJS.WebRTCPlugin.pluginInfo.pluginId + '">' +
        '<param name="windowless" value="false" /> ' +
        (AdapterJS.options.getAllCams ? '<param name="forceGetAllCams" value="True" />':'') +
        '<param name="pageId" value="' + AdapterJS.WebRTCPlugin.pageId + '">' +
        '<param name="tag" value="' + AdapterJS.WebRTCPlugin.TAGS.NONE + '" />';
      document.body.appendChild(AdapterJS.WebRTCPlugin.plugin);
    }


    AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.INJECTED;
  };

  AdapterJS.WebRTCPlugin.isPluginInstalled =
    function (comName, plugName, plugType, installedCb, notInstalledCb) {
    if (AdapterJS.webrtcDetectedBrowser !== 'IE') {
      var pluginArray = navigator.mimeTypes;
      for (var i = 0; i < pluginArray.length; i++) {
        if (pluginArray[i].type.indexOf(plugType) >= 0) {
          installedCb();
          return;
        }
      }
      notInstalledCb();
    } else {
      try {
        var axo = new ActiveXObject(comName + '.' + plugName);
      } catch (e) {
        notInstalledCb();
        return;
      }
      installedCb();
    }
  };

  AdapterJS.WebRTCPlugin.defineWebRTCInterface = function () {
    if (AdapterJS.WebRTCPlugin.pluginState ===
        AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY) {
      console.error('AdapterJS - WebRTC interface has already been defined');
      return;
    }

    AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.INITIALIZING;

    AdapterJS.isDefined = function (variable) {
      return variable !== null && variable !== undefined;
    };

    ////////////////////////////////////////////////////////////////////////////
    /// CreateIceServer
    ////////////////////////////////////////////////////////////////////////////
    createIceServer = function (url, username, password) {
      var iceServer = null;
      var urlParts = url.split(':');
      if (urlParts[0].indexOf('stun') === 0) {
        iceServer = {
          'url' : url,
          'hasCredentials' : false
        };
      } else if (urlParts[0].indexOf('turn') === 0) {
        iceServer = {
          'url' : url,
          'hasCredentials' : true,
          'credential' : password,
          'username' : username
        };
      }
      return iceServer;
    };

    ////////////////////////////////////////////////////////////////////////////
    /// CreateIceServers
    ////////////////////////////////////////////////////////////////////////////
    createIceServers = function (urls, username, password) {
      var iceServers = [];
      for (var i = 0; i < urls.length; ++i) {
        iceServers.push(createIceServer(urls[i], username, password));
      }
      return iceServers;
    };

    ////////////////////////////////////////////////////////////////////////////
    /// RTCSessionDescription
    ////////////////////////////////////////////////////////////////////////////
    RTCSessionDescription = function (info) {
      AdapterJS.WebRTCPlugin.WaitForPluginReady();
      return AdapterJS.WebRTCPlugin.plugin.
        ConstructSessionDescription(info.type, info.sdp);
    };

    ////////////////////////////////////////////////////////////////////////////
    /// MediaStream
    ////////////////////////////////////////////////////////////////////////////
    MediaStream = function (mediaStreamOrTracks) {
      AdapterJS.WebRTCPlugin.WaitForPluginReady();
      return AdapterJS.WebRTCPlugin.plugin.MediaStream(mediaStreamOrTracks);
    }

    ////////////////////////////////////////////////////////////////////////////
    /// RTCPeerConnection
    ////////////////////////////////////////////////////////////////////////////
    RTCPeerConnection = function (servers, constraints) {
      // Validate server argumenr
      if (!(servers === undefined ||
            servers === null ||
            Array.isArray(servers.iceServers))) {
        throw new Error('Failed to construct \'RTCPeerConnection\': Malformed RTCConfiguration');
      }

      // Validate constraints argument
      if (typeof constraints !== 'undefined' && constraints !== null) {
        var invalidConstraits = false;
        invalidConstraits |= typeof constraints !== 'object';
        invalidConstraits |= constraints.hasOwnProperty('mandatory') &&
                              constraints.mandatory !== undefined &&
                              constraints.mandatory !== null &&
                              constraints.mandatory.constructor !== Object;
        invalidConstraits |= constraints.hasOwnProperty('optional') &&
                              constraints.optional !== undefined &&
                              constraints.optional !== null &&
                              !Array.isArray(constraints.optional);
        if (invalidConstraits) {
          throw new Error('Failed to construct \'RTCPeerConnection\': Malformed constraints object');
        }
      }

      // Call relevant PeerConnection constructor according to plugin version
      AdapterJS.WebRTCPlugin.WaitForPluginReady();

      // RTCPeerConnection prototype from the old spec
      var iceServers = null;
      if (servers && Array.isArray(servers.iceServers)) {
        iceServers = servers.iceServers;
        for (var i = 0; i < iceServers.length; i++) {
          // Legacy plugin versions compatibility
          if (iceServers[i].urls && !iceServers[i].url) {
            iceServers[i].url = iceServers[i].urls;
          }
          iceServers[i].hasCredentials = AdapterJS.
            isDefined(iceServers[i].username) &&
            AdapterJS.isDefined(iceServers[i].credential);
        }
      }

      if (AdapterJS.WebRTCPlugin.plugin.PEER_CONNECTION_VERSION &&
          AdapterJS.WebRTCPlugin.plugin.PEER_CONNECTION_VERSION > 1) {
        // RTCPeerConnection prototype from the new spec
        if (iceServers) {
          servers.iceServers = iceServers;
        }
        return AdapterJS.WebRTCPlugin.plugin.PeerConnection(servers);
      } else {
        var mandatory = (constraints && constraints.mandatory) ?
          constraints.mandatory : null;
        var optional = (constraints && constraints.optional) ?
          constraints.optional : null;
        return AdapterJS.WebRTCPlugin.plugin.
          PeerConnection(AdapterJS.WebRTCPlugin.pageId,
          iceServers, mandatory, optional);
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    /// MediaStreamTrack
    ////////////////////////////////////////////////////////////////////////////
    MediaStreamTrack = function(){};
    MediaStreamTrack.getSources = function (callback) {
      AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
        AdapterJS.WebRTCPlugin.plugin.GetSources(callback);
      });
    };

    // getUserMedia constraints shim.
    // Copied from Chrome
    var constraintsToPlugin = function(c) {
      if (typeof c !== 'object' || c.mandatory || c.optional) {
        return c;
      }
      var cc = {};
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced') {
          return;
        }
        if (typeof c[key] === 'string') {
          cc[key] = c[key];
          return;
        }
        var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
        if (r.exact !== undefined && typeof r.exact === 'number') {
          r.min = r.max = r.exact;
        }
        var oldname = function(prefix, name) {
          if (prefix) {
            return prefix + name.charAt(0).toUpperCase() + name.slice(1);
          }
          return (name === 'deviceId') ? 'sourceId' : name;
        };

        // HACK : Specially handling: if deviceId is an object with exact property,
        //          change it such that deviceId value is not in exact property
        // Reason : AJS-286 (deviceId in WebRTC samples not in the format specified as specifications)
        if ( oldname('', key) === 'sourceId' && r.exact !== undefined ) {
          r.ideal = r.exact;
          r.exact = undefined;
        }

        if (r.ideal !== undefined) {
          cc.optional = cc.optional || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[oldname('min', key)] = r.ideal;
            cc.optional.push(oc);
            oc = {};
            oc[oldname('max', key)] = r.ideal;
            cc.optional.push(oc);
          } else {
            oc[oldname('', key)] = r.ideal;
            cc.optional.push(oc);
          }
        }
        if (r.exact !== undefined && typeof r.exact !== 'number') {
          cc.mandatory = cc.mandatory || {};
          cc.mandatory[oldname('', key)] = r.exact;
        } else {
          ['min', 'max'].forEach(function(mix) {
            if (r[mix] !== undefined) {
              cc.mandatory = cc.mandatory || {};
              cc.mandatory[oldname(mix, key)] = r[mix];
            }
          });
        }
      });
      if (c.advanced) {
        cc.optional = (cc.optional || []).concat(c.advanced);
      }
      return cc;
    };

    ////////////////////////////////////////////////////////////////////////////
    /// getUserMedia
    ////////////////////////////////////////////////////////////////////////////
    getUserMedia = function (constraints, successCallback, failureCallback) {
      var cc = {};
      cc.audio = constraints.audio ?
        constraintsToPlugin(constraints.audio) : false;
      cc.video = constraints.video ?
        constraintsToPlugin(constraints.video) : false;

      AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
        AdapterJS.WebRTCPlugin.plugin.
          getUserMedia(cc, successCallback, failureCallback);
      });
    };
    window.navigator.getUserMedia = getUserMedia;

    ////////////////////////////////////////////////////////////////////////////
    /// mediaDevices
    ////////////////////////////////////////////////////////////////////////////
    if (typeof Promise !== 'undefined') {
      requestUserMedia = function(constraints) {
        return new Promise(function(resolve, reject) {
          try {
            getUserMedia(constraints, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };
      if (typeof(navigator.mediaDevices) === 'undefined')
        navigator.mediaDevices = {};
      navigator.mediaDevices.getUserMedia = requestUserMedia;
      navigator.mediaDevices.enumerateDevices = function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                      kind: kinds[device.kind],
                      id: device.id,
                      deviceId: device.id,
                      groupId: ''};
            }));
          });
        });
      };
    }

    ////////////////////////////////////////////////////////////////////////////
    /// attachMediaStream
    ////////////////////////////////////////////////////////////////////////////
    attachMediaStream = function (element, stream) {
      if (!element || !element.parentNode) {
        return;
      }

      var streamId;
      if (stream === null) {
        streamId = '';
      } else {
        if (typeof stream.enableSoundTracks !== 'undefined') {
          stream.enableSoundTracks(true);
        }
        streamId = stream.id;
      }

      var elementId = element.id.length === 0 ? Math.random().toString(36).slice(2) : element.id;
      var nodeName = element.nodeName.toLowerCase();
      if (nodeName !== 'object') { // not a plugin <object> tag yet
        var tag;
        switch(nodeName) {
          case 'audio':
            tag = AdapterJS.WebRTCPlugin.TAGS.AUDIO;
            break;
          case 'video':
            tag = AdapterJS.WebRTCPlugin.TAGS.VIDEO;
            break;
          default:
            tag = AdapterJS.WebRTCPlugin.TAGS.NONE;
          }

        var frag = document.createDocumentFragment();
        var temp = document.createElement('div');
        var classHTML = '';
        if (element.className) {
          classHTML = 'class="' + element.className + '" ';
        } else if (element.attributes && element.attributes['class']) {
          classHTML = 'class="' + element.attributes['class'].value + '" ';
        }

        temp.innerHTML = '<object id="' + elementId + '" ' + classHTML +
          'type="' + AdapterJS.WebRTCPlugin.pluginInfo.type + '">' +
          '<param name="pluginId" value="' + elementId + '" /> ' +
          '<param name="pageId" value="' + AdapterJS.WebRTCPlugin.pageId + '" /> ' +
          '<param name="windowless" value="true" /> ' +
          '<param name="streamId" value="' + streamId + '" /> ' +
          '<param name="tag" value="' + tag + '" /> ' +
          '</object>';
        while (temp.firstChild) {
          frag.appendChild(temp.firstChild);
        }

        var height = '';
        var width = '';
        if (element.clientWidth || element.clientHeight) {
          width = element.clientWidth;
          height = element.clientHeight;
        }
        else if (element.width || element.height) {
          width = element.width;
          height = element.height;
        }

        element.parentNode.insertBefore(frag, element);
        frag = document.getElementById(elementId);
        frag.width = width;
        frag.height = height;
        element.parentNode.removeChild(element);
      } else { // already an <object> tag, just change the stream id
        var children = element.children;
        for (var i = 0; i !== children.length; ++i) {
          if (children[i].name === 'streamId') {
            children[i].value = streamId;
            break;
          }
        }
        element.setStreamId(streamId);
      }
      var newElement = document.getElementById(elementId);
      AdapterJS.forwardEventHandlers(newElement, element, Object.getPrototypeOf(element));

      return newElement;
    };

    ////////////////////////////////////////////////////////////////////////////
    /// reattachMediaStream
    ////////////////////////////////////////////////////////////////////////////
    reattachMediaStream = function (to, from) {
      var stream = null;
      var children = from.children;
      for (var i = 0; i !== children.length; ++i) {
        if (children[i].name === 'streamId') {
          AdapterJS.WebRTCPlugin.WaitForPluginReady();
          stream = AdapterJS.WebRTCPlugin.plugin
            .getStreamWithId(AdapterJS.WebRTCPlugin.pageId, children[i].value);
          break;
        }
      }
      if (stream !== null) {
        return attachMediaStream(to, stream);
      } else {
        console.log('Could not find the stream associated with this element');
      }
    };

    // Propagate attachMediaStream and gUM in window and AdapterJS
    window.attachMediaStream      = attachMediaStream;
    window.reattachMediaStream    = reattachMediaStream;
    window.getUserMedia           = getUserMedia;
    AdapterJS.attachMediaStream   = attachMediaStream;
    AdapterJS.reattachMediaStream = reattachMediaStream;
    AdapterJS.getUserMedia        = getUserMedia;

    AdapterJS.forwardEventHandlers = function (destElem, srcElem, prototype) {
      var properties = Object.getOwnPropertyNames( prototype );
      for(var prop in properties) {
        if (prop) {
          var propName = properties[prop];

          if (typeof propName.slice === 'function' &&
              propName.slice(0,2) === 'on' &&
              typeof srcElem[propName] === 'function') {
              AdapterJS.addEvent(destElem, propName.slice(2), srcElem[propName]);
          }
        }
      }
      var subPrototype = Object.getPrototypeOf(prototype);
      if(!!subPrototype) {
        AdapterJS.forwardEventHandlers(destElem, srcElem, subPrototype);
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    /// RTCIceCandidate
    ////////////////////////////////////////////////////////////////////////////
    RTCIceCandidate = function (candidate) {
      if (!candidate.sdpMid) {
        candidate.sdpMid = '';
      }

      AdapterJS.WebRTCPlugin.WaitForPluginReady();
      return AdapterJS.WebRTCPlugin.plugin.ConstructIceCandidate(
        candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate
      );
    };

    // inject plugin
    AdapterJS.addEvent(document, 'readystatechange', AdapterJS.WebRTCPlugin.injectPlugin);
    AdapterJS.WebRTCPlugin.injectPlugin();
  };

  // This function will be called if the plugin is needed (browser different
  // from Chrome or Firefox), but the plugin is not installed.
  AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCb = AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCb ||
    function() {
      AdapterJS.addEvent(document,
                        'readystatechange',
                         AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCbPriv);
      AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCbPriv();
    };

  AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCbPriv = function () {
    if (AdapterJS.options.hidePluginInstallPrompt) {
      return;
    }
  };


  // Try to detect the plugin and act accordingly
  AdapterJS.WebRTCPlugin.isPluginInstalled(
    AdapterJS.WebRTCPlugin.pluginInfo.prefix,
    AdapterJS.WebRTCPlugin.pluginInfo.plugName,
    AdapterJS.WebRTCPlugin.pluginInfo.type,
    AdapterJS.WebRTCPlugin.defineWebRTCInterface,
    AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCb);

  // END OF WEBRTC PLUGIN SHIM
  ///////////////////////////////////////////////////////////////////
}

// Placed it here so that the module.exports from the browserified
//   adapterjs will not override our AdapterJS exports
// Browserify compatibility
if(typeof exports !== 'undefined') {
  module.exports = AdapterJS;
}

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
    baseGetUserMedia = window.navigator.getUserMedia;

    navigator.getUserMedia = function (constraints, successCb, failureCb) {
      checkIfConstraintsIsValid(constraints, successCb, failureCb);

      // Prevent accessing property from Boolean errors
      if (constraints.video && typeof constraints.video === 'object' &&
        constraints.video.hasOwnProperty('mediaSource')) {
        var updatedConstraints = clone(constraints);
        // See: http://fluffy.github.io/w3c-screen-share/#screen-based-video-constraints
        // See also: https://bugzilla.mozilla.org/show_bug.cgi?id=1037405
        var mediaSourcesList = ['screen', 'window', 'application', 'browser', 'camera'];
        var useExtensionErrors = ['NotAllowedError', 'PermissionDeniedError', 'SecurityError'];

        // Obtain first item in array if array is provided
        if (Array.isArray(updatedConstraints.video.mediaSource)) {
          var i = 0;
          while (i < updatedConstraints.video.mediaSource.length) {
            if (mediaSourcesList.indexOf(updatedConstraints.video.mediaSource[i]) > -1) {
              updatedConstraints.video.mediaSource = updatedConstraints.video.mediaSource[i];
              break;
            }
            i++;
          }
          updatedConstraints.video.mediaSource = typeof updatedConstraints.video.mediaSource === 'string' ?
            updatedConstraints.video.mediaSource : null;
        }

        // Invalid mediaSource for firefox, only specified sources are supported
        if (mediaSourcesList.indexOf(updatedConstraints.video.mediaSource) === -1) {
          failureCb(new Error('GetUserMedia: Only "screen" and "window" are supported as mediaSource constraints'));
          return;
        }

        // Apparently requires document.readyState to be completed before the getUserMedia() could be invoked
        // NOTE: Doesn't make sense but let's keep it that way for now
        var checkIfReady = setInterval(function () {
          if (document.readyState !== 'complete') {
            return;
          }

          clearInterval(checkIfReady);
          updatedConstraints.video.mozMediaSource = updatedConstraints.video.mediaSource;

          baseGetUserMedia(updatedConstraints, successCb, function (error) {
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
            // Firefox 51 and below throws the following errors when screensharing is disabled, in which we can
            //   trigger installation for legacy extension (which no longer can be used) to enable screensharing
            if (useExtensionErrors.indexOf(error.name) > -1 &&
            // Note that "https:" should be required for screensharing
              AdapterJS.webrtcDetectedVersion < 52 && window.parent.location.protocol === 'https:') {
              // Render the notification bar to install legacy Firefox (for 51 and below) extension
              AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION.REQUIRE_INSTALLATION_FF,
                AdapterJS.TEXT.EXTENSION.BUTTON_FF, function (e) {
                // Render the refresh bar once the user clicks to install extension from addons store
                window.open(AdapterJS.extensionInfo.firefox.extensionLink, '_blank');
                if (e.target && e.target.parentElement && e.target.nextElementSibling &&
                  e.target.nextElementSibling.click) {
                  e.target.nextElementSibling.click();
                }
                AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION ?
                  AdapterJS.TEXT.EXTENSION.REQUIRE_REFRESH : AdapterJS.TEXT.REFRESH.REQUIRE_REFRESH,
                  AdapterJS.TEXT.REFRESH.BUTTON, function () {
                  window.open('javascript:location.reload()', '_top');
                });
              });
            } else {
              failureCb(error);
            }
          });
        }, 1);
      // Regular getUserMedia() call
      } else {
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = window.getUserMedia = navigator.getUserMedia;
    // Comment out to prevent recursive errors as webrtc/adapter polyfills navigator.getUserMedia and calls
    //   navigator.mediaDevices.getUserMedia internally
    /*navigator.mediaDevices.getUserMedia = function(constraints) {
      return new Promise(function(resolve, reject) {
        window.getUserMedia(constraints, resolve, reject);
      });
    };*/

  } else if (AdapterJS.webrtcDetectedType === 'webkit') {
    baseGetUserMedia = window.navigator.getUserMedia;
    var iframe = document.createElement('iframe');

    navigator.getUserMedia = function (constraints, successCb, failureCb) {
      checkIfConstraintsIsValid(constraints, successCb, failureCb);

      // Prevent accessing property from Boolean errors
      if (constraints.video && typeof constraints.video === 'object' && constraints.video.hasOwnProperty('mediaSource')) {
        var updatedConstraints = clone(constraints);
        // See: https://developer.chrome.com/extensions/desktopCapture#type-DesktopCaptureSourceType
        var mediaSourcesList = ['window', 'screen', 'tab', 'audio'];

        // Check if it is Android phone for experimental 59 screensharing
        // See: https://bugs.chromium.org/p/chromium/issues/detail?id=487935
        if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
          if (Array.isArray(updatedConstraints.video.mediaSource) ?
            updatedConstraints.video.mediaSource.indexOf('screen') > -1 :
            updatedConstraints.video.mediaSource === 'screen') {
            updatedConstraints.video.mandatory = updatedConstraints.video.mandatory || {};
            updatedConstraints.video.mandatory.chromeMediaSource = 'screen';
            updatedConstraints.video.mandatory.maxHeight = window.screen.height;
            updatedConstraints.video.mandatory.maxWidth = window.screen.width;
            delete updatedConstraints.video.mediaSource;
            baseGetUserMedia(updatedConstraints, successCb, failureCb);
          } else {
            failureCb(new Error('GetUserMedia: Only "screen" are supported as mediaSource constraints for Android'));
          }
          return;
        }

        // Backwards compability for Opera browsers not working when not configured
        if (!(AdapterJS.webrtcDetectedBrowser === 'opera' ? !!AdapterJS.extensionInfo.opera.extensionId :
          AdapterJS.webrtcDetectedBrowser === 'chrome')) {
          failureCb(new Error('Current browser does not support screensharing'));
          return;
        }

        // Check against non valid sources
        if (typeof updatedConstraints.video.mediaSource === 'string' &&
          mediaSourcesList.indexOf(updatedConstraints.video.mediaSource) > -1 &&
          updatedConstraints.video.mediaSource !== 'audio') {
          updatedConstraints.video.mediaSource = [updatedConstraints.video.mediaSource];
        // Loop array and remove invalid sources
        } else if (Array.isArray(updatedConstraints.video.mediaSource)) {
          var i = 0;
          var outputMediaSource = [];
          while (i < mediaSourcesList.length) {
            var j = 0;
            while (j < updatedConstraints.video.mediaSource.length) {
              if (mediaSourcesList[i] === updatedConstraints.video.mediaSource[j]) {
                outputMediaSource.push(updatedConstraints.video.mediaSource[j]);
              }
              j++;
            }
            i++;
          }
          updatedConstraints.video.mediaSource = outputMediaSource;
        } else {
          updatedConstraints.video.mediaSource = [];
        }

        // Check against returning "audio" or ["audio"] without "tab"
        if (updatedConstraints.video.mediaSource.indexOf('audio') > -1 &&
          updatedConstraints.video.mediaSource.indexOf('tab') === -1) {
          failureCb(new Error('GetUserMedia: "audio" mediaSource must be provided with ["audio", "tab"]'));
          return;
        // No valid sources specified
        } else if (updatedConstraints.video.mediaSource.length === 0) {
          failureCb(new Error('GetUserMedia: Only "screen", "window", "tab" are supported as mediaSource constraints'));
          return;
        // Warn users that no tab audio will be used because constraints.audio must be enabled
        } else if (updatedConstraints.video.mediaSource.indexOf('tab') > -1 &&
          updatedConstraints.video.mediaSource.indexOf('audio') > -1 && !updatedConstraints.audio) {
          console.warn('Audio must be requested if "tab" and "audio" mediaSource constraints is requested');
        }

        var fetchStream = function (response) {
          if (response.success) {
            updatedConstraints.video.mandatory = updatedConstraints.video.mandatory || {};
            updatedConstraints.video.mandatory.chromeMediaSource = 'desktop';
            updatedConstraints.video.mandatory.maxWidth = window.screen.width > 1920 ? window.screen.width : 1920;
            updatedConstraints.video.mandatory.maxHeight = window.screen.height > 1080 ? window.screen.height : 1080;
            updatedConstraints.video.mandatory.chromeMediaSourceId = response.sourceId;

            if (Array.isArray(updatedConstraints.video.mediaSource) &&
              updatedConstraints.video.mediaSource.indexOf('tab') > -1 &&
              updatedConstraints.video.mediaSource.indexOf('audio') > -1 && updatedConstraints.audio) {
              updatedConstraints.audio = typeof updatedConstraints.audio === 'object' ? updatedConstraints.audio : {};
              updatedConstraints.audio.mandatory = updatedConstraints.audio.mandatory || {};
              updatedConstraints.audio.mandatory.chromeMediaSource = 'desktop';
              updatedConstraints.audio.mandatory.chromeMediaSourceId = response.sourceId;
            }

            delete updatedConstraints.video.mediaSource;
            baseGetUserMedia(updatedConstraints, successCb, failureCb);
          } else {
            // Extension not installed, trigger to install
            if (response.extensionLink) {
              // Render the notification bar to install extension
              AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION.REQUIRE_INSTALLATION_CHROME,
                AdapterJS.TEXT.EXTENSION.BUTTON_CHROME, function (e) {
                // Render the refresh bar once the user clicks to install extension from addons store
                window.open(response.extensionLink, '_blank');
                if (e.target && e.target.parentElement && e.target.nextElementSibling &&
                  e.target.nextElementSibling.click) {
                  e.target.nextElementSibling.click();
                }
                AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION ?
                  AdapterJS.TEXT.EXTENSION.REQUIRE_REFRESH : AdapterJS.TEXT.REFRESH.REQUIRE_REFRESH,
                  AdapterJS.TEXT.REFRESH.BUTTON, function () {
                  window.open('javascript:location.reload()', '_top');
                });
              });
            }
            failureCb(response.error);
          }
        };

        // Communicate with detectRTC (iframe) method to retrieve source ID
        // Opera browser should not use iframe method
        if (AdapterJS.extensionInfo.chrome.iframeLink && AdapterJS.webrtcDetectedBrowser !== 'opera') {
          iframe.getSourceId(updatedConstraints.video.mediaSource, fetchStream);
        // Communicate with extension directly (needs updated extension code)
        } else {
          var extensionId = AdapterJS.extensionInfo[AdapterJS.webrtcDetectedBrowser === 'opera' ? 'opera' : 'chrome'].extensionId;
          var extensionLink = AdapterJS.extensionInfo[AdapterJS.webrtcDetectedBrowser === 'opera' ? 'opera' : 'chrome'].extensionLink;
          var icon = document.createElement('img');
          icon.src = 'chrome-extension://' + extensionId + '/icon.png';

          icon.onload = function() {
            // Check if extension is enabled, it should return data
            chrome.runtime.sendMessage(extensionId, {
              type: 'get-version'
            }, function (versionRes) {
              // Extension not enabled
              if (!(versionRes && typeof versionRes === 'object' && versionRes.type === 'send-version')) {
                fetchStream({
                  success: false,
                  error: new Error('Extension is disabled')
                });
                return;
              }
              // Retrieve source ID
              chrome.runtime.sendMessage(extensionId, {
                type: 'get-source',
                sources: updatedConstraints.video.mediaSource
              }, function (sourceRes) {
                // Permission denied
                if (!(sourceRes && typeof sourceRes === 'object')) {
                  fetchStream({
                    success: false,
                    error: new Error('Retrieval failed')
                  });
                // Could be cancelled
                } else if (sourceRes.type === 'send-source-error') {
                  fetchStream({
                    success: false,
                    error: new Error('Permission denied for screen retrieval')
                  });
                } else {
                  fetchStream({
                    success: true,
                    sourceId: sourceRes.sourceId
                  });
                }
              });
            });
          };

          // Extension icon didn't load so extension was not installed
          icon.onerror = function () {
            fetchStream({
              success: false,
              error: new Error('Extension not installed'),
              extensionLink: extensionLink
            });
          };
        }
      } else {
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = window.getUserMedia = navigator.getUserMedia;
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return new Promise(function(resolve, reject) {
        try {
          window.getUserMedia(constraints, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    };

    // Start loading the iframe
    if (AdapterJS.webrtcDetectedBrowser === 'chrome') {
      var states = {
        loaded: false,
        error: false
      };

      // Remove previous iframe if it exists
      if (iframe) {
        // Prevent errors thrown when iframe does not exists yet
        try {
          (document.body || document.documentElement).removeChild(iframe);
        } catch (e) {}
      }

      // Do not need to load iframe as it is not requested
      if (!AdapterJS.extensionInfo.chrome.iframeLink) {
        return;
      }

      iframe.onload = function() {
        states.loaded = true;
      };

      iframe.onerror = function () {
        states.error = true;
      };

      iframe.src = AdapterJS.extensionInfo.chrome.iframeLink;
      iframe.style.display = 'none';

      // Listen to iframe messages
      var getSourceIdFromIFrame = function (sources, cb) {
        window.addEventListener('message', function iframeListener (evt) {
          if (!(evt.data && typeof evt.data === 'object')) {
            return;
          // Extension not installed
          } else if (evt.data.chromeExtensionStatus === 'not-installed') {
            window.removeEventListener('message', iframeListener);
            cb({
              success: false,
              error: new Error('Extension is not installed'),
              // Should return the above configured chrome.extensionLink but fallback for users using custom detectRTC.html
              extensionLink: evt.data.data || AdapterJS.extensionInfo.chrome.extensionLink
            });
          // Extension not enabled
          } else if (evt.data.chromeExtensionStatus === 'installed-disabled') {
            window.removeEventListener('message', iframeListener);
            cb({
              success: false,
              error: new Error('Extension is disabled')
            });
          // Permission denied for retrieval
          } else if (evt.data.chromeMediaSourceId === 'PermissionDeniedError') {
            window.removeEventListener('message', iframeListener);
            cb({
              success: false,
              error: new Error('Permission denied for screen retrieval')
            });
          // Source ID retrieved
          } else if (evt.data.chromeMediaSourceId && typeof evt.data.chromeMediaSourceId === 'string') {
            window.removeEventListener('message', iframeListener);
            cb({
              success: true,
              sourceId: evt.data.chromeMediaSourceId
            });
          }
        });

        // Check if extension has loaded, and then fetch for the sourceId
        iframe.contentWindow.postMessage({
          captureSourceId: true,
          sources: sources,
          legacy: true,
          extensionId: AdapterJS.extensionInfo.chrome.extensionId,
          extensionLink: AdapterJS.extensionInfo.chrome.extensionLink
        }, '*');
      };

      // The function to communicate with iframe
      iframe.getSourceId = function (sources, cb) {
        // If iframe failed to load, ignore
        if (states.error) {
          cb({
            success: false,
            error: new Error('iframe is not loaded')
          });
          return;
        }

        // Set interval to wait for iframe to load till 5 seconds before counting as dead
        if (!states.loaded) {
          var endBlocks = 0;
          var intervalChecker = setInterval(function () {
            if (!states.loaded) {
              // Loading of iframe has been dead.
              if (endBlocks === 50) {
                clearInterval(intervalChecker);
                cb({
                  success: false,
                  error: new Error('iframe failed to load')
                });
              } else {
                endBlocks++;
              }
            } else {
              clearInterval(intervalChecker);
              getSourceIdFromIFrame(sources, cb);
            }
          }, 100);
        } else {
          getSourceIdFromIFrame(sources, cb);
        }
      };

      // Re-append to reload
      (document.body || document.documentElement).appendChild(iframe);
    }

  } else if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    // Note: Not overriding getUserMedia() to reject "mediaSource" as to prevent "Invalid calling object" errors.
    // Nothing here because edge does not support screensharing
    console.warn('Edge does not support screensharing feature in getUserMedia');

  } else if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    // don't do anything. Screensharing is not supported
    console.warn('Safari does not support screensharing feature in getUserMedia');
  } else if (AdapterJS.webrtcDetectedType === 'plugin') {


    AdapterJS.WebRTCPlugin.parseVersion = function(version) {
      var components = version.split(".");
      var parsed = {
        major:    parseInt(components[0]),
        minor:    parseInt(components[1]),
        revision: parseInt(components[2]),
      }
      return parsed;
    };

    AdapterJS.WebRTCPlugin.isVersionGreater = function(v1, v2) {
      // Parse v1 and v2
      var parsedV1 = AdapterJS.WebRTCPlugin.parseVersion(v1);
      var parsedV2 = AdapterJS.WebRTCPlugin.parseVersion(v2);

      // Compare major, minor, revision
      return (parsedV1.major > parsedV2.major)
          || (parsedV1.major == parsedV2.major && parsedV1.minor > parsedV2.minor)
          || (parsedV1.major == parsedV2.major && parsedV1.minor == parsedV2.minor && parsedV1.revision > parsedV2.revision);
    }


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
            if (!AdapterJS.WebRTCPlugin.isVersionGreater(AdapterJS.WebRTCPlugin.plugin.VERSION, '0.8.874')) {
              updatedConstraints.video.optional = updatedConstraints.video.optional || [];
              updatedConstraints.video.optional.push({ sourceId: updatedConstraints.video.mediaSource });
            }

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
