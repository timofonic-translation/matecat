<?php
date_default_timezone_set("Europe/Rome");

class INIT {

	private static $instance;
	public static $ROOT;
	public static $BASEURL;
	public static $HTTPHOST;
	public static $DEBUG;
	public static $DB_SERVER;
	public static $DB_DATABASE;
	public static $DB_USER;
	public static $DB_PASS;
	public static $LOG_REPOSITORY;
	public static $STORAGE_DIR;
	public static $UPLOAD_REPOSITORY;
	public static $CONVERSIONERRORS_REPOSITORY;
	public static $CONVERSIONERRORS_REPOSITORY_WEB;
	public static $TMP_DOWNLOAD;
	public static $TEMPLATE_ROOT;
	public static $MODEL_ROOT;
	public static $CONTROLLER_ROOT;
	public static $UTILS_ROOT;
	public static $DEFAULT_NUM_RESULTS_FROM_TM;
	public static $THRESHOLD_MATCH_TM_NOT_TO_SHOW;
	public static $TIME_TO_EDIT_ENABLED;
	public static $ENABLED_BROWSERS;
	public static $BUILD_NUMBER;
	public static $DEFAULT_FILE_TYPES;
	public static $SUPPORTED_FILE_TYPES;
	public static $UNSUPPORTED_FILE_TYPES;
	public static $CONVERSION_FILE_TYPES;
	public static $CONVERSION_FILE_TYPES_PARTIALLY_SUPPORTED;
	public static $CONVERSION_ENABLED;
	public static $ANALYSIS_WORDS_PER_DAYS;
	public static $VOLUME_ANALYSIS_ENABLED;
	public static $WARNING_POLLING_INTERVAL;
	public static $SEGMENT_QA_CHECK_INTERVAL;
	public static $SAVE_SHASUM_FOR_FILES_LOADED;
	public static $AUTHSECRET;
	public static $AUTHSECRET_PATH;
	public static $AUTHCOOKIENAME;
	public static $AUTHCOOKIEDURATION;
	public static $SPELL_CHECK_TRANSPORT_TYPE;
	public static $SPELL_CHECK_ENABLED;
	public static $MAX_UPLOAD_FILE_SIZE;
	public static $MAX_NUM_FILES;
    public static $REFERENCE_REPOSITORY;

	private function initOK() {

		$flagfile = ".initok.lock";
		if (file_exists($flagfile)) {
			return true;
		}
		$errors = "";
		if (self::$DB_SERVER == "@ip address@") {
			$errors.="\$DB_SERVER not initialized\n";
		}

		if (self::$DB_USER == "@username@") {
			$errors.="\$DB_USER not initialized\n";
		}

		if (self::$DB_PASS == "@password@") {
			$errors.="\$DB_PASS not initialized\n";
		}


		if (empty($errors)) {
			touch($flagfile);
			return true;
		} else {

			echo "<pre>
				APPLICATION INIT ERROR : \n
				$errors\n";
			return false;
		}
	}

	public static function obtain() {
		if (!self::$instance) {
			self::$instance = new INIT();
		}

		return self::$instance;
	}

	public static function sessionClose(){
		@session_write_close();
	}

	private function __construct() {

        register_shutdown_function( 'INIT::fatalErrorHandler' );

		$root = realpath(dirname(__FILE__) . '/../');
		self::$ROOT = $root;  // Accesible by Apache/PHP
		self::$BASEURL = "/"; // Accesible by the browser

		if( stripos( PHP_SAPI, 'cli' ) === false ){
			//access session data
			@session_start();
			register_shutdown_function( 'INIT::sessionClose' );
			
			$protocol=stripos($_SERVER['SERVER_PROTOCOL'],"https")===FALSE?"http":"https";
			self::$HTTPHOST="$protocol://$_SERVER[HTTP_HOST]";
		} else {
			echo "\nPHP Running in CLI mode.\n\n";
			//Possible CLI configurations. We definitly don't want sessions in our cron scripts
		}

		set_include_path(get_include_path() . PATH_SEPARATOR . $root);

		self::$TIME_TO_EDIT_ENABLED = false;


		self::$DEFAULT_NUM_RESULTS_FROM_TM = 3;
		self::$THRESHOLD_MATCH_TM_NOT_TO_SHOW = 50;

		self::$DB_SERVER   = "localhost"; //database server
		self::$DB_DATABASE = "matecat"; //database name
		self::$DB_USER     = "matecat"; //database login
		self::$DB_PASS     = "matecat01"; //databasepassword


		self::$STORAGE_DIR                     = self::$ROOT . "/storage";
		self::$LOG_REPOSITORY                  = self::$STORAGE_DIR . "/log_archive";
		self::$UPLOAD_REPOSITORY               = self::$STORAGE_DIR . "/upload";
		self::$CONVERSIONERRORS_REPOSITORY     = self::$STORAGE_DIR . "/conversion_errors";
		self::$CONVERSIONERRORS_REPOSITORY_WEB = self::$BASEURL . "storage/conversion_errors";
		self::$TMP_DOWNLOAD                    = self::$STORAGE_DIR . "/tmp_download";
		self::$REFERENCE_REPOSITORY            = self::$STORAGE_DIR . "/reference_files";
		self::$TEMPLATE_ROOT                   = self::$ROOT . "/lib/view";
		self::$MODEL_ROOT                      = self::$ROOT . '/lib/model';
		self::$CONTROLLER_ROOT                 = self::$ROOT . '/lib/controller';
		self::$UTILS_ROOT                      = self::$ROOT . '/lib/utils';


		if (!is_dir(self::$STORAGE_DIR)){
			mkdir (self::$STORAGE_DIR,0755,true);
		}
		if (!is_dir(self::$LOG_REPOSITORY)){
			mkdir (self::$LOG_REPOSITORY,0755,true);
		}
		if (!is_dir(self::$UPLOAD_REPOSITORY)){
			mkdir (self::$UPLOAD_REPOSITORY,0755,true);
		}
		if (!is_dir(self::$CONVERSIONERRORS_REPOSITORY)){
			mkdir (self::$CONVERSIONERRORS_REPOSITORY,0755,true);
		}

		//auth sections
        self::$AUTHSECRET_PATH=  self::$ROOT . '/lib/utils/openid/login_secret.dat';
		//if secret is set in file
		if(file_exists(self::$AUTHSECRET_PATH)){
			//fetch it
			self::$AUTHSECRET=file_get_contents(self::$AUTHSECRET_PATH);
		}else{
			//try creating the file and the fetch it
			//generate pass
			$secret=self::generate_password(512);
			//put file
			file_put_contents(self::$AUTHSECRET_PATH,$secret);
			//if put succeed
			if(file_exists(self::$AUTHSECRET_PATH)){
				//restrict permissions
				chmod(self::$AUTHSECRET_PATH,0400);
			}else{
				//if couldn't create due to permissions, use default secret
				self::$AUTHSECRET='ScavengerOfHumanSorrow';
			}
		}

		self::$AUTHCOOKIENAME='matecat_login';
		self::$AUTHCOOKIEDURATION=86400*60;
		self::$ENABLED_BROWSERS = array('chrome', 'safari', 'firefox');
		self::$CONVERSION_ENABLED = false;
		self::$ANALYSIS_WORDS_PER_DAYS = 3000;
		self::$BUILD_NUMBER = '0.3.3.7.1';
		self::$VOLUME_ANALYSIS_ENABLED = true;

		self::$WARNING_POLLING_INTERVAL = 20; //seconds
		self::$SEGMENT_QA_CHECK_INTERVAL = 1; //seconds

		self::$SPELL_CHECK_TRANSPORT_TYPE = 'shell';
		self::$SPELL_CHECK_ENABLED = false;

		self::$SAVE_SHASUM_FOR_FILES_LOADED = true;
        self::$MAX_UPLOAD_FILE_SIZE = 60 * 1024 * 1024; // bytes
        self::$MAX_NUM_FILES = 100;

		self::$SUPPORTED_FILE_TYPES = array(
				'Office' => array(
					'doc' => array(''),
					'dot' => array(''),
					'docx' => array(''),
					'dotx' => array(''),
					'docm' => array(''),
					'dotm' => array(''),
					'pdf' => array(''),
					'xls' => array(''),
					'xlt' => array(''),
					'xlsm' => array(''),
					'xlsx' => array(''),
					'xltx' => array(''),
					'pot' => array(''),
					'pps' => array(''),
					'ppt' => array(''),
					'potm' => array(''),
					'potx' => array(''),
					'ppsm' => array(''),
					'ppsx' => array(''),
					'pptm' => array(''),
					'pptx' => array(''),
					'odp' => array(''),
					'ods' => array(''),
					'odt' => array(''),
					'sxw' => array(''),
					'sxc' => array(''),
					'sxi' => array(''),
					'txt' => array(''),
					'csv' => array(''),
					'xml' => array('')
						//                'vxd' => array("Try converting to XML")
						),
					'Web' => array(
							'htm' => array(''),
							'html' => array(''),
							'xhtml' => array(''),
							'xml' => array('')
						      ),
					"Interchange Formats" => array(
							'xliff' => array('default'),
							'sdlxliff' => array('default'),
							'ttx' => array(''),
							'itd' => array(''),
							'xlf' => array('default')
							),
					"Desktop Publishing" => array(
							//                'fm' => array('', "Try converting to MIF"),
							'mif' => array(''),
							'inx' => array(''),
							'idml' => array(''),
							'icml' => array(''),
							//                'indd' => array('', "Try converting to INX"),
							'xtg' => array(''),
							'tag' => array(''),
							'xml' => array(''),
							'dita' => array('')
							),
					"Localization" => array(
							'properties' => array(''),
							'rc' => array(''),
							'resx' => array(''),
							'xml' => array(''),
							'dita' => array(''),
							'sgml' => array(''),
							'sgm' => array('')
							)
						);
		self::$UNSUPPORTED_FILE_TYPES = array(
				'fm' => array('', "Try converting to MIF"),
				'indd' => array('', "Try converting to INX")
				);

		//self::$DEFAULT_FILE_TYPES = 'xliff|sdlxliff|xlf';
		//self::$CONVERSION_FILE_TYPES = 'doc|dot|docx|dotx|docm|dotm|rtf|pdf|xls|xlsx|xlt|xltx|pot|pps|ppt|potm|potx|ppsm|ppsx|pptm|pptx|mif|inx|idml|icml|txt|csv|htm|html|xhtml|properties|odp|ods|odt|sxw|sxc|sxi|xtg|tag|itd|sgml|sgm|dll|exe|rc|ttx|resx|dita|fm|vxd|indd';
		//self::$CONVERSION_FILE_TYPES_PARTIALLY_SUPPORTED = '[{"format": "fm", "message": "Try converting to MIF"},{"format": "indd", "message": "Try converting to INX"},{"format": "vxd", "message": "Try converting to XML"}]';

		//if (!$this->initOK()) {
		//    throw new Exception("ERROR");
		//}
	}

    public static function fatalErrorHandler() {

        $errorType = array (
            E_CORE_ERROR        => 'E_CORE_ERROR',
            E_COMPILE_ERROR     => 'E_COMPILE_ERROR',
            E_ERROR             => 'E_ERROR',
            E_USER_ERROR        => 'E_USER_ERROR',
            E_RECOVERABLE_ERROR => 'E_RECOVERABLE_ERROR',
            //E_DEPRECATED        => 'DEPRECATION_NOTICE', //From PHP 5.3
        );

        # Getting last error
        $error = error_get_last();

        # Checking if last error is a fatal error
        switch ( $error['type'] ){
            case E_CORE_ERROR:
            case E_COMPILE_ERROR:
            case E_ERROR:
            case E_USER_ERROR:
            case E_RECOVERABLE_ERROR:

                if( !ob_get_clean() ) ob_start();
                debug_print_backtrace();
                $output = ob_get_contents();
                ob_end_clean();

                # Here we handle the error, displaying HTML, logging, ...
                $output .= "<pre>";
                $output .= "[ {$errorType[$error['type']]} ]\n\t";
                $output .= "{$error['message']}\n\t";
                $output .=  "Not Recoverable Error on line {$error['line']} in file " . $error['file'];
                $output .=  " - PHP " . PHP_VERSION . " (" . PHP_OS . ")\n";
                $output .=  "\n\t";
                $output .=  "Aborting...\n";
                $output .= "</pre>";

                Log::$fileName = 'fatal_errors.txt';
                Log::doLog( $output );
                Utils::sendErrMailReport( $output );

                header( "HTTP/1.1 200 OK" );

                if( ( isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest' ) || $_SERVER['REQUEST_METHOD'] == 'POST' ) {

                    //json_rersponse
                    if( INIT::$DEBUG ){
                        echo json_encode( array("errors" => array( array( "code" => -1000, "message" => $output ) ), "data" => array() ) );
                    } else {
                        echo json_encode( array("errors" => array( array( "code" => -1000, "message" => "Oops we got an Error. Contact <a href='mailto:support@matecat.com'>support@matecat.com</a>" ) ), "data" => array() ) ) ;
                    }

                } elseif( INIT::$DEBUG ){
                    echo $output;
                }

                break;
        }

    }

	private static function generate_password( $length = 12 ) {

		$_pwd = md5( uniqid('',true) );
		$pwd = substr( $_pwd, 0, 6 ) . substr( $_pwd, -6, 6 );

		if( $length > 12 ){
			while( strlen($pwd) < $length ){
				$pwd .= self::generate_password();
			}
			$pwd = substr( $pwd, 0, $length );
		}

		return $pwd;

	}

}

?>
