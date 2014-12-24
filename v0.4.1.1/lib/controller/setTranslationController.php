<?php

include_once INIT::$MODEL_ROOT . "/queries.php";
include_once INIT::$UTILS_ROOT . "/CatUtils.php";
include_once INIT::$UTILS_ROOT . '/QA.php';
include_once INIT::$UTILS_ROOT . '/AjaxPasswordCheck.php';
include_once INIT::$UTILS_ROOT . '/Log.php';

class setTranslationController extends ajaxController {

    protected $__postInput = array();

    protected $propagateAll = false;
    protected $id_job = false;
    protected $password = false;

    protected $id_segment;
    protected $id_translator;
    protected $time_to_edit;
    protected $translation;
    protected $chosen_suggestion_index;
    protected $status;

    protected $jobData = array();


    public function __construct() {

        parent::__construct();

        $filterArgs = array(
                'id_job'                  => array( 'filter' => FILTER_SANITIZE_NUMBER_INT ),
                'password'                => array( 'filter' => FILTER_SANITIZE_STRING, 'flags' => FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH ),
                'propagateAll'            => array( 'filter' => FILTER_VALIDATE_BOOLEAN, 'flags' => FILTER_NULL_ON_FAILURE ),
                'id_segment'              => array( 'filter' => FILTER_SANITIZE_NUMBER_INT ),
                'time_to_edit'            => array( 'filter' => FILTER_SANITIZE_NUMBER_INT ),
                'id_translator'           => array( 'filter' => FILTER_SANITIZE_STRING, 'flags' => FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH ),
                'translation'             => array( 'filter' => FILTER_UNSAFE_RAW ),
                'chosen_suggestion_index' => array( 'filter' => FILTER_SANITIZE_NUMBER_INT ),
                'status'                  => array( 'filter' => FILTER_SANITIZE_STRING, 'flags' => FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH ),
        );

        $this->__postInput = filter_input_array( INPUT_POST, $filterArgs );

        $this->id_job                  = $this->__postInput[ 'id_job' ];
        $this->password                = $this->__postInput[ 'password' ];
        $this->propagateAll            = $this->__postInput[ 'propagateAll' ]; //not used here but used in child class setAutoPropagationController
        $this->id_segment              = $this->__postInput[ 'id_segment' ];
        $this->time_to_edit            = (int)$this->__postInput[ 'time_to_edit' ]; //cast to int, so the default is 0
        $this->id_translator           = $this->__postInput[ 'id_translator' ];
        $this->translation             = CatUtils::view2rawxliff( $this->__postInput[ 'translation' ] );
        $this->chosen_suggestion_index = $this->__postInput[ 'chosen_suggestion_index' ];
        $this->status                  = strtoupper( $this->__postInput[ 'status' ] );

	//PATCH TO FIX BOM INSERTIONS
	$this->translation = str_replace("\xEF\xBB\xBF",'',$this->translation);

    }

    protected function _checkData( $logName = 'log.txt' ) {

        //change Log file
        Log::$fileName = $logName;

        switch ( $this->status ) {
            case Constants_TranslationStatus::STATUS_TRANSLATED:
            case Constants_TranslationStatus::STATUS_APPROVED:
            case Constants_TranslationStatus::STATUS_REJECTED:
            case Constants_TranslationStatus::STATUS_DRAFT:
                break;
            default:
                //NO debug and NO-actions for un-mapped status
                $this->result[ 'code' ] = 1;
                $this->result[ 'data' ] = "OK";

                $msg = "Error Hack Status \n\n " . var_export( $_POST, true );
                throw new Exception( $msg, -1 );
                break;
        }

        if ( empty( $this->id_segment ) ) {
            $this->result[ 'error' ][ ] = array( "code" => -1, "message" => "missing id_segment" );
        }

        if ( empty( $this->id_job ) ) {
            $this->result[ 'error' ][ ] = array( "code" => -2, "message" => "missing id_job" );
        } else {

            //get Job Info, we need only a row of jobs ( split )
            $this->jobData = $job_data = getJobData( (int)$this->id_job, $this->password );
            if ( empty( $job_data ) ) {
                $msg = "Error : empty job data \n\n " . var_export( $_POST, true ) . "\n";
                Log::doLog( $msg );
                Utils::sendErrMailReport( $msg );
            }

            $db    = Database::obtain();
            $err   = $db->get_error();
            $errno = $err[ 'error_code' ];

            if ( $errno != 0 ) {
                $msg                        = "Error : empty job data \n\n " . var_export( $_POST, true ) . "\n";
                $this->result[ 'error' ][ ] = array( "code" => -101, "message" => "database error" );

                throw new Exception( $msg, -1 );
            }

            //add check for job status archived.
            if ( strtolower( $job_data[ 'status' ] ) == Constants_JobStatus::STATUS_ARCHIVED ) {
                $this->result[ 'error' ][ ] = array( "code" => -3, "message" => "job archived" );
            }

            $pCheck = new AjaxPasswordCheck();
            //check for Password correctness
            if ( empty( $job_data ) || !$pCheck->grantJobAccessByJobData( $job_data, $this->password, $this->id_segment ) ) {
                $this->result[ 'error' ][ ] = array( "code" => -10, "message" => "wrong password" );
            }

        }

        //ONE OR MORE ERRORS OCCURRED : EXITING
        if ( !empty( $this->result[ 'error' ] ) ) {
            $msg = "Error \n\n " . var_export( array_merge( $this->result, $_POST ), true );
            throw new Exception( $msg, -1 );
        }

        if ( is_null( $this->translation ) || $this->translation === '' ) {
            Log::doLog( "Empty Translation \n\n" . var_export( $_POST, true ) );

            // won't save empty translation but there is no need to return an error
            throw new Exception( "Empty Translation \n\n" . var_export( $_POST, true ), 0 );
        }

    }


    public function doAction() {

        try {

            $this->_checkData();

        } catch ( Exception $e ) {

            if ( $e->getCode() == -1 ) {
                Utils::sendErrMailReport( $e->getMessage() );
            }

            Log::doLog( $e->getMessage() );

            return $e->getCode();

        }

        //check tag mismatch
        //get original source segment, first
        $segment = getSegment( $this->id_segment );

        //compare segment-translation and get results
        $check = new QA( $segment[ 'segment' ], $this->translation );
        $check->performConsistencyCheck();

        if ( $check->thereAreWarnings() ) {
            $err_json    = $check->getWarningsJSON();
            $translation = $this->translation;
        } else {
            $err_json    = '';
            $translation = $check->getTrgNormalized();

        }

        /*
         * begin stats counter
         *
         * It works good with default InnoDB Isolation level
         *
         * REPEATABLE-READ offering a row level lock for this id_segment
         *
         */
        $db = Database::obtain();
        $db->begin();

//        $x = uniqid('',true);
//        Log::doLog("$x Acquiring Lock");
//        $x2 = explode( "\n" , var_export( $this->__postInput, true) );
//        Log::doLog("$x Lock: Trying to set " . implode( " ", $x2 ) );
        $old_translation = getCurrentTranslationAndLock( $this->id_job, $this->id_segment );
//        Log::doLog("$x Lock Acquired");

        //if volume analysis is not enabled and no translation rows exists
        //create the row
        if ( !INIT::$VOLUME_ANALYSIS_ENABLED && empty( $old_translation[ 'status' ] ) ) {

            $_Translation                             = array();
            $_Translation[ 'id_segment' ]             = (int)$this->id_segment;
            $_Translation[ 'id_job' ]                 = (int)$this->id_job;
            $_Translation[ 'status' ]                 = Constants_TranslationStatus::STATUS_NEW;
            $_Translation[ 'segment_hash' ]           = $segment[ 'segment_hash' ];
            $_Translation[ 'translation' ]            = $segment[ 'segment' ];
            $_Translation[ 'standard_word_count' ]    = $segment[ 'raw_word_count' ];
            $_Translation[ 'serialized_errors_list' ] = '';
            $_Translation[ 'suggestion_position' ]    = 0;
            $_Translation[ 'warning' ]                = false;
            $_Translation[ 'translation_date' ]       = date( "Y-m-d H:i:s" );
            $res = addTranslation( $_Translation );

            if( $res < 0 ){
                $this->result[ 'error' ][ ] = array( "code" => -101, "message" => "database error" );
                $db->rollback();
                return $res;
            }

            /*
             * begin stats counter
             *
             */
            $old_translation = $_Translation;

        }

        $_Translation                             = array();
        $_Translation[ 'id_segment' ]             = $this->id_segment;
        $_Translation[ 'id_job' ]                 = $this->id_job;
        $_Translation[ 'status' ]                 = $this->status;
        $_Translation[ 'time_to_edit' ]           = $this->time_to_edit;
        $_Translation[ 'translation' ]            = preg_replace( '/[ \t\n\r\0\x0A\xA0]+$/u', '', $translation );
        $_Translation[ 'serialized_errors_list' ] = $err_json;
        $_Translation[ 'suggestion_position' ]    = $this->chosen_suggestion_index;
        $_Translation[ 'warning' ]                = $check->thereAreWarnings();
        $_Translation[ 'translation_date' ]       = date( "Y-m-d H:i:s" );

        /**
         * when the status of the translation changes, the auto propagation flag
         * must be removed
         */
        if ( $_Translation[ 'translation' ] != $old_translation[ 'translation' ] || $this->status == Constants_TranslationStatus::STATUS_TRANSLATED || $this->status == Constants_TranslationStatus::STATUS_APPROVED ) {
            $_Translation[ 'autopropagated_from' ] = 'NULL';
        }

        $res = CatUtils::addSegmentTranslation( $_Translation );

        if ( !empty( $res[ 'error' ] ) ) {
            $this->result[ 'error' ] = $res[ 'error' ];

            $msg = "\n\n Error addSegmentTranslation \n\n Database Error \n\n " . var_export( array_merge( $this->result, $_POST ), true );
            Log::doLog( $msg );
            Utils::sendErrMailReport( $msg );
            $db->rollback();
            return -1;
        }

        //propagate translations
        $TPropagation                             = array();

        //Warning: this value will NOT be used to update values,
        //but to exclude current segment from auto-propagation
        $_idSegment                               = $this->id_segment;

        $TPropagation[ 'id_job' ]                 = $this->id_job;
        $TPropagation[ 'status' ]                 = Constants_TranslationStatus::STATUS_DRAFT;
        $TPropagation[ 'translation' ]            = $translation;
        $TPropagation[ 'autopropagated_from' ]    = $this->id_segment;
        $TPropagation[ 'serialized_errors_list' ] = $err_json;
        $TPropagation[ 'warning' ]                = $check->thereAreWarnings();
        $TPropagation[ 'translation_date' ]       = date( "Y-m-d H:i:s" );
        $TPropagation[ 'segment_hash' ]           = $old_translation[ 'segment_hash' ];

        if ( $this->status == Constants_TranslationStatus::STATUS_TRANSLATED ) {

            try {

                $cookie_key = '_auto-propagation-' . $this->id_job . "-" . $this->password;

                /**
                 * This set auto-propagation to all with status DRAFT, NEW, REJECTED
                 *
                 * This set also to status TRANSLATED if a cookie for Auto-propagate ALL is set on the client
                 *
                 */
                $propagateToTranslated = false;
                if ( (bool)$_COOKIE[ $cookie_key ] ) {
                    $propagateToTranslated = true;
                }

                propagateTranslation( $TPropagation, $this->jobData, $_idSegment, $propagateToTranslated );

            } catch ( Exception $e ) {
                $msg = $e->getMessage() . "\n\n" . $e->getTraceAsString();
                Log::doLog( $msg );
                Utils::sendErrMailReport( $msg );
            }

        }

        //Recount Job Totals
        $old_wStruct = new WordCount_Struct();
        $old_wStruct->setIdJob( $this->id_job );
        $old_wStruct->setJobPassword( $this->password );
        $old_wStruct->setNewWords( $this->jobData[ 'new_words' ] );
        $old_wStruct->setDraftWords( $this->jobData[ 'draft_words' ] );
        $old_wStruct->setTranslatedWords( $this->jobData[ 'translated_words' ] );
        $old_wStruct->setApprovedWords( $this->jobData[ 'approved_words' ] );
        $old_wStruct->setRejectedWords( $this->jobData[ 'rejected_words' ] );

        $old_wStruct->setIdSegment( $this->id_segment );

        //redundant, this is made into WordCount_Counter::updateDB
        $old_wStruct->setOldStatus( $old_translation[ 'status' ] );
        $old_wStruct->setNewStatus( $this->status );

        //redundant because the update is made only where status = old status
        if ( $this->status != $old_translation[ 'status' ] ) {

            //cambiato status, sposta i conteggi
            $old_count = ( !is_null( $old_translation[ 'eq_word_count' ] ) ? $old_translation[ 'eq_word_count' ] : $segment[ 'raw_word_count' ] );

            //if there is not a row in segment_translations because volume analysis is disabled
            //search for a just created row
            $old_status = ( !empty( $old_translation[ 'status' ] ) ? $old_translation[ 'status' ] : Constants_TranslationStatus::STATUS_NEW );

            $counter = new WordCount_Counter( $old_wStruct );
            $counter->setOldStatus( $old_status );
            $counter->setNewStatus( $this->status );
            $newValues = $counter->getUpdatedValues( $old_count );

            try{
                $newTotals = $counter->updateDB( $newValues );
            } catch ( Exception $e ){
                $this->result[ 'error' ][ ] = array( "code" => -101, "message" => "database error" );
//                Log::doLog("Lock: Transaction Aborted. " . $e->getMessage() );
//                $x1 = explode( "\n" , var_export( $old_translation, true) );
//                Log::doLog("Lock: Translation status was " . implode( " ", $x1 ) );
                $db->rollback();
                return $e->getCode();
            }

        } else {
            $newTotals = $old_wStruct;
        }

        $job_stats = CatUtils::getFastStatsForJob( $newTotals );
        $project   = getProject( $this->jobData[ 'id_project' ] );
        $project   = array_pop( $project );

        $job_stats[ 'ANALYSIS_COMPLETE' ] = (

        $project[ 'status_analysis' ] == Constants_ProjectStatus::STATUS_DONE || $project[ 'status_analysis' ] == Constants_ProjectStatus::STATUS_NOT_TO_ANALYZE

                ? true : false );

        $file_stats = array();

        $this->result[ 'stats' ]      = $job_stats;
        $this->result[ 'file_stats' ] = $file_stats;
        $this->result[ 'code' ]       = 1;
        $this->result[ 'data' ]       = "OK";

        /* FIXME: added for code compatibility with front-end. Remove. */
        $_warn   = $check->getWarnings();
        $warning = $_warn[ 0 ];
        /* */

        $this->result[ 'warning' ][ 'cod' ] = $warning->outcome;
        if ( $warning->outcome > 0 ) {
            $this->result[ 'warning' ][ 'id' ] = $this->id_segment;
        } else {
            $this->result[ 'warning' ][ 'id' ] = 0;
        }

        $db->commit();

        if( $job_stats[ 'TRANSLATED_PERC' ] == '100' ){
            $update_completed = setJobCompleteness( $this->id_job, 1 );
        }

        if ( @$update_completed < 0 ) {
            $msg = "\n\n Error setJobCompleteness \n\n " . var_export( $_POST, true );
            Log::doLog( $msg );
            Utils::sendErrMailReport( $msg );
        }

    }

}
