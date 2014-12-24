<?

include_once INIT::$UTILS_ROOT . "/engines/tms_get_matches.class.php";
include_once INIT::$UTILS_ROOT . "/CatUtils.php";

class TMS_RESULT {

    public $responseStatus = "";
    public $responseDetails = "";
    public $responseData = "";
    public $matches = array();

    public function __construct( $result ) {

        $this->responseData    = $result[ 'responseData' ];
        $this->responseDetails = isset( $result[ 'responseDetails' ] ) ? $result[ 'responseDetails' ] : '';
        $this->responseStatus  = $result[ 'responseStatus' ];

        if ( is_array( $result ) and !empty( $result ) and array_key_exists( 'matches', $result ) ) {

            $matches = $result[ 'matches' ];
            if ( is_array( $matches ) and !empty( $matches ) ) {

                foreach ( $matches as $match ) {
                    $match[ 'raw_segment' ]     = $match[ 'segment' ];
                    $match[ 'segment' ]         = CatUtils::rawxliff2view( $match[ 'segment' ] );
                    $match[ 'raw_translation' ] = $match[ 'translation' ];
                    $match[ 'translation' ]     = CatUtils::rawxliff2view( $match[ 'translation' ] );

                    $currMatch        = new TMS_GET_MATCHES( $match );
                    $this->matches[ ] = $currMatch;
                }

            }

        }
    }

    public function get_matches_as_array() {
        $matchesArray = array();
        foreach ($this->matches as $match) {
            $item = $match->get_as_array();
            $matchesArray[] = $item;
        }
        return $matchesArray;
    }

    /**
     * Transform one level list to multi level matches based on segment key
     * @return array
     */
    public function get_glossary_matches_as_array(){
        $tmp_vector = array();
        $TMS_RESULT = $this->get_matches_as_array();
        foreach( $TMS_RESULT as $single_match ){
            $tmp_vector[$single_match['segment']][] = $single_match;
        }
        $TMS_RESULT = $tmp_vector;
        return $TMS_RESULT;
    }

    public function get_as_array() {
        return ((array) $this);
    }

}
?>
