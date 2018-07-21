<?php

class ASCIIReader {
  
    // public properties    
    /**
    * show messages on error condition, otherwise dies silently
    * 
    * @var bool
    */
    public $showErrors = false;    
    
    // constants
    const ROWS_COLS = 200;
    const MTRS_PER_TILE = 10000; 
    
    // private properties      
    private $dataDir;              // path to local directory containing the OS data files
    private $filePath;             // name of current data directory and file name
    private $fp;				   //current open file
	
    /**
    * Constructor: assigns data directory
    * 
    * @param mixed $dataDir
    * @return OSNTFReader
    */
    function __construct($dataDir) {
        $this->dataDir = $dataDir;
    } 
        
    /**
    * Returns the elevation in metres for a given Easting & Northing
    * 
    * @param float $latitude
    * @param float $longitude
    */
    public function getElevation($easting, $northing) {
    
        // work out the data file name
        $filePath = $this->getFilePath($easting, $northing);   
        $this->openFile($filePath);
		
        // reduce the easting & northing down to the nearest 10Km tile                             
        $tileEasting = fmod($easting, 10000);
        $tileNorthing = fmod($northing, 10000);        
        	
        $elevation = $this->getData($tileEasting, $tileNorthing);
        return $elevation;
    }
    
    /**
    * Returns the file path to the 10km file holding the data for the full easting & northing
    * 
    * @param mixed $easting
    * @param mixed $northing
    */
    private function getFilePath($easting, $northing) {
        
/*       
        OS grid layout has four 500Km identifiers (H, N, S & T) 
        each potentially containing 5 * 5 100Km grids from A to Z 
        
        NB: letter 'I' is not used, so A to Z = 25 tiles
        NB: sea area grids are not populated
       
                     HP|
                  HT HU|
        |   HW HX HY HZ|
        |--------------|--      
        |NA NB NC ND   |   
        |NF NG NH NJ NK|          
        |NL NM NN NO   |
        |   NR NS NT NU|        
        |   NW NX NY NZ|
        |--------------|--
        |      SC SD SE|TA
        |      SH SJ SK|TF TG
        |   SM SN SO SP|TL TM
        |SQ SR ST SU SV|TQ TR
        |SV SW SX SY SZ|TV 
           
*/      
        // get the char of the containing 500Km grid and e/n diffs against the origin                                        
        $eDiff = $easting;
        $nDiff = $northing;
                        
        if ($nDiff >= (1000000)) { 
            $firstChar = "H"; 
            $nDiff -= (1000000);
        }
        elseif ($nDiff >= 500000) {
            $firstChar = "N";
            $nDiff -= 500000;
        } 
        else {
            if ($eDiff >= 500000) {       
                $firstChar = "T";
                $eDiff -= 500000; 
            }
            else {
                $firstChar = "S";
            }
        }
         
        // work out the 2nd char to identify the containing 100Km grid 
        // noting that the SW origin tile is always 'V' (ASCII 118) 
		
		//if remaining e/n=50000, return 0, else divide by 10000
        $colOffset = ($eDiff == 500000) ? 0 : floor($eDiff / 100000);        
        $rowOffset = ($nDiff == 500000) ? 0 : floor($nDiff / 100000);        
        $val = 86 + $colOffset - ($rowOffset * 5);
        if ($val < 74) {
            $val--; // correct for missing 'i' for values below 'j'
        }
        $secondChar = chr($val);
        $dirName = $firstChar . $secondChar;
              
        // reduce the diffs down to the nearest 100Km tile (e.g. 'SU') then work out 
        // the file row and col identifiers. These are named '00' to '99' going E & N.                 
 
        $eDiff = fmod($eDiff, 100000);
        $nDiff = fmod($nDiff, 100000);       
        $colName = floor($eDiff / 10000);
        $rowName = floor($nDiff / 10000);                            
        $fileName = $dirName . $colName . $rowName . ".asc";
          
        return $fileName;                                   
    }
       
    /**
    * Read the data file and get a pointer to the first data offset
    * 
    * @param string $fileName
    */
    private function openFile($filePath) {
                       
        $fullPath = $this->dataDir . "/". $filePath;
        if (!file_exists($fullPath)){
            $this->handleError(__METHOD__ , "the file '$fullPath' does not exist");
        }
		
        $fp = fopen($fullPath, 'r');
        if ($fp === false) {
            $this->handleError(__METHOD__ , "could not open the file '$fullPath'");
        } 
        
		$this->filePath = $fullPath; 
		$fread = fread($fp,filesize("$fullPath"));

		fclose($fp);
        $this->fp = $fread;                                    
    }
    
    /**
    * Returns the elevation data at a given zero-based row and column
    * using the current file pointer
    * 
    */
    private function getData($tileEasting, $tileNorthing) {
				
	    $gridColOffset = round($tileEasting  * (self::ROWS_COLS -1)/ self::MTRS_PER_TILE);  
        $gridRowOffset = round($tileNorthing * (self::ROWS_COLS -1)/ self::MTRS_PER_TILE);
		
		//explode 206 rows into array, first 5 [0:4] = metadata
		//row[204] = tile northing 0
		//row[205] = empty row
		
		$rows = explode("\n", $this->fp);

		$selectedrow = $rows[204-$gridRowOffset];
		//printf($selectedrow . " ");	

		//explode row into individial measurements
		$columns = explode(" ", $selectedrow);
		
		$elevation = 0 + $columns[$gridColOffset];
		     
        return $elevation;
    }
	
    /**
    * Error handler
    * 
    * @param string $error
    */
    private function handleError($method, $message) {
        
        if ($this->showErrors) { 
            ob_start();
            var_dump($this);
            $dump = ob_get_contents();
            ob_end_clean();        
            die("Died: error in $method: $message <pre>$dump</pre>");
        }
        else {
            die();
        }
    }
}                 
?>