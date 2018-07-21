
/* This code by Bill Chadwick with some inspiration from Peter Robins - Feb 2015 */
/* Use it for what you like */

/**
* @constructor
* @extends {ol.control.Control}
* @param {string} key API key.
* @param {string} url API url registered for key.
* @param {[string] | null} set of layers to be used, in zoom order 
*/
function OpenSpaceOl3(key, url, selectedLayers) {

    this.key = encodeURI(key);
    this.url = encodeURI(url);

    var resolutionLookup = {
        "OV0": [2500.0, 200],  // OverView 0 - very small UK image, no text
        "OV1": [1000.0, 200],  // OverView 1 - UK image with some names
        "OV2": [500.0, 200],   // Overview 2 - larger UK image with some names
        "MSR": [200.0, 200],   // Miniscale reduced - shrunk Route Planner
        "MS": [100.0, 200],    // Miniscale - Route Planner
        "250KR": [50.0, 200],  // Roadbook reduced - shrunk Roadbook with relief 
        "250K": [25.0, 200],   // Roadbook - Roadbook with relief 
        "50KR": [10.0, 200],   // 1:50K reduced - shrunk 1:50K mapping
        "50K": [5.0, 200],     // 1:50K - 1:50K mapping
        "VMDR": [4.0, 250],    // Vector Map District reduced - shrunk VMD, no relief
        "VMD": [2.5, 200],     // Vector Map District - VMD, no relief
        "SVR": [2.0, 250],     // Street View reduced - shrunk Street atlas, no relief
        "SV": [1.0, 250]       // Street - Street atlas, no relief
    };

    var layers = selectedLayers || OpenSpaceOl3.DEFAULT_LAYERS;

    if (!$.isArray(layers)) {
        layers = OpenSpaceOl3.DEFAULT_LAYERS;
    }

    var selectedResns = [];
    var selectedSizes = [];

    $.each(layers, function (i, item) { selectedResns.push(resolutionLookup[item][0]); selectedSizes.push(resolutionLookup[item][1]); });

    this.options = {
        url: 'https://openspace.ordnancesurvey.co.uk/osmapapi/ts',
        params: {
            'VERSION': '1.1.1',
            'LAYERS': selectedResns[0], // initial value, this needs to change to match the resolution of tiles being fetched
            'KEY': this.key,
            'URL': this.url // registered URL should match the API key
        },
		crossOrigin: 'anonymous',
        attributions: [new ol.Attribution({
            html: 'Topo maps &copy; Crown copyright and database rights ' +
                new Date().getFullYear() +
                ' <span style="white-space: nowrap;">Ordnance Survey.</span>' +
                '&nbsp;&nbsp;<span style="white-space: nowrap;">' +
                '<a href="https://openspace.ordnancesurvey.co.uk/openspace/developeragreement.html#enduserlicense"' +
                'target="_blank">End User License Agreement</a></span>'
        })],
        //logo: 'http://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_4.0.0/OS/poweredby_free.png',
        extent: [0, 0, 800000, 1300000],
        projection: 'EPSG:27700',
        tileGrid: new ol.tilegrid.TileGrid({
            tileSizes: selectedSizes,
            resolutions: selectedResns,
            origin: [0, 0]
        })
    };

    var source = new ol.source.TileWMS(this.options);
    this.source = source;

    this.layer = new ol.layer.Tile({
        source: source,
        minResolution: selectedResns[selectedResns.length],
        maxResolution: selectedResns[0] + 0.001
    });

    // Sort of override the URL generation function to set the LAYERS parameter from the resolution.
    // The map's resolution change event can not be used os ol3 may pre-fetch tiles at adjacent zoom levels.
    var originalTileUrlFunc = source.getTileUrlFunction();
    this.source.setTileUrlFunction(function (tileCoord, pixelRatio, projection) {

        // for 'free' OS OpenSpace the LAYERS param needs to be equal to the resolution
        var z = tileCoord[0];
        var res = selectedResns[z];
        source.updateParams({ LAYERS: res });

        // call superclass
        return originalTileUrlFunc(tileCoord, pixelRatio, projection);
    });

    /**
    * @constructor The terms of use of the OS OpenSpace API require that the OpenSpace logo is displayed
    * @extends {ol.control.Control}
    * @param {Object=} opt_options Control options.
    */
    OpenSpaceOl3.OpenSpaceLogoControl = function (opt_options) {

        var options = opt_options || {};

        var image = document.createElement('img');
        image.src = 'https://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_4.0.0/OS/poweredby_free.png';

        var element = document.createElement('div');
        // by default, the logo's position on the map is set by the openspaceol3-openspace-logo css in your .html/.css file
        element.className = options.className || 'openspaceol3-openspace-logo';
        element.className += ' ol-unselectable ol-control';
        element.appendChild(image);

        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });

    };
    ol.inherits(OpenSpaceOl3.OpenSpaceLogoControl, ol.control.Control);
}

/**
* {[string]} DEFAULT_LAYERS the normal set of products for the free OpenSpace service
*/
OpenSpaceOl3.DEFAULT_LAYERS = ["OV0", "OV1", "OV2", "MSR", "MS", "250KR", "250K", "50KR", "50K", "SVR", "SV"];

/**
* {[string]} ALL_LAYERS the full set of products for the free OpenSpace service, 
* adds Vector Map District ontop of the DEFAULT_LAYERS 
*/
OpenSpaceOl3.ALL_LAYERS = ["OV0", "OV1", "OV2", "MSR", "MS", "250KR", "250K", "50KR", "50K", "VMDR", "VMD", "SVR", "SV"];


/**
* get the layer
* @return {ol.layer.Tile} the layer for adding to a map
*/
OpenSpaceOl3.prototype.getLayer = function () {
    return this.layer;
};

/**
* get the layer's source
* @return {ol.source.TileWMS} the source of the layer
*/
OpenSpaceOl3.prototype.getSource = function () {
    return this.source;
};

/**
* get the layer's resolutions
* @return {[number]} the resolutions available
*/
OpenSpaceOl3.prototype.getResolutions = function () {
    return this.source.getTileGrid().getResolutions();
};

/**
* get the layer's max resolution
* @return {number} the max resolution available (lowest zoom)
*/
OpenSpaceOl3.prototype.getMaxResolution = function () {
    return this.getResolutions()[0];
};

/**
* get the layer's min resolution
* @return {number} the min resolution available (highest zoom)
*/
OpenSpaceOl3.prototype.getMinResolution = function () {
    var resns = this.getResolutions();
    return resns[resns.length - 1];
};

/**
* get the layer's projection
* @return {ol.proj.Projection} the layer's projection
*/
OpenSpaceOl3.prototype.getProjection = function () {
    return this.source.getProjection();
};


/**
* get a gazetteer query URL for a json response, 
* none, one or many results may be returned
* @param {string} query the item to search for in the gazetteer
* @return {string} the url for a gazetteer query
*/
OpenSpaceOl3.prototype.getGazetteerQueryUrl = function (query) {
    return "https://openspace.ordnancesurvey.co.uk/osmapapi/gazetteer?q=" +
        encodeURI(query) +
        "&key=" +
        this.key +
        "&f=json&url=" +
        this.url;
};

/**
* get a postcode query URL for a json response
* one or no result will be returned
* @param {string} code the postcode to search for
* @return {string} the url for a postcode query
*/
OpenSpaceOl3.prototype.getPostcodeQueryUrl = function (code) {
    return "https://openspace.ordnancesurvey.co.uk/osmapapi/postcode?q=" +
        encodeURI(code) +
        "&key=" +
        this.key +
        "&f=json&url=" +
        this.url;
};

/**
* get a quota query URL for a json response
* @return {string} the url for a quota query
*/
OpenSpaceOl3.prototype.getTileQuotaUrl = function () {
    return "https://openspace.ordnancesurvey.co.uk/osmapapi/jsapi?q=tilecount&key=" +
        this.key +
        "&f=json&url=" +
        this.url;
};

/**
* Async georef postcode, requests are cached
* @param {string} code the postcode to search for
* @param {function} callback passed [] (no result) or [east,north] (one result)
*/
OpenSpaceOl3.prototype.asyncGeorefPostcode = function (code, callback) {

    $.ajax({
        url: this.getPostcodeQueryUrl(code),
        dataType: 'jsonp',
        cache: true,
        jsonpCallback: 'pc_no_cache',
        error: function () {
            callback([]);
        },
        success: function (data) {

            var ret = [];
            try {
                if (data.PostcodeResult.location) {
                    //one result
                    var l = data.PostcodeResult.location;
                    var p = l["gml:Point"];
                    var g = p["gml:pos"];
                    var e = parseInt(g.split(' ')[0], 10);
                    var n = parseInt(g.split(' ')[1], 10);
                    if ((!isNaN(e)) && (!isNaN(n))) {
                        ret = [e, n];
                    }
                }
            } catch (ignore) {
            }
            callback(ret);
        }
    });
};


/**
* Async gazetteer query, requests are cached
* @param {string} code the postcode to search for
* @param {function} callback passed [] (no results) or [{loc:[east,north],desc:text}] (one or more results)
*/
OpenSpaceOl3.prototype.asyncGazetteerQuery = function (search, callback) {

    $.ajax({
        url: this.getGazetteerQueryUrl(search),
        dataType: 'jsonp',
        cache: true,
        jsonpCallback: 'gaz_no_cache',
        error: function () {
            callback([]);
        },
        success: function (data) {

            var ret = [];
            try {
                var pushItem = function (item) {
                    var l = item.location;
                    var p = l["gml:Point"];
                    var g = p["gml:pos"];
                    var e = parseInt(g.split(' ')[0], 10);
                    var n = parseInt(g.split(' ')[1], 10);
                    if ((!isNaN(e)) && (!isNaN(n))) {
                        ret.push({ loc: [e, n], desc: item.name + ", " + item.county + ", " + item.type });
                    }
                };
                if (data.GazetteerResult.items.Item) {
                    if ($.isArray(data.GazetteerResult.items.Item)) {
                        $.each(data.GazetteerResult.items.Item, function (i, item) { pushItem(item); });
                    } else {
                        pushItem(data.GazetteerResult.items.Item);
                    }
                }
            } catch (ignore) {
            }
            callback(ret);
        }
    });
};


/**
* Async get tile quota usage, requests not cached
* The OS Servers don't seem to update the usage that frequently
* @param {function} callback passed [used, available] or in case of error, []
*/
OpenSpaceOl3.prototype.asyncGetTileQuota = function (callback) {

    $.ajax({
        url: this.getTileQuotaUrl(),
        dataType: 'jsonp',
        cache: false,
        error: function () {
            callback([]);
        },
        success: function (data) {
            var ret = [];
            try {
                if (data.APITileCountVO) {
                    var q = data.APITileCountVO;
                    ret = [parseInt(q.maxTiles, 10), parseInt(q.tilesUsed, 10)];
                }
            } catch (ignore) {
            }
            callback(ret);
        }
    });

};