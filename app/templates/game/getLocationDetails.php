<?php 

/****************************************************************
 Displays a graph of elevations between two OS points
****************************************************************/
 
require_once 'ASCIIReader.php';        // the OS elevation reader class  

$e0 = $_POST['e0']; // easting & northing of 1st position  
$n0 = $_POST['n0']; 
 
$e1 = $_POST['e1']; // easting & northing of 2nd position
$n1 = $_POST['n1'];

$locations = array($e0, $n0, $e1, $n1);  // put the two location pairs into an array 

/*
 The constructor requires the path to the OS data file directory which contains
 the 55 sub-directories which in turn contain the actual .ntf data files
 exactly as downloaded from Ordnance Survey  	
*/  
$dataReader = new ASCIIReader("../../static/ascii");

/*
 getMultipleElevations($locations [, $addIntermediateLatLons [, $interpolate]])
 
 Returns an array of elevations in metres given an array of eastings & northings
 as {e1, n1, ... en, nn}
*/

$elevations = $dataReader->getMultipleElevations($locations);

// get the number of elevations returned
$numElevations = count($elevations);

// get the total distance between the points
$distance = $dataReader->getTotalDistance();
//echo $distance;
$ascent = $dataReader->getAscent();
//echo $ascent;
echo json_encode(array($distance,$ascent)); 
?> 
