<?php
/**
 * Class engine already included in tms.class.php
 * BUT Not remove include_once INIT::$UTILS_ROOT . "/engines/engine.class.php";
 * Some PHP Version ( Ex: Debian 5.2.6-1+lenny13 does not work )
 */
include_once INIT::$UTILS_ROOT . "/engines/engine.class.php";
include_once INIT::$UTILS_ROOT . "/engines/tms.class.php";
include_once INIT::$MODEL_ROOT . "/queries.php";
include_once INIT::$UTILS_ROOT . '/AjaxPasswordCheck.php';

class deleteContributionController extends ajaxController {

    private $seg;
    private $tra;
    private $source_lang;
    private $target_lang;
    private $id_translator;
    private $password;
    private $tm_keys;

    public function __construct() {

        parent::__construct();

        $filterArgs = array(
                'source_lang'    => array( 'filter' => FILTER_SANITIZE_STRING, 'flags' => FILTER_FLAG_STRIP_LOW ),
                'target_lang'    => array( 'filter' => FILTER_SANITIZE_STRING, 'flags' => FILTER_FLAG_STRIP_LOW ),
                'seg'            => array( 'filter' => FILTER_UNSAFE_RAW ),
                'tra'            => array( 'filter' => FILTER_UNSAFE_RAW ),
                'id_translator'  => array( 'filter' => FILTER_SANITIZE_STRING, 'flags' => FILTER_FLAG_STRIP_LOW ),
                'password'       => array( 'filter' => FILTER_SANITIZE_STRING, 'flags' => FILTER_FLAG_STRIP_LOW ),
                'id_job'         => array( 'filter' => FILTER_SANITIZE_NUMBER_INT ),
        );

        $__postInput = filter_input_array( INPUT_POST, $filterArgs );

        $this->source_lang   = $__postInput[ 'source_lang' ];
        $this->target_lang   = $__postInput[ 'target_lang' ];
        $this->source        = trim( $__postInput[ 'seg' ] );
        $this->target        = trim( $__postInput[ 'tra' ] );
        $this->id_translator = trim( $__postInput[ 'id_translator' ] ); //no more used
        $this->password      = trim( $__postInput[ 'password' ] );
        $this->id_job        = $__postInput[ 'id_job' ];

    }

    public function doAction() {


        if ( empty( $this->source_lang ) ) {
            $this->result[ 'error' ][ ] = array( "code" => -1, "message" => "missing source_lang" );
        }

        if ( empty( $this->target_lang ) ) {
            $this->result[ 'error' ][ ] = array( "code" => -2, "message" => "missing target_lang" );
        }

        if ( empty( $this->source ) ) {
            $this->result[ 'error' ][ ] = array( "code" => -3, "message" => "missing source" );
        }

        if ( empty( $this->target ) ) {
            $this->result[ 'error' ][ ] = array( "code" => -4, "message" => "missing target" );
        }

        //get Job Infos
        $job_data = getJobData( (int) $this->id_job, $this->password );

        $pCheck = new AjaxPasswordCheck();
        //check for Password correctness
        if( empty( $job_data ) || !$pCheck->grantJobAccessByJobData( $job_data, $this->password ) ){
            $this->result[ 'error' ][ ] = array( "code" => -10, "message" => "wrong password" );
            return;
        }

        $this->tm_keys      = $job_data[ 'tm_keys' ];

        $config = TMS::getConfigStruct();

        $config[ 'segment' ]       = CatUtils::view2rawxliff( $this->source );
        $config[ 'translation' ]   = CatUtils::view2rawxliff( $this->target );
        $config[ 'source_lang' ]   = $this->source_lang;
        $config[ 'target_lang' ]   = $this->target_lang;
        $config[ 'email' ]         = "demo@matecat.com";
        $config[ 'id_user' ]       = array();


        $tms = new TMS( $job_data['id_tms'] );

        //get job's TM keys
        try{
            $tm_keys = TmKeyManagement_TmKeyManagement::getJobTmKeys($this->tm_keys, 'r', 'tm');

            if ( is_array( $tm_keys ) && !empty( $tm_keys ) ) {
                foreach ( $tm_keys as $tm_key ) {
                    $config[ 'id_user' ][ ] = $tm_key->key;
                }
            }

        }
        catch(Exception $e){
            $this->result[ 'error' ][ ] = array( "code" => -11, "message" => "Cannot retrieve TM keys info." );
            return;
        }

        //prepare the error report
        $set_code = array();

        /**
         * @var $tm_key TmKeyManagement_TmKeyStruct
         */
        foreach ( $tm_keys as $tm_key ) {
            $config[ 'id_user' ] = $tm_key->key;
            $TMS_RESULT = $tms->delete( $config );
            $set_code[ ] = $TMS_RESULT;
        }

        $set_successful = true;
        if( array_search( false, $set_code, true ) ){
            //There's an error
            $set_successful = false;
        }

        $this->result[ 'data' ] = ( $set_successful ? "OK" : null );
        $this->result[ 'code' ] = $set_successful;

    }


}

?>
