<?php 

/****************************************************************
 Returns a single elevation for a given point location
 (uses POSTed params to avoid values being cached by some browsers)
****************************************************************/
 
require_once 'ASCIIReader.php';

//$e = 300000; // easting
//$n = 800000; // northing
$e = $_POST['e']; // easting
$n = $_POST['n']; // northing

$dataReader = new ASCIIReader("../../static/ascii");
echo $dataReader->getElevation($e, $n); 
 
?> 