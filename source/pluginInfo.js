AdapterJS.sl = {};
AdapterJS.sl.pluginName = 'StarLeafBrowserPlugin';
AdapterJS.sl.makeDownloadLink = function() {
  if(SLUI_CONFIG.webrtcPlugin && SLUI_CONFIG.webrtcPlugin.plugin_version) {
    var link = "https://" + SLUI_CONFIG.webrtcPlugin.hostname + "/webrtcplugin/"
                          + SLUI_CONFIG.webrtcPlugin.plugin_version + "/" + AdapterJS.sl.pluginName;
    if(!!navigator.platform.match(/^Mac/i)) {
      link += ".pkg";
    }
    else if(!!navigator.platform.match(/^Win/i)) {
      link+= ".msi";
    }
    return link;
  } else {
    return null;
  }
};

AdapterJS.WebRTCPlugin.pluginInfo = AdapterJS.WebRTCPlugin.pluginInfo || {
  prefix : 'SLF',
  plugName : AdapterJS.sl.pluginName,
  pluginId : 'plugin0',
  type : 'application/x-starleafwebrtcbrowserplugin',
  onload : '__TemWebRTCReady0',
  portalLink : 'http://support.starleaf.com',
  downloadLink :  AdapterJS.sl.makeDownloadLink(),
  companyName: 'StarLeaf'
};
