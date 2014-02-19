<?
include_once INIT::$MODEL_ROOT . "/queries.php";
include_once INIT::$UTILS_ROOT . "/CatUtils.php";
include_once INIT::$UTILS_ROOT . "/QA.php";

class getWarningController extends ajaxController {

    private $__postInput = null;

    public function __destruct() {
    }

    public function __construct() {

        $this->disableSessions();
        parent::__construct();

        $filterArgs = array(

            'id'          => array( 'filter' => FILTER_SANITIZE_NUMBER_INT ),
            'id_job'      => array( 'filter' => FILTER_SANITIZE_NUMBER_INT ),
            'src_content' => array( 'filter' => FILTER_UNSAFE_RAW ),
            'trg_content' => array( 'filter' => FILTER_UNSAFE_RAW ),
            'password'    => array( 'filter' => FILTER_SANITIZE_STRING, 'flags' => FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH ),
            'token'       => array( 'filter' => FILTER_SANITIZE_STRING,
                                    'flags'  => FILTER_FLAG_STRIP_LOW ),

        );

        $this->__postInput = (object)filter_input_array( INPUT_POST, $filterArgs );

    }

    /**
     * Return to Javascript client the JSON error list in the form:
     *
     * <pre>
     * array(
     *       [total] => 1
     *       [details] => Array
     *       (
     *           ['2224860'] => Array
     *               (
     *                   [id_segment] => 2224860
     *                   [warnings] => '[{"outcome":1000,"debug":"Tag mismatch"}]'
     *               )
     *       )
     *      [token] => 'token'
     * )
     * </pre>
     *
     */
    public function doAction() {
        if ( empty( $this->__postInput->id ) ) {
            $this->__globalWarningsCall();
        } else {
            $this->__postInput->src_content = CatUtils::view2rawxliff( $this->__postInput->src_content );
            $this->__postInput->trg_content = CatUtils::view2rawxliff( $this->__postInput->trg_content );
            $this->__segmentWarningsCall();
        }

    }


    /**
     *
     * getWarning $query are in the form:
     * <pre>
     * Array
     * (
     * [0] => Array
     *     (
     *         [id_segment] => 2224900
     *     ),
     * [1] => Array
     *     (
     *         [id_segment] => 2224903
     *     ),
     * )
     * </pre>
     */
    private function __globalWarningsCall() {
        $result                  = getWarning( $this->__postInput->id_job, $this->__postInput->password );

        foreach ( $result as $position => &$item ) {

            //PATCH - REMOVE WHITESPACES FROM GLOBAL WARNING ( Backward compatibility )
            $serialized_err = json_decode( $item['serialized_errors_list'] );

            $foundTagMismatch = false;
            foreach( $serialized_err as $k => $error ){

                switch ( $error->outcome ) {
                    case QA::ERR_TAG_MISMATCH:
                    case QA::ERR_TAG_ID:
                    case QA::ERR_UNCLOSED_X_TAG:
                        $foundTagMismatch = true;
                        break;
                }

            }

            if( !$foundTagMismatch ){
                unset( $result[$position] );
            } else {
                $item = $item[ 'id_segment' ];
            }
            //PATCH - REMOVE WHITESPACES FROM GLOBAL WARNING ( Backward compatibility )

        }

        $this->result[ 'details' ] = array_values($result);
        $this->result[ 'token' ]   = $this->__postInput->token;
    }

    /**
     * Performs a check on single segment
     *
     */
    private function __segmentWarningsCall() {

        $this->result[ 'details' ] = null;
        $this->result[ 'token' ]   = $this->__postInput->token;
        $this->result[ 'total' ]   = 0;

        $QA = new QA( $this->__postInput->src_content, $this->__postInput->trg_content );
        $QA->performConsistencyCheck();
        if ( $QA->thereAreWarnings() ) {
//        if ( $QA->thereAreErrors() ) {
            $this->result[ 'details' ]                 = array();
            $this->result[ 'details' ]                 = array();
            $this->result[ 'details' ][ 'id_segment' ] = $this->__postInput->id;
//            $this->result[ 'details' ][ 'warnings' ]   = $QA->getErrorsJSON();
//            $this->result[ 'total' ]                                             = count( $QA->getErrors() );
            $this->result[ 'details' ][ 'warnings' ]     = $QA->getWarningsJSON();
            $this->result[ 'details' ][ 'tag_mismatch' ] = $QA->getMalformedXmlStructs();
            $this->result[ 'total' ]                     = count( $QA->getWarnings() );

        }

    }

}

?>
