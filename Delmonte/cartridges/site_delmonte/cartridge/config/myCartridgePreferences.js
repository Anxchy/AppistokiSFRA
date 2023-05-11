// FILE: site_delmonte/cartridge/config/myCartridgePreferences.js
var System = require('dw/system');
 
function getPreferences() {
    var prefs = {};
    var site = System.Site.getCurrent();
    prefs.myPreferenceID = site.getCustomPreferenceValue('AbandonCart_MID');
    
    return prefs;
}
 
module.exports = getPreferences();