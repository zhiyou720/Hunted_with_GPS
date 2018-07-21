
/* OS Map with overlay, route plan & GPS drag&drop, all coordinates in EPSG:27700 */

/* to restrict the set of layers avalable use e.g. ["50KR", "50K", "SVR", "SV"] as the final constructor parameter */
/* See the OpenSpaceOl3 code for a list of available layers */

function init() {

	var elevation=0;
	var points = [];
	var dists =[];
	var ascents =[];
	var time = [];
	var table = document.getElementById("table");
	var totaldist=0;
	var totalascent=0;


	//Define projection & projection transform
	proj4.defs("EPSG:27700", '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717' +
    ' +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs');

	//------------------------------------------------------------------------------------
	//basic map
	//------------------------------------------------------------------------------------

	var openSpaceOl3 = new OpenSpaceOl3('6D9B4BDB733E4D9CE0530C6CA40A79B5', document.URL, OpenSpaceOl3.ALL_LAYERS);
	var maplayer = openSpaceOl3.getLayer();
	var map = new ol.Map({
		layers: [maplayer],
		logo: false,
		target: 'map',
		controls: ol.control.defaults({
			attributionOptions: ({
				collapsible: false
			})
		}).extend([
			new OpenSpaceOl3.OpenSpaceLogoControl({
				className: 'openspaceol3-openspace-logo'
			})
		]),
		view: new ol.View({
			projection: openSpaceOl3.getProjection(),
			center: [400000, 350000], // OS coords
			resolutions: openSpaceOl3.getResolutions(),
			resolution: openSpaceOl3.getMaxResolution()
		})
	});

	//------------------------------------------------------------------------------------
	//terrain overlay
	//------------------------------------------------------------------------------------

	var terrainimg = new ol.source.ImageStatic({
		crossOrigin: 'anonymous',
		url: "overlay/FullCombine_0.png",
		//url: "http://127.0.0.1:8887/overlay/DiffP2R_0.png",
		projection:'EPSG:27700',
		alwaysInRange: true,
		imageExtent: [0.000000, 0.000000, 660000.000000, 1230000.000000]
		//imageExtent: [305300.000000, 657700.000000, 328700.000000, 667500.000000] //minicombine display

    })
	console.log("img load")
	function display(pixels) {
        var pixel = pixels[0];
        return pixel;
    }

	//only render pixels in viewport
	var raster = new ol.source.Raster({
        sources: [terrainimg],
        operation: display
    });

	var terrainol= new ol.layer.Image({
		opacity: 0.5,
		title: "overlay raster",
		source: raster,
    });
    map.addLayer(terrainol);

/*
	//------------------------------------------------------------------------------------
	//GPS Route
	//------------------------------------------------------------------------------------

	var gpxsource = new ol.source.Vector({
		crossOrigin: 'anonymous',
		url: "http://127.0.0.1:8887/tracks.gpx",
		format: new ol.format.GPX(),
		projection: 'EPSG:4326'
	});

	var gpxl = new ol.layer.Vector({
		source: gpxsource,
		visibility: true,
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: '#0000FF'
			}),
			stroke: new ol.style.Stroke({
				color: '#0000FF',
				width: 2
			})
		})
	});
	map.addLayer(gpxl);
*/
/*
	//------------------------------------------------------------------------------------
	//Display Elevation of cursor position
	//------------------------------------------------------------------------------------

	map.on("pointermove", getElevation);

	function getElevation(e) {
		var lonlat = e.coordinate;
		var ajaxparams = "e=" + lonlat[0] + "&n=" + lonlat[1];

		//get the height value from php function
		$.post("getElevation.php", ajaxparams,
			function(returnedData){
				elevation = returnedData;
			}, 'text');

		$('#Elev').html(elevation);
	}
	*/
	//------------------------------------------------------------------------------------
	//Table Functions
	//------------------------------------------------------------------------------------

	function addRow(i) {
		var lastrow = table.rows.length-1;
		var totaldistcell = table.rows[lastrow].cells[3];
		var totalascentcell = table.rows[lastrow].cells[4];
		var totaltimecell = table.rows[lastrow].cells[5];
		var row = table.insertRow(lastrow);
		var pointcell = row.insertCell(0);
		pointcell.innerHTML = "Point " + i;
		var latcell = row.insertCell(1);
		latcell.innerHTML = Math.round(points[i][1]);
		var loncell = row.insertCell(2);
		loncell.innerHTML = Math.round(points[i][0]);
		var distcell = row.insertCell(3);
		distcell.innerHTML = (dists[i].toFixed(2));
		var ascentcell = row.insertCell(4);
		ascentcell.innerHTML = Math.round(ascents[i]);
		var timecell = row.insertCell(5);
		timecell.innerHTML=calculateTime(dists[i],ascents[i]);
		totaldistcell.innerHTML = totaldist.toFixed(2);
		totalascentcell.innerHTML = Math.round(totalascent);
		totaltimecell.innerHTML = calculateTime(totaldist,totalascent);
	}

	function updateRow(i) {
		var lastrow = table.rows.length-1;
		var totaldistcell = table.rows[lastrow].cells[3];
		var totalascentcell = table.rows[lastrow].cells[4];
		var totaltimecell = table.rows[lastrow].cells[5];
		var latcell = table.rows[i+2].cells[1];
		latcell.innerHTML = Math.round(points[i][1]);
		var loncell = table.rows[i+2].cells[2];
		loncell.innerHTML = Math.round(points[i][0]);
		var distcell = table.rows[i+2].cells[3];
		distcell.innerHTML = (dists[i].toFixed(2));
		var ascentcell = table.rows[i+2].cells[4];
		ascentcell.innerHTML = Math.round(ascents[i]);
		var timecell = table.rows[i+2].cells[5];
		timecell.innerHTML=calculateTime(dists[i],ascents[i]);
		totaldistcell.innerHTML = totaldist.toFixed(2);
		totalascentcell.innerHTML = Math.round(totalascent);
		totaltimecell.innerHTML = calculateTime(totaldist,totalascent);
	}

	function sumArray(arr){
		var sum = 0;
		for (var i = arr.length; !!i--;){
			sum += arr[i];
		}
		return sum;
	}

	function calculateTime(dist,ascent){
		var time=dist/5 + ascent/600;
		var hours=Math.floor(time);
		var secs = Math.round((time-hours)*60);
		if (secs==60){
			hours+=1;
			secs=0;
		}
		if (secs < 10) {
			return hours+":0"+secs;
		}
		else {
			return hours+":"+secs;
		}
	}

	function addPoint(){
		var ajaxparams = "e0=" + points[points.length-2][0] + "&n0=" +  points[points.length-2][1]
			+ "&e1=" + points[points.length-1][0] + "&n1=" +  points[points.length-1][1];

		$.post("getLocationDetails.php", ajaxparams,
			function(returnedData){
				var result = $.parseJSON(returnedData);
				dists.push(result[0]);
				ascents.push(result[1]);
				totaldist = sumArray(dists);
				totalascent=sumArray(ascents);
				addRow(points.length-1);
			}, 'text');
		redrawLine();
	}

	function updatePoint(i){

		var ajaxparams = "e0=" + points[i][0] + "&n0=" +  points[i][1]
			+ "&e1=" + points[i+1][0] + "&n1=" +  points[i+1][1];

		$.post("getLocationDetails.php", ajaxparams,
		function(returnedData){
			var result = $.parseJSON(returnedData);
			dists[i+1]=(result[0]);
			ascents[i+1]=(result[1]);
			totaldist = sumArray(dists);
			totalascent=sumArray(ascents)
			updateRow(i+1);
		}, 'text');
		redrawLine();
	}

	function redrawLine(){
		linesource.clear();
		var line=new ol.geom.LineString(points);
		var linefeature=new ol.Feature({
			geometry: line
		});
		linesource.addFeatures([linefeature]);
	}


	//------------------------------------------------------------------------------------
	//drawing layers
	//------------------------------------------------------------------------------------

	const drawStyle = {
		'Point': new ol.style.Style({
			image: new ol.style.Circle({
				fill: new ol.style.Fill({
				color: 'rgba(0,0,255,0.8)'
				}),
				radius: 5
			})
		}),
		'LineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'rgba(255,0,0,0.8)',
				width: 3
			}),
		})
	};

	const drawStyleFunction = function(feature, resolution) {
		return drawStyle[feature.getGeometry().getType()];
	};

	var linesource= new ol.source.Vector({});
	var linelayer= new ol.layer.Vector({
		source: linesource,
		style: drawStyleFunction
	});
	map.addLayer(linelayer);

	const pointsource = new ol.source.Vector({wrapX: false});
    const pointlayer = new ol.layer.Vector({
        source: pointsource,
		style: drawStyleFunction

    });
	map.addLayer(pointlayer);

	var revision = [];

	//draw ponts on map when clicked
	var draw = new ol.interaction.Draw({
		source: pointsource,
		type: "Point",
	});
	map.addInteraction(draw);

	//Assign id to new point
	draw.on('drawend', function(event){
		var ind = pointsource.getFeatures().length;
		event.feature.setId(ind);
		revision.push(event.feature.getRevision());
	});

	//Calculate table values & draw lines
	pointsource.on('addfeature', function(e){

		var lonlat = e.feature.getGeometry().getCoordinates();
		points.push(lonlat)

		if (points.length == 1) {
			dists.push(0);
			ascents.push(0);
			addRow(0)
        }

		if (points.length >=2) {
			addPoint();
		}
	});

	//update table,points & lines when dragged

	var modifyline = new ol.interaction.Modify({
		source: linesource
	});
    map.addInteraction(modifyline);

	var modify = new ol.interaction.Modify({
		source: pointsource
	});
    map.addInteraction(modify);

	modify.on('modifyend', function(e){

		//Use point revision counter to find which point was updated
		var features = e.features.getArray();
		for (var i = 0; i < features.length; i++) {
			var rev = features[i].getRevision();
			if (rev != revision[i]) {
				revision[i] = rev;
				break;
			}
		}

		points[i] = features[i].getGeometry().getCoordinates();

		if (i==0){
			if (features.length==1){
				updateRow(i);
			}
			else{
				updatePoint(i)
			}
		}
		else if (i==features.length-1){
			updatePoint(i-1)
		}
		else{
			updatePoint(i);
			updatePoint(i-1);
		}
	});

	//------------------------------------------------------------------------------------
	//Drag & Drop GPX File
	//------------------------------------------------------------------------------------

	const dragAndDropInteraction = new ol.interaction.DragAndDrop({
        formatConstructors: [
          ol.format.GPX
        ],
      });
	map.addInteraction(dragAndDropInteraction);

	const GPSStyle = {
		'Point': new ol.style.Style({
			image: new ol.style.Circle({
				fill: new ol.style.Fill({
				color: 'rgba(255,255,0,0.5)'
				}),
				radius: 5,
				stroke: new ol.style.Stroke({
					color: '#ff0',
					width: 1
				})
			})
		}),
		'LineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#f00',
				width: 3
			}),
			image: new ol.style.Circle({
				fill: new ol.style.Fill({
				color: 'rgba(255,255,0,0.5)'
				}),
				radius: 5,
				stroke: new ol.style.Stroke({
					color: '#ff0',
					width: 1
				})
			})
		}),
		'MultiPoint': new ol.style.Style({
			image: new ol.style.Circle({
				fill: new ol.style.Fill({
					color: 'rgba(255,0,255,0.5)'
				}),
				radius: 5,
				stroke: new ol.style.Stroke({
					color: '#f0f',
					width: 1
				})
			})
		}),
		'MultiLineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#0f0',
				width: 3
			})
		}),
		'MultiPolygon': new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(0,0,255,0.5)'
			}),
			stroke: new ol.style.Stroke({
				color: '#00f',
				width: 1
			})
		})
	};

	const GPSStyleFunction = function(feature, resolution) {
		return GPSStyle[feature.getGeometry().getType()];
	};

	dragAndDropInteraction.on('addfeatures', function(event) {
		const vectorSource = new ol.source.Vector({
			features: event.features,
			projection: 'EPSG:4326'
		});
		map.addLayer(new ol.layer.Vector({
			source: vectorSource,
			style: GPSStyleFunction
		}));
		map.getView().fit(vectorSource.getExtent());
	});

	//------------------------------------------------------------------------------------
	//Tile Quota & Search Functions
	//------------------------------------------------------------------------------------

	function displayQuota(data) {
		if (data.length > 0) {
			$("#tilesAvailable").html(data[0]);
			$("#tilesUsed").html(data[1] + " at " + new Date().toLocaleTimeString() );

		}
	}

	// dont fetch quota too often, wait 2 seconds after pan/zoom ends
	var quotaTimer = null;
	map.on('moveend', function (evt) {

		if (quotaTimer)
			clearTimeout(quotaTimer);
		quotaTimer = setTimeout(function () { openSpaceOl3.asyncGetTileQuota(displayQuota); }, 2000);

	});

	openSpaceOl3.asyncGetTileQuota(displayQuota); // initial quota

	$("#search-form").submit(function (e) {

		var search = $("#search-query").val();
		$('#result-select').find('option').remove(); // clear combo

		if (/\d/.test(search)) {
			//search string contained a digit, do a postcode search
			openSpaceOl3.asyncGeorefPostcode(search, function (data) {
				if (data.length == 2) {
					$("#result-select").append("<option value='select'>Select a result</option>");
					$("#result-select").append("<option value='" + data[0] + " " + data[1] + "'>" + search + "</option>");
				}
				else {
					$("#result-select").append("<option value='select'>Not found</option>");
				}
			});
		}
		else {
			openSpaceOl3.asyncGazetteerQuery(search, function (data) {
				if (data.length > 0) {
					$("#result-select").append("<option value='select'>Select a result</option>");
					$.each(data, function (i, item) {
						$("#result-select").append("<option value='" + item.loc[0] + " " + item.loc[1] + "'>" + item.desc + "</option>");
					});
				}
				else {
					$("#result-select").append("<option value='select'>Not found</option>");
				}
			});
		}

		return false; // don't submit

	});

	// pan to selected result
	$('#result-select').change(function () {
		var strCoords = $(this).find(':selected').val().split(' ');
		if (strCoords.length == 2) {
			map.getView().setCenter([parseInt(strCoords[0],10), parseInt(strCoords[1],10)]);
		}
	});

	const gpspointsource = new ol.source.Vector({
        wrapX: false,
        projection: 'EPSG:27700'
        });
	const gpspointlayer = new ol.layer.Vector({
                source: gpspointsource,
        style: drawStyleFunction
            });
	map.addLayer(gpspointlayer);

        var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
                socket.on('message', function(msg) {
                    console.log('msg');
        var message=msg.split(",");
        console.log(message);
        var location=ol.proj.fromLonLat([message[0],message[1]],'EPSG:27700');
        console.log(ol.proj.fromLonLat([message[0],message[1]],'EPSG:27700'));
        var gps=new ol.geom.Point(location);
        var gpsfeature=new ol.Feature({
        geometry: gps
        });
        gpspointsource.addFeatures([gpsfeature]);
        });
}

