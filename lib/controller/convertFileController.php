<?php

set_time_limit(0);

include_once INIT::$MODEL_ROOT . "/queries.php";
include_once INIT::$UTILS_ROOT . "/CatUtils.php";
include_once INIT::$UTILS_ROOT . "/FileFormatConverter.php";

class convertFileController extends ajaxController {

	protected $file_name;
	protected $source_lang;
	protected $target_lang;

	protected $cache_days=10;

	protected $intDir;
	protected $errDir;

	public function __construct() {

        $this->disableSessions();
		parent::__construct();

		$this->file_name = $this->get_from_get_post('file_name');
		$this->source_lang = $this->get_from_get_post("source_lang");
		$this->target_lang = $this->get_from_get_post("target_lang");

		$this->intDir = INIT::$UPLOAD_REPOSITORY . DIRECTORY_SEPARATOR . $_COOKIE['upload_session'];
		$this->errDir = INIT::$STORAGE_DIR . DIRECTORY_SEPARATOR . 'conversion_errors' . DIRECTORY_SEPARATOR . $_COOKIE['upload_session'];

	}

	public function doAction() {

		if (empty($this->file_name)) {
			$this->result['errors'][] = array("code" => -1, "message" => "Error: missing file name.");
			return false;
		}

		$file_path = $this->intDir . DIRECTORY_SEPARATOR . $this->file_name;

		if ( !file_exists( $file_path ) ) {
			$this->result['errors'][] = array("code" => -6, "message" => "Error during upload. Please retry.");
			return -1;
		}

		$original_content = file_get_contents($file_path);
		$sha1 = sha1($original_content);

		if( INIT::$SAVE_SHASUM_FOR_FILES_LOADED ){
		    $xliffContent = getXliffBySHA1( $sha1, $this->source_lang, $this->target_lang,$this->cache_days );
		}

        try {

            $fileType = DetectProprietaryXliff::getInfo($file_path);

            //found proprietary xliff
            if ( $fileType['proprietary'] && !INIT::$CONVERSION_ENABLED ) {
                unlink($file_path);
                $this->result['errors'][] = array("code" => -7, "message" => 'Matecat Open-Source does not support ' . ucwords($fileType['proprietary_name']) . '. Use MatecatPro.' );
                return -1;

            }

            if( !$fileType['proprietary'] && DetectProprietaryXliff::isXliffExtension() ){
                $this->result['code'] = 1; // OK for client
                return 0; //ok don't convert a standard sdlxliff
            }

        } catch (Exception $e) {
            $this->result['errors'][] = array("code" => -8, "message" => $e->getMessage());
            Log::doLog( $e->getMessage() );
            return -1;
        }

		if ( isset($xliffContent) && !empty($xliffContent) ) {

			$xliffContent=  gzinflate($xliffContent);
			$res = $this->put_xliff_on_file($xliffContent, $this->intDir);

			if ( !$res ) {

                //custom error message passed directly to javascript client and displayed as is
                $convertResult['errorMessage'] = "Error: failed to save converted file from cache to disk";
                $this->result['code'] = -100;
                $this->result['errors'][] = array( "code" => -100, "message" => $convertResult['errorMessage'] );

			}

		} else {

			$original_content_zipped = gzdeflate($original_content, 5);
			unset($original_content);

			$converter = new FileFormatConverter();
			if(strpos($this->target_lang,',')!==FALSE){
				$single_language=explode(',',$this->target_lang);
				$single_language=$single_language[0];
			} else {
				$single_language=$this->target_lang;
			}

			$convertResult = $converter->convertToSdlxliff( $file_path, $this->source_lang, $single_language );

			if ( $convertResult['isSuccess'] == 1 ) {

				//$uid = $convertResult['uid']; // va inserito nel database
				$xliffContent = $convertResult['xliffContent'];
				$xliffContentZipped = gzdeflate($xliffContent, 5);

				if( INIT::$SAVE_SHASUM_FOR_FILES_LOADED ){
					$res_insert = insertFileIntoMap($sha1, $this->source_lang, $this->target_lang, $original_content_zipped, $xliffContentZipped);
                    if ( $res_insert < 0 ) {
                        //custom error message passed directly to javascript client and displayed as is
                        $convertResult['errorMessage'] = "Error: File too large";
                        $this->result['code'] = -100;
                        $this->result['errors'][] = array( "code" => -100, "message" => $convertResult['errorMessage'] );
                        return;
                    }
                }

				unset ($xliffContentZipped);

				$res = $this->put_xliff_on_file( $xliffContent, $this->intDir );
				if ( !$res ) {

                    //custom error message passed directly to javascript client and displayed as is
                    $convertResult['errorMessage'] = "Error: failed to save file on disk";
                    $this->result['code'] = -100;
                    $this->result['errors'][] = array( "code" => -100, "message" => $convertResult['errorMessage'] );
                    //return false

				}

			} else {

                $file = pathinfo( $this->file_name );

                switch ( $file['extension'] ){
                    case 'docx':
                        $defaultError = "Conversion error. Try opening and saving the document with a new name. If this does not work, try converting to DOC.";
                        break;
                    case 'doc':
                    case 'rtf':
                        $defaultError = "Conversion error. Try opening and saving the document with a new name. If this does not work, try converting to DOCX.";
                        break;
                    case 'inx':
                        $defaultError = "Conversion Error. Try to commit changes in InDesign before importing.";
                        break;
                    default:
                        $defaultError = "Conversion error. Try opening and saving the document with a new name.";
                        break;
                }

				if (
                    stripos($convertResult['errorMessage'] ,"failed to create SDLXLIFF.") !== false ||
                    stripos($convertResult['errorMessage'] ,"COM target does not implement IDispatch") !== false
                ) {
					$convertResult['errorMessage'] = "Error: failed importing file.";

				} elseif( stripos($convertResult['errorMessage'] ,"Unable to open Excel file - it may be password protected") !== false ) {
                    $convertResult['errorMessage'] = $convertResult['errorMessage'] . " Try to remove protection using the Unprotect Sheet command on Windows Excel.";

                } elseif ( stripos( $convertResult['errorMessage'] ,"The document contains unaccepted changes" ) !== false ) {
                    $convertResult['errorMessage'] = "The document contains track changes. Accept all changes before uploading it.";

                } elseif( stripos($convertResult['errorMessage'] ,"Error: Could not find file") !== false ||
                        stripos($convertResult['errorMessage'] ,"tw4winMark") !== false ) {
                    $convertResult['errorMessage'] = $defaultError;

                } elseif ( stripos( $convertResult['errorMessage'] ,"Attempted to read or write protected memory" ) !== false ) {
                    $convertResult['errorMessage'] = $defaultError;

                } elseif( stripos( $convertResult['errorMessage'], "The document was created in Microsoft Word 97 or earlier" ) ){
                    $convertResult['errorMessage'] = $defaultError;

                } elseif( $file['extension'] == 'csv' && empty( $convertResult['errorMessage']  ) ){
                    $convertResult['errorMessage'] = "This CSV file is not eligible to be imported due internal wrong format. Try to convert in TXT using UTF8 encoding";

                } elseif( empty( $convertResult['errorMessage'] ) ){
                    $convertResult['errorMessage'] = "Failed to convert file. Internal error. Please Try again.";

                }

                //custom error message passed directly to javascript client and displayed as is
				$this->result['code'] = -100;
				$this->result['errors'][] = array("code" => -100, "message" => $convertResult['errorMessage']);

			}

		}
	}

	private function put_xliff_on_file($xliffContent) {

		if (!is_dir($this->intDir . "_converted")) {
			mkdir($this->intDir . "_converted");
		};

		$result = file_put_contents( "$this->intDir" . "_converted" . DIRECTORY_SEPARATOR . $this->file_name . ".sdlxliff", $xliffContent );

        //$result = number of bytes written
        if( $result ){
            $this->result['code'] = 1;
            return true;
        }
        else return false;

	}

}

?>
