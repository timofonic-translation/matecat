<?php
/**
 * Created by PhpStorm.
 */

/**
 * Concrete Class to negotiate a Quote/Login/Review/Confirm communication
 *
 * @author domenico domenico@translated.net / ostico@gmail.com
 * Date: 29/04/14
 * Time: 10.48
 * 
 */
class OutsourceTo_Translated extends OutsourceTo_AbstractProvider {
    private $currency;
    private $change_rate;
    /**
     * Class constructor
     *
     * There will be defined the callback urls for success or failure on login system
     *
     */
    public function __construct(){

        //SESSION ENABLED
        INIT::sessionStart();


        //$this->currency="EUR";
        //$this->change_rate= 1;


        // FORCE TO USD -- CHANGE RATE AT 2014-10-28
        $this->currency="US$";
        $this->change_rate= 1.2679;

        /**
         * @see OutsourceTo_AbstractProvider::$_outsource_login_url_ok
         */
        $this->_outsource_login_url_ok = INIT::$HTTPHOST . INIT::$BASEURL . "index.php?action=OutsourceTo_TranslatedSuccess";
        $this->_outsource_login_url_ko = INIT::$HTTPHOST . INIT::$BASEURL . "index.php?action=OutsourceTo_TranslatedError";

    }

    /**
     * Perform a quote on the remote Provider server
     *
     * @see OutsourceTo_AbstractProvider::performQuote
     *
     * @param array|null $volAnalysis
     */
    public function performQuote( $volAnalysis = null ){

        /**
         * cache this job info for 20 minutes ( session duration )
         */
        $cache_cart = Shop_Cart::getInstance( 'outsource_to_external_cache' );

        if ( $volAnalysis == null ) {

            //call matecat API for Project status and information
            $project_url_api = INIT::$HTTPHOST . INIT::$BASEURL . "api/status?id_project=" . $this->pid . "&project_pass=" . $this->ppassword;

            if ( !$cache_cart->itemExists( $project_url_api ) ) {

                //trick/hack for shop cart
                //Use the shop cart to add Projects info
                //to the cache cart because of taking advantage of the cart cache invalidation on project split/merge
                Log::doLog( "Project Not Found in Cache. Call API url for STATUS: " . $project_url_api );
                $raw_volAnalysis = file_get_contents( $project_url_api );

                $itemCart                = new Shop_ItemHTSQuoteJob();
                $itemCart[ 'id' ]        = $project_url_api;
                $itemCart[ 'show_info' ] = $raw_volAnalysis;

                $cache_cart->addItem( $itemCart );

            } else {

                $tmp_project_cache = $cache_cart->getItem( $project_url_api );
                $raw_volAnalysis   = $tmp_project_cache[ 'show_info' ];

            }

//        Log::doLog( $raw_volAnalysis );

            $volAnalysis = json_decode( $raw_volAnalysis, true );

        }

//        Log::doLog( $volAnalysis );
        $_jobLangs  = array();

        $options = array(
                CURLOPT_HEADER => false,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER => 0,
                CURLOPT_USERAGENT => "Matecat-Cattool/v" . INIT::$BUILD_NUMBER,
                CURLOPT_CONNECTTIMEOUT => 2
        );

        //prepare handlers for curl to quote service
        $mh = new MultiCurlHandler();
        foreach( $this->jobList as $job ){

            //trim decimals to int
            $job_payableWords =  (int)$volAnalysis[ 'data' ][ 'jobs' ][ $job[ 'jid' ] ][ 'totals' ][ $job['jpassword'] ]['TOTAL_PAYABLE'][0];

            /*
             * //languages are in the form:
             *
             *     "langpairs":{
             *          "5888-e94bd2f79afd":"en-GB|fr-FR",
             *          "5889-c853a841dafd":"en-GB|de-DE",
             *          "5890-e852ca45c66e":"en-GB|it-IT",
             *          "5891-b43f2f067319":"en-GB|es-ES"
             *   },
             *
             */
            $langPairs = $volAnalysis[ 'jobs' ][ 'langpairs' ][ $job[ 'jid' ] . "-" .$job['jpassword'] ];

            $_langPairs_array = explode( "|", $langPairs );
            $source = $_langPairs_array[0];
            $target = $_langPairs_array[1];

            //save langpairs of the jobs
            $_jobLangs[ $job[ 'jid' ] . "-" . $job[ 'jpassword' ] ][ 'source' ] = $source;
            $_jobLangs[ $job[ 'jid' ] . "-" . $job[ 'jpassword' ] ][ 'target' ] = $target;

            $url = "http://www.translated.net/hts/?f=quote&cid=htsdemo&p=htsdemo5&s=$source&t=$target&pn=MATECAT_{$job[ 'jid' ]}-{$job['jpassword']}&w=$job_payableWords&df=matecat&matecat_pid=" . $this->pid . "&matecat_ppass=" . $this->ppassword . "&matecat_pname=" . $volAnalysis[ 'data' ][ 'summary' ][ 'NAME' ];

            if( !$cache_cart->itemExists( $job[ 'jid' ] . "-" . $job['jpassword'] ) ){
                Log::doLog( "Not Found in Cache. Call url for Quote:  " . $url );
                $tokenHash = $mh->createResource( $url, $options, $job[ 'jid' ] . "-" .$job['jpassword'] );
            }

        }

        $mh->multiExec();

        $res = $mh->getAllContents();

        $failures = array();

        //fetch contents and store in cache if there are
        foreach( $res as $jpid => $quote ){

            /*
             * Quotes are plain text line feed separated fields in the form:
             *   1
             *   OK
             *   2014-04-16T09:30:00Z
             *   488
             *   46.36
             *   11140320
             *   1
             */

            Log::doLog($quote);

            $result_quote = explode( "\n", $quote );
            $itemCart                    = new Shop_ItemHTSQuoteJob();
            $itemCart[ 'id' ]            = $jpid;
            $itemCart[ 'project_name' ]  = $volAnalysis[ 'data' ][ 'summary' ][ 'NAME' ];
            $itemCart[ 'name' ]          = "MATECAT_$jpid";
            $itemCart[ 'delivery_date' ] = $result_quote[ 2 ];
            $itemCart[ 'words' ]         = $result_quote[ 3 ];
            $itemCart[ 'price' ]         = ( $result_quote[ 4 ] ? $result_quote[ 4 ] : 0 );
            $itemCart[ 'price_currency' ]= ( $result_quote[ 4 ] ? $result_quote[ 4 ] : 0 );
            $itemCart[ 'currency' ]      = $this->currency;
            $itemCart[ 'quote_pid' ]     = $result_quote[ 5 ];
            $itemCart[ 'source' ]        = $_jobLangs[ $jpid ]['source']; //get the right language
            $itemCart[ 'target' ]        = $_jobLangs[ $jpid ]['target']; //get the right language
            $itemCart[ 'show_info' ]     = $result_quote[ 6 ];

            if ($this->currency!="EUR"){
                $itemCart[ 'price_currency' ]=$itemCart[ 'price' ]*$this->change_rate;
            }

            $cache_cart->addItem( $itemCart );

            Log::doLog($itemCart);

            //Oops we got an error
            if( $itemCart[ 'price' ] == 0 && empty( $itemCart[ 'words' ] ) ) $failures[$jpid] = $jpid;

        }

        $shopping_cart = Shop_Cart::getInstance( 'outsource_to_external' );
        $shopping_cart->emptyCart();

        //now get the right contents
        foreach ( $this->jobList as $job ){
            $shopping_cart->addItem( $cache_cart->getItem( $job[ 'jid' ] . "-" . $job['jpassword'] ) );
        }

        $this->_quote_result = $shopping_cart->getCart();

        //check for failures.. destroy the cache
        if( !empty( $failures ) ){
            $cache_cart->emptyCart();
        }

    }

} 
