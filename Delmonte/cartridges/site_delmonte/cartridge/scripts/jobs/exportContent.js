'use strict';

var ContentMgr = require('dw/content/ContentMgr');
var Status = require('dw/system/Status');
var File = require('dw/io/File');
var Io = require('dw/io');
/**
 * Replaces Bundle master product items with their selected variants
 *
 * @param {dw.order.ProductLineItem} apiLineItem - Cart line item containing Bundle
 * @param {string[]} childProducts - List of bundle product item ID's with chosen product variant
 *
 */
function getContentAssets(lib,assets){
    if(lib){
        for( var i = 0; i<lib.length; i++){
            if(lib[i].subFolders.length!==0){
                assets.push(lib[i].ID);
                getContentAssets(lib[i].subFolders,assets);
            }
        }
    }
}


function exportContent(args) {
    var library = !empty(args.Library) ? ContentMgr.getLibrary(args.Library) : ContentMgr.getSiteLibrary();
    var folderDetails = ContentMgr.getFolder(library, 'SearchBanner');
    var content = folderDetails;
    // var contentLib = new File(File.IMPEX+'/src/'+'RefArchSharedLibraryAnx.xml');
    // var file = new Io.FileReader(contentLib);
    // var fileXml = new Io.XMLStreamReader(file);
    // var libraryXmlFile = new File(File.IMPEX+'/src/contentAsset3/'+'libraryXmlFile.xml');
    // var fileWriter = new Io.FileWriter(libraryXmlFile, "UTF-8");
    // var xsw = new Io.XMLStreamWriter(fileWriter);
    // var arg = ContentMgr.getContent('footer-about');
    // var lib = ContentMgr.getLibrary('RefArchSharedLibrary');
    // if (empty(library)) {
    //     return new Status(Status.ERROR, 'ERROR', 'Unknown library with ID ' + args.Library);
    // }

    // if (lib){
    //     var l = lib.root.subFolders;
    //     const assets = [];
    //     getContentAssets(l,assets);
    //     var test = assets;
    //     var yes = test;
    //     // const l2 = [];
    //     // for( var i = 0; i<l.length; i++){
    //     //     l2.push(l[i].ID);
    //     // }
    // }

    return true;
}

function exportProductCatlog(args){
    // var logFile = new File(File.IMPEX + File.SEPARATOR + "src" + File.SEPARATOR + 'productExport.xml');
    // var fileReader = new FileReader(logFile, "UTF-8");
    var contentLib = new File(File.IMPEX+'/src/'+'productExport.xml');
    var contentLib2 = new File(File.IMPEX+'/src/'+'productExport22.xml');
    var contentLib3 = new File(File.IMPEX+'/src/'+'productExport3.xml');
    var file = new Io.FileReader(contentLib);
    var newXmlFile = contentLib.copyTo(contentLib2);
    var n = 4;
}

exports.exportContent = exportContent;
exports.exportProductCatlog = exportProductCatlog;

//C:\Users\User\Documents\AppistokiSFRANew\Delmonte\cartridges\app_storefront_base