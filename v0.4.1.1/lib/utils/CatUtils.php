<?

include_once INIT::$MODEL_ROOT . "/queries.php";
include_once INIT::$UTILS_ROOT . "/MyMemory.copyrighted.php";
include_once INIT::$UTILS_ROOT . "/Utils.php";
include_once INIT::$UTILS_ROOT . "/langs/languages.class.php";

define("LTPLACEHOLDER", "##LESSTHAN##");
define("GTPLACEHOLDER", "##GREATERTHAN##");
define("AMPPLACEHOLDER", "##AMPPLACEHOLDER##");
//define("NBSPPLACEHOLDER", "<x id=\"nbsp\"/>");

class CatUtils {

    const lfPlaceholderClass   = '_0A';
    const crPlaceholderClass   = '_0D';
    const crlfPlaceholderClass = '_0D0A';
    const lfPlaceholder        = '##$_0A$##';
    const crPlaceholder        = '##$_0D$##';
    const crlfPlaceholder      = '##$_0D0A$##';
    const lfPlaceholderRegex   = '/\#\#\$_0A\$\#\#/g';
    const crPlaceholderRegex   = '/\#\#\$_0D\$\#\#/g';
    const crlfPlaceholderRegex = '/\#\#\$_0D0A\$\#\#/g';

    const tabPlaceholder       = '##$_09$##';
    const tabPlaceholderClass  = '_09';
    const tabPlaceholderRegex  = '/\#\#\$_09\$\#\#/g';

    const nbspPlaceholder       = '##$_A0$##';
    const nbspPlaceholderClass  = '_A0';
    const nbspPlaceholderRegex  = '/\#\#\$_A0\$\#\#/g';

    public static $cjk = array( 'zh' => 1.8, 'ja' => 2.5, 'ko' => 2.5, 'km' => 5 );

    private static $langPair2MTpayableRates = array(
            "en" => array(
                    "it" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 80
                    ),
                    "fr" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 80
                    ),
                    "pt" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 80
                    ),
                    "es" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 80
                    ),
                    "nl" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 80
                    ),
                    "pl" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "uk" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "hi" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "fi" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "tr" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "ru" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "zh" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "ar" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "ko" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "lt" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "ja" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "he" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    ),
                    "sr" => array(
                            'NO_MATCH'    => 100,
                            '50%-74%'     => 100,
                            '75%-99%'     => 60,
                            '100%'        => 30,
                            'REPETITIONS' => 30,
                            'INTERNAL'    => 60,
                            'MT'          => 90
                    )
            )
    );

    /**
     * Get the payable rate for a given langpair.
     * NB: the map is supposed to be symmetric. If there is the need to make it asymmetric, please change this method
     * and the corresponding map.
     *
     * @param $source string The first two chars of the source language name in RFC3066<br/>
     *                       Example: <i>en-US</i> --> <b>en</b>
     * @param $target string The first two chars of the target language name in RFC3066<br/>
     *                       Example: <i>en-US</i> --> <b>en</b>
     * @return string
     */
    public static function getPayableRates( $source, $target ) {

        $ret = INIT::$DEFAULT_PAYABLE_RATES;

        //search source -> target pair
        if ( isset( self::$langPair2MTpayableRates[ $source ][ $target ] ) ) {
            $ret = self::$langPair2MTpayableRates[ $source ][ $target ];

        } elseif ( isset( self::$langPair2MTpayableRates[ $target ][ $source ] ) ) { //search target -> source pair
            $ret = self::$langPair2MTpayableRates[ $target ][ $source ];
        }

        return $ret;

    }

    // ----------------------------------------------------------------

    public static function placeholdamp($s) {
        $s = preg_replace("/\&/", AMPPLACEHOLDER, $s);
        return $s;
    }

    public static function restoreamp($s) {
        $pattern = "#" . AMPPLACEHOLDER . "#";
        $s = preg_replace($pattern, Utils::unicode2chr("&"), $s);
        return $s;
    }

    public static function parse_time_to_edit($ms) {
        if ($ms <= 0) {
            return array("00", "00", "00", "00");
        }

        $usec = $ms % 1000;
        $ms = floor($ms / 1000);

        $seconds = str_pad($ms % 60, 2, "0", STR_PAD_LEFT);
        $ms = floor($ms / 60);

        $minutes = str_pad($ms % 60, 2, "0", STR_PAD_LEFT);
        $ms = floor($ms / 60);

        $hours = str_pad($ms % 60, 2, "0", STR_PAD_LEFT);
        $ms = floor($ms / 60);

        return array($hours, $minutes, $seconds, $usec);
    }

    public static function dos2unix( $dosString ){
        $dosString = str_replace( "\r\n","\r", $dosString );
        $dosString = str_replace( "\n","\r", $dosString );
        $dosString = str_replace( "\r","\n", $dosString );
        return $dosString;
    }

    private static function placehold_xml_entities($segment) {
        $pattern ="|&#(.*?);|";
        $res=preg_replace($pattern,"<x id=\"XMLENT$1\"/>",$segment);
        return $res;
    }

    public static function restore_xml_entities($segment) {
        return preg_replace ("|<x id=\"XMLENT(.*?)\"/>|","&#$1",$segment);
    }

    public static function placehold_xliff_tags($segment) {

        //remove not existent </x> tags
        $segment = preg_replace('|(</x>)|si', "", $segment);

        //$segment=preg_replace('|<(g\s*.*?)>|si', LTPLACEHOLDER."$1".GTPLACEHOLDER,$segment);
        $segment = preg_replace('|<(g\s*id=["\']+.*?["\']+\s*[^<>]*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);

        $segment = preg_replace('|<(/g)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);

        $segment = preg_replace('|<(x .*?/?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('#<(bx[ ]{0,}/?|bx .*?/?)>#si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('#<(ex[ ]{0,}/?|ex .*?/?)>#si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(bpt\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/bpt)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(ept\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/ept)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(ph .*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/ph)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(it\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/ph)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(it\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/it)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(mrk\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/mrk)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);

        return self::__encode_tag_attributes( $segment );
    }

    private static function __encode_tag_attributes( $segment ){

        if( !function_exists( 'callback_encode' ) ){
            function callback_encode( $matches ) {
                return LTPLACEHOLDER . base64_encode( $matches[1] ) . GTPLACEHOLDER;
            }
        }

        return preg_replace_callback( '/' . LTPLACEHOLDER . '(.*?)' . GTPLACEHOLDER . '/u'
                , 'callback_encode'
                , $segment
        ); //base64 of the tag content to avoid unwanted manipulation

    }

    private static function __decode_tag_attributes( $segment ){

        if( !function_exists( 'callback_decode' ) ){
            function callback_decode( $matches ) {
                return LTPLACEHOLDER . base64_decode( $matches[1] ) . GTPLACEHOLDER;
            }
        }

        return preg_replace_callback( '/' . LTPLACEHOLDER . '(.*?)' . GTPLACEHOLDER . '/u'
                , 'callback_decode'
                , $segment
        ); //base64 decode of the tag content to avoid unwanted manipulation

    }

    private static function restore_xliff_tags($segment) {
        $segment = self::__decode_tag_attributes( $segment );
        $segment = str_replace(LTPLACEHOLDER, "<", $segment);
        $segment = str_replace(GTPLACEHOLDER, ">", $segment);
        return $segment;
    }

    private static function restore_xliff_tags_for_wiew($segment) {
        $segment = self::__decode_tag_attributes( $segment );
        $segment = str_replace(LTPLACEHOLDER, "&lt;", $segment);
        $segment = str_replace(GTPLACEHOLDER, "&gt;", $segment);
        return $segment;
    }



     private static function get_xliff_tags($segment) {

        //remove not existent </x> tags
        $segment = preg_replace('|(</x>)|si', "", $segment);

        $matches=array();
        $match=array();


        $res=preg_match('|(<g\s*id=["\']+.*?["\']+\s*[^<>]*?>)|si',$segment, $match);
        if ($res and isset($match[0])){
            $matches[]=$match[0];
        }

        $segment = preg_replace('|<(/g)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(x.*?/?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('#<(bx[ ]{0,}/?|bx .*?/?)>#si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('#<(ex[ ]{0,}/?|ex .*?/?)>#si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(bpt\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/bpt)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(ept\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/ept)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(ph\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/ph)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(it\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/ph)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(it\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/it)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(mrk\s*.*?)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        $segment = preg_replace('|<(/mrk)>|si', LTPLACEHOLDER . "$1" . GTPLACEHOLDER, $segment);
        return $segment;
    }

    public static function stripTags($text) {
        $pattern_g_o = '|(<.*?>)|';
        $pattern_g_c = '|(</.*?>)|';
        $pattern_x = '|(<.*?/>)|';

        $text = preg_replace($pattern_x, "", $text);

        $text = preg_replace($pattern_g_o, "", $text);
        $text = preg_replace($pattern_g_c, "", $text);
        return $text;
    }

    public static function view2rawxliff($segment) {

        //Replace br placeholders
        $segment = str_replace( '##$_0D0A$##',"\r\n", $segment );
        $segment = str_replace( '##$_0A$##',"\n", $segment );
        $segment = str_replace( '##$_0D$##',"\r", $segment );
        $segment = str_replace( '##$_09$##',"\t", $segment );

        // input : <g id="43">bang & olufsen < 3 </g> <x id="33"/>; --> valore della funzione .text() in cat.js su source, target, source suggestion,target suggestion
        // output : <g> bang &amp; olufsen are > 555 </g> <x/>
        // caso controverso <g id="4" x="&lt; dfsd &gt;">
        $segment = self::placehold_xliff_tags($segment);
        $segment = htmlspecialchars(
            html_entity_decode($segment, ENT_NOQUOTES, 'UTF-8'),
            ENT_NOQUOTES, 'UTF-8', false
        );

        //replace all incoming &nbsp; ( \xA0 ) with normal spaces ( \x20 ) as we accept only ##$_A0$##
        $segment = str_replace( Utils::unicode2chr(0Xa0) , " ", $segment );

        // now convert the real &nbsp;
        $segment = str_replace( '##$_A0$##', Utils::unicode2chr(0Xa0) , $segment );

        //encode all not valid XML entities
        $segment = preg_replace('/&(?!lt;|gt;|amp;|quot;|apos;|#[x]{0,1}[0-9A-F]{1,4};)/', '&amp;' , $segment );

        $segment = self::restore_xliff_tags($segment);
        return $segment;
    }

    public static function rawxliff2view($segment) {
        // input : <g id="43">bang &amp; &lt; 3 olufsen </g>; <x id="33"/>
        //$segment = self::placehold_xml_entities($segment);
        $segment = self::placehold_xliff_tags($segment);

        //replace all outgoing spaces couples to a space and a &nbsp; so they can be displayed to the browser
        $segment = preg_replace('/\s{2}/', " &nbsp;", $segment);

        $segment = html_entity_decode($segment, ENT_NOQUOTES | 16 /* ENT_XML1 */, 'UTF-8');
        // restore < e >
        $segment = str_replace("<", "&lt;", $segment);
        $segment = str_replace(">", "&gt;", $segment);
        $segment = preg_replace('|<(.*?)>|si', "&lt;$1&gt;", $segment);

        $segment = self::restore_xliff_tags_for_wiew($segment);

        $segment = str_replace("\r\n", '##$_0D0A$##', $segment );
        $segment = str_replace("\n", '##$_0A$##', $segment );
        $segment = str_replace("\r", '##$_0D$##', $segment ); //x0D character
        $segment = str_replace("\t", '##$_09$##', $segment ); //x09 character
        $segment = preg_replace( '/\x{a0}/u', '##$_A0$##', $segment ); //xA0 character ( NBSP )
        return $segment;
    }

    /**
     * No more used
     * @deprecated
     *
     * @param $segment
     *
     * @return mixed
     */
    public static function rawxliff2rawview($segment) {
        // input : <g id="43">bang &amp; &lt; 3 olufsen </g>; <x id="33"/>
        $segment = self::placehold_xliff_tags($segment);
        $segment = html_entity_decode($segment, ENT_NOQUOTES, 'UTF-8');
        $segment = self::restore_xliff_tags_for_wiew($segment);
        return $segment;
    }

    public static function getEditingLogData($jid, $password, $use_ter_diff = false ) {

        $data = getEditLog($jid, $password);

        $slow_cut = 30;
        $fast_cut = 0.25;

        $stat_too_slow = array();
        $stat_too_fast = array();


        if (!$data) {
            return false;
        }

        $stats['total-word-count'] = 0;
        $stat_mt = array();


        foreach ($data as &$seg) {

            $seg['sm'].="%";
            $seg['jid'] = $jid;
            $tte = self::parse_time_to_edit($seg['tte']);
            $seg['time_to_edit'] = "$tte[1]m:$tte[2]s";

            $stat_rwc[] = $seg['rwc'];

            // by definition we cannot have a 0 word sentence. It is probably a - or a tag, so we want to consider at least a word.
            if ($seg['rwc'] < 1) {
                $seg['rwc'] = 1;
            }

            $seg['secs-per-word'] = round($seg['tte'] / 1000 / $seg['rwc'], 1);

            if (($seg['secs-per-word'] < $slow_cut) AND ($seg['secs-per-word'] > $fast_cut)) {
                $seg['stats-valid'] = 'Yes';
                $seg['stats-valid-color'] = '';
                $seg['stats-valid-style'] = '';

                $stat_valid_rwc[] = $seg['rwc'];
                $stat_valid_tte[] = $seg['tte'];
                $stat_spw[] = $seg['secs-per-word'];
            } else {
                $seg['stats-valid'] = 'No';
                $seg['stats-valid-color'] = '#ee6633';
                $seg['stats-valid-style'] = 'border:2px solid #EE6633';
            }


            // Stats
            if ($seg['secs-per-word'] >= $slow_cut) {
                $stat_too_slow[] = $seg['rwc'];
            }
            if ($seg['secs-per-word'] <= $fast_cut) {
                $stat_too_fast[] = $seg['rwc'];
            }


            $seg['pe_effort_perc'] = round((1 - MyMemory::TMS_MATCH($seg['sug'], $seg['translation'])) * 100);


            if ($seg['pe_effort_perc'] < 0) {
                $seg['pe_effort_perc'] = 0;
            }
            if ($seg['pe_effort_perc'] > 100) {
                $seg['pe_effort_perc'] = 100;
            }

            $stat_pee[] = $seg['pe_effort_perc'] * $seg['rwc'];

            $seg['pe_effort_perc'] .= "%";

            $lh = Languages::getInstance();
            $lang = $lh->getIsoCode( $lh->getLocalizedName( $seg['target_lang'] ) );

            $sug_for_diff = self::placehold_xliff_tags( $seg[ 'sug' ] );
            $tra_for_diff = self::placehold_xliff_tags( $seg[ 'translation' ] );

//            possible patch
//            $sug_for_diff = html_entity_decode($sug_for_diff, ENT_NOQUOTES, 'UTF-8');
//            $tra_for_diff = html_entity_decode($tra_for_diff, ENT_NOQUOTES, 'UTF-8');

            //with this patch we have warnings when accessing indexes
            if( $use_ter_diff  ){
                $ter = MyMemory::diff_tercpp( $sug_for_diff, $tra_for_diff, $lang );
            } else {
                $ter = array();
            }

//            Log::doLog( $sug_for_diff );
//            Log::doLog( $tra_for_diff );
//            Log::doLog( $ter );

            $seg[ 'ter' ] = @$ter[ 1 ] * 100;
            $stat_ter[ ]  = $seg[ 'ter' ] * $seg[ 'rwc' ];
            $seg[ 'ter' ] = round( @$ter[ 1 ] * 100 ) . "%";
            $diff_ter     = @$ter[ 0 ];

            if ( $seg[ 'sug' ] <> $seg[ 'translation' ] ) {

                //force use of third party ter diff
                if( $use_ter_diff ){
                    $seg[ 'diff' ] = $diff_ter;
                } else {
                    $diff_PE = MyMemory::diff_html( $sug_for_diff, $tra_for_diff );
                    // we will use diff_PE until ter_diff will not work properly
                    $seg[ 'diff' ]     = $diff_PE;
                }

                //$seg[ 'diff_ter' ] = $diff_ter;

            } else {
                $seg[ 'diff' ]     = '';
                //$seg[ 'diff_ter' ] = '';
            }

            $seg['diff']     = self::restore_xliff_tags_for_wiew($seg['diff']);
            //$seg['diff_ter'] = self::restore_xliff_tags_for_wiew($seg['diff_ter']);

            // BUG: While suggestions source is not correctly set
            if (($seg['sm'] == "85%") OR ($seg['sm'] == "86%")) {
                $seg['ss'] = 'Machine Translation';
                $stat_mt[] = $seg['rwc'];
            } else {
                $seg['ss'] = 'Translation Memory';
            }

            $seg['sug_view'] = trim( CatUtils::rawxliff2view($seg['sug']) );
            $seg['source'] = trim( CatUtils::rawxliff2view( $seg['source'] ) );
            $seg['translation'] = trim( CatUtils::rawxliff2view( $seg['translation'] ) );

            $array_patterns     = array(
                    rtrim( self::lfPlaceholderRegex, 'g' ) ,
                    rtrim( self::crPlaceholderRegex, 'g' ),
                    rtrim( self::crlfPlaceholderRegex, 'g' ),
                    rtrim( self::tabPlaceholderRegex, 'g' ),
                    rtrim( self::nbspPlaceholderRegex, 'g' ),
            );


            $array_replacements_csv = array(
                    '\n',
                    '\r',
                    '\r\n',
                    '\t',
                    Utils::unicode2chr(0Xa0),
            );
            $seg['source_csv'] = preg_replace( $array_patterns, $array_replacements_csv, $seg['source'] );
            $seg['translation_csv'] = preg_replace( $array_patterns, $array_replacements_csv, $seg['translation'] );
            $seg['sug_csv'] =  preg_replace( $array_patterns, $array_replacements_csv, $seg['sug_view'] );
            $seg['diff_csv'] = preg_replace( $array_patterns, $array_replacements_csv, $seg['diff'] );


            $array_replacements = array(
                    '<span class="_0A"></span><br />',
                    '<span class="_0D"></span><br />',
                    '<span class="_0D0A"></span><br />',
                    '<span class="_tab">&#9;</span>',
                    '<span class="_nbsp">&nbsp;</span>',
            );
            $seg['source'] = preg_replace( $array_patterns, $array_replacements, $seg['source'] );
            $seg['translation'] = preg_replace( $array_patterns, $array_replacements, $seg['translation'] );
            $seg['sug_view'] =  preg_replace( $array_patterns, $array_replacements, $seg['sug_view'] );
            $seg['diff'] = preg_replace( $array_patterns, $array_replacements, $seg['diff'] );

            if( $seg['mt_qe'] == 0 ){
                $seg['mt_qe'] = 'N/A';
            }

        }

        $stats['edited-word-count'] = array_sum($stat_rwc);
        $stats['valid-word-count'] = array_sum($stat_valid_rwc);

        if ($stats['edited-word-count'] > 0) {
            $stats['too-slow-words'] = round(array_sum($stat_too_slow) / $stats['edited-word-count'], 2) * 100;
            $stats['too-fast-words'] = round(array_sum($stat_too_fast) / $stats['edited-word-count'], 2) * 100;
            $stats['avg-pee'] = round(array_sum($stat_pee) / array_sum($stat_rwc)) . "%";
            $stats['avg-ter'] = round(array_sum($stat_ter) / array_sum($stat_rwc)) . "%";
        }
//        echo array_sum($stat_ter);
//        echo "@@@";
//        echo array_sum($stat_rwc);
//        exit;

        $stats['mt-words'] = round(array_sum($stat_mt) / $stats['edited-word-count'], 2) * 100;
        $stats['tm-words'] = 100 - $stats['mt-words'];
        $stats['total-valid-tte'] = round(array_sum($stat_valid_tte) / 1000);

        // Non weighted...
        // $stats['avg-secs-per-word'] = round(array_sum($stat_spw)/count($stat_spw),1);
        // Weighted
        $stats['avg-secs-per-word'] = round($stats['total-valid-tte'] / $stats['valid-word-count'], 1);
        $stats['est-words-per-day'] = number_format(round(3600 * 8 / $stats['avg-secs-per-word']), 0, '.', ',');

        // Last minute formatting (after calculations)
        $temp = self::parse_time_to_edit(round(array_sum($stat_valid_tte)));
        $stats['total-valid-tte'] = "$temp[0]h:$temp[1]m:$temp[2]s";

        return array($data, $stats);
    }

    public static function addSegmentTranslation( array $_Translation ) {

        $updateRes = addTranslation( $_Translation );

        if ($updateRes < 0) {
            $result['error'][] = array("code" => -5, "message" => "error occurred during the storing (UPDATE) of the translation for the segment {$_Translation['id_segment']} - Error: $updateRes");
            return $result;
        }

        return 0;

    }

    public static function addTranslationSuggestion($id_segment, $id_job, $suggestions_json_array = "", $suggestion = "", $suggestion_match = "", $suggestion_source = "", $match_type = "", $eq_words = 0, $standard_words = 0, $translation = "", $tm_status_analysis = "UNDONE", $warning = 0, $err_json = '', $mt_qe = 0 ) {
        if (!empty($suggestion_source)) {
            if (strpos($suggestion_source, "MT") === false) {
                $suggestion_source = 'TM';
            } else {
                $suggestion_source = 'MT';
            }
        }

        /**
         * For future refactory, with this SQL construct we halve the number of insert/update queries
         *
         * mysql support this:
         *
         *  INSERT INTO example (id,suggestions_array) VALUES (1,'["key":"we don\'t want this update because of tm_analysis_status is not DONE"]')
         *      ON DUPLICATE KEY UPDATE
         *          suggestions_array = IF( tm_analysis_status = 'DONE' , VALUES(suggestions_array) , suggestions_array );
         *
         */
        $insertRes = setSuggestionInsert($id_segment, $id_job, $suggestions_json_array, $suggestion, $suggestion_match, $suggestion_source, $match_type, $eq_words, $standard_words, $translation, $tm_status_analysis, $warning, $err_json, $mt_qe);
        if ($insertRes < 0 and $insertRes != -1062) {
            $result['error'][] = array("code" => -4, "message" => "error occurred during the storing (INSERT) of the suggestions for the segment $id_segment - $insertRes");
            return $result;
        }
        if ($insertRes == -1062) {
            // the translaion for this segment still exists : update it
            $updateRes = setSuggestionUpdate($id_segment, $id_job, $suggestions_json_array, $suggestion, $suggestion_match, $suggestion_source, $match_type, $eq_words, $standard_words, $translation, $tm_status_analysis, $warning, $err_json, $mt_qe);
            if ($updateRes < 0) {
                $result['error'][] = array("code" => -5, "message" => "error occurred during the storing (UPDATE) of the suggestions for the segment $id_segment");
                return $result;
            }
        }
        return 0;
    }

    /**
     * Make an estimation on performance
     *
     * @param mixed $job_stats
     * @return mixed
     */
    protected static function _performanceEstimationTime( array $job_stats ){

        $estimation_temp = getLastSegmentIDs($job_stats['id']);

        $estimation_concat = array();
        foreach( $estimation_temp as $sid ){
            $estimation_concat[] = $sid['id_segment'];
        }
        $estimation_seg_ids = implode( ",",$estimation_concat );

        if ($estimation_seg_ids) {
            //perform check on performance if single segment are set to check or globally Forced
            // Calculating words per hour and estimated completion
            $estimation_temp = getEQWLastHour($job_stats['id'], $estimation_seg_ids);
            if ($estimation_temp[0]['data_validity'] == 1) {
                $job_stats['WORDS_PER_HOUR'] = number_format($estimation_temp[0]['words_per_hour'], 0, '.', ',');
                // 7.2 hours
                // $job_stats['ESTIMATED_COMPLETION'] = number_format( ($job_stats['DRAFT']+$job_stats['REJECTED'])/$estimation_temp[0]['words_per_hour'],1);
                // 1 h 32 m
                // $job_stats['ESTIMATED_COMPLETION'] = date("G",($job_stats['DRAFT']+$job_stats['REJECTED'])/$estimation_temp[0]['words_per_hour']*3600) . "h " . date("i",($job_stats['DRAFT']+$job_stats['REJECTED'])/$estimation_temp[0]['words_per_hour']*3600) . "m";
                $job_stats['ESTIMATED_COMPLETION'] = date("G\h i\m", ($job_stats['DRAFT'] + $job_stats['REJECTED']) / ( !empty( $estimation_temp[0]['words_per_hour'] ) ? $estimation_temp[0]['words_per_hour'] : 1 )* 3600 - 3600);
            }
        }

        return $job_stats;

    }

    /**
     * Perform analysis on single Job
     *
     * <pre>
     *      $job_stats = array(
     *          'id'                           => (int),
     *          'TOTAL'                        => (int),
     *          'TRANSLATED'                   => (int),
     *          'APPROVED'                     => (int),
     *          'REJECTED'                     => (int),
     *          'DRAFT'                        => (int),
     *          'ESTIMATED_COMPLETION'         => (int),
     *          'WORDS_PER_HOUR'               => (int),
     *      );
     * </pre>
     *
     * @param mixed $job_stats
     * @return mixed $job_stats
     */
    protected static function _getStatsForJob( $job_stats ) {

        $job_stats[ 'PROGRESS' ]             = ( $job_stats[ 'TRANSLATED' ] + $job_stats[ 'APPROVED' ] );
        $job_stats[ 'TOTAL_FORMATTED' ]      = number_format( $job_stats[ 'TOTAL' ], 0, ".", "," );
        $job_stats[ 'PROGRESS_FORMATTED' ]   = number_format( $job_stats[ 'TRANSLATED' ] + $job_stats[ 'APPROVED' ], 0, ".", "," );
        $job_stats[ 'APPROVED_FORMATTED' ]   = number_format( $job_stats[ 'APPROVED' ], 0, ".", "," );
        $job_stats[ 'REJECTED_FORMATTED' ]   = number_format( $job_stats[ 'REJECTED' ], 0, ".", "," );
        $job_stats[ 'DRAFT_FORMATTED' ]      = number_format( $job_stats[ 'DRAFT' ], 0, ".", "," );
        $job_stats[ 'TRANSLATED_FORMATTED' ] = number_format( $job_stats[ 'TRANSLATED' ], 0, ".", "," );

        $job_stats[ 'APPROVED_PERC' ]   = ( $job_stats[ 'APPROVED' ] ) / $job_stats[ 'TOTAL' ] * 100;
        $job_stats[ 'REJECTED_PERC' ]   = ( $job_stats[ 'REJECTED' ] ) / $job_stats[ 'TOTAL' ] * 100;
        $job_stats[ 'DRAFT_PERC' ]      = ( $job_stats[ 'DRAFT' ] / $job_stats[ 'TOTAL' ] * 100 );
        $job_stats[ 'TRANSLATED_PERC' ] = ( $job_stats[ 'TRANSLATED' ] / $job_stats[ 'TOTAL' ] * 100 );
        $job_stats[ 'PROGRESS_PERC' ]   = ( $job_stats[ 'PROGRESS' ] / $job_stats[ 'TOTAL' ] ) * 100;

        if($job_stats[ 'TRANSLATED_PERC' ] > 100) {
            $job_stats[ 'TRANSLATED_PERC' ] = 100;
        }

        if($job_stats[ 'PROGRESS_PERC' ] > 100) {
            $job_stats[ 'PROGRESS_PERC' ] = 100;
        }

        if($job_stats[ 'DRAFT_PERC' ] < 0) {
            $job_stats[ 'DRAFT_PERC' ] = 0;
        }

        $temp = array(
                $job_stats[ 'TRANSLATED_PERC' ],
                $job_stats[ 'DRAFT_PERC' ],
                $job_stats[ 'REJECTED_PERC' ],
                $job_stats[ 'PROGRESS_PERC' ],
        );
        $max = max( $temp );
        $min = min( $temp );
        if( $max < 99 || $min > 1 ) $significantDigits = 0;
        else $significantDigits = 2;

        $job_stats[ 'TRANSLATED_PERC_FORMATTED' ] = round( $job_stats[ 'TRANSLATED_PERC' ], $significantDigits );
        $job_stats[ 'DRAFT_PERC_FORMATTED' ]      = round( $job_stats[ 'DRAFT_PERC' ], $significantDigits );
        $job_stats[ 'APPROVED_PERC_FORMATTED' ]   = round( $job_stats[ 'APPROVED_PERC' ], $significantDigits );
        $job_stats[ 'REJECTED_PERC_FORMATTED' ]   = round( $job_stats[ 'REJECTED_PERC' ], $significantDigits );
        $job_stats[ 'PROGRESS_PERC_FORMATTED' ]   = round( $job_stats[ 'PROGRESS_PERC' ], $significantDigits );

        $todo = $job_stats[ 'DRAFT' ] + $job_stats[ 'REJECTED' ];
        if( $todo < 1 && $todo > 0 ){
            $job_stats[ 'TODO_FORMATTED' ] = 1;
        } else {
            $job_stats[ 'TODO_FORMATTED' ] = number_format( $job_stats[ 'DRAFT' ] + $job_stats[ 'REJECTED' ], 0, ".", "," );
        }

        $t = 'approved';
        if ($job_stats['TRANSLATED_FORMATTED'] > 0)
            $t = "translated";
        if ($job_stats['DRAFT_FORMATTED'] > 0)
            $t = "draft";
        if ($job_stats['REJECTED_FORMATTED'] > 0)
            $t = "draft";
        if( $job_stats['TRANSLATED_FORMATTED'] == 0 &&
                $job_stats['DRAFT_FORMATTED'] == 0 &&
                $job_stats['REJECTED_FORMATTED'] == 0 &&
                $job_stats['APPROVED_FORMATTED'] == 0 ){
            $t = 'draft';
        }
        $job_stats['DOWNLOAD_STATUS'] = $t;

        return $job_stats;

    }

    /**
     * Public interface to single Job Stats Info
     *
     *
     * @param int $jid
     * @param int $fid
     * @param string $jPassword
     * @return mixed $job_stats
     *
     * <pre>
     *      $job_stats = array(
     *          'id'                           => (int),
     *          'TOTAL'                        => (int),
     *          'TRANSLATED'                   => (int),
     *          'APPROVED'                     => (int),
     *          'REJECTED'                     => (int),
     *          'DRAFT'                        => (int),
     *          'ESTIMATED_COMPLETION'         => (int),
     *          'WORDS_PER_HOUR'               => (int),
     *      );
     * </pre>
     *
     */
    public static function getStatsForJob( $jid, $fid = null, $jPassword = null ) {

        $job_stats = getStatsForJob($jid, $fid, $jPassword);
        $job_stats = $job_stats[0];

        $job_stats = self::_getStatsForJob($job_stats, true); //true set estimation check if present
        return self::_performanceEstimationTime($job_stats);

    }

    public static function getFastStatsForJob( WordCount_Struct $wCount ){

        $job_stats = array();
        $job_stats[ 'id' ]         = $wCount->getIdJob();
//        $job_stats[ 'NEW' ]        = $wCount->getNewWords();
        $job_stats[ 'DRAFT' ]      = $wCount->getNewWords() + $wCount->getDraftWords();
        $job_stats[ 'TRANSLATED' ] = $wCount->getTranslatedWords();
        $job_stats[ 'APPROVED' ]   = $wCount->getApprovedWords();
        $job_stats[ 'REJECTED' ]   = $wCount->getRejectedWords();

        //sometimes new_words + draft_words < 0 (why?). If it happens, set draft words to 0
        if($job_stats[ 'DRAFT' ] < 0 ) {
            $job_stats[ 'DRAFT' ] = 0;
        }

        //avoid division by zero warning
        $total = $wCount->getTotal();
        $job_stats[ 'TOTAL' ]      = ( $total == 0 ? 1 : $total );
        $job_stats = self::_getStatsForJob($job_stats, true); //true set estimation check if present
        return self::_performanceEstimationTime($job_stats);

    }

    public static function getStatsForFile($fid) {


        $file_stats = getStatsForFile($fid);

        $file_stats = $file_stats[0];
        $file_stats['ID_FILE'] = $fid;
        $file_stats['TOTAL_FORMATTED'] = number_format($file_stats['TOTAL'], 0, ".", ",");
        $file_stats['REJECTED_FORMATTED'] = number_format($file_stats['REJECTED'], 0, ".", ",");
        $file_stats['DRAFT_FORMATTED'] = number_format($file_stats['DRAFT'], 0, ".", ",");


        return $file_stats;
    }

    public static function clean_raw_string4fast_word_count( $string, $source_lang = 'en-US' ){

        $app = trim( $string );
        if ( $app == "" ) {
            return '';
        }

		if(strpos($source_lang,'-')!==FALSE){
			$tmp_lang=explode('-',$source_lang);
			$source_lang=$tmp_lang[0];
			unset($tmp_lang);
		}

        $string = preg_replace( "#<.*?" . ">#si", "", $string );
        $string = preg_replace( "#<\/.*?" . ">#si", "", $string );

        $string = str_replace( ":", "", $string );
        $string = str_replace( ";", "", $string );
        $string = str_replace( "[", "", $string );
        $string = str_replace( "]", "", $string );
        $string = str_replace( "?", "", $string );
        $string = str_replace( "!", "", $string );
        $string = str_replace( "{", "", $string );
        $string = str_replace( "}", "", $string );
        $string = str_replace( "(", "", $string );
        $string = str_replace( ")", "", $string );
        $string = str_replace( "/", "", $string );
        $string = str_replace( "\\", "", $string );
        $string = str_replace( "|", "", $string );
        $string = str_replace( "£", "", $string );
        $string = str_replace( "$", "", $string );
        $string = str_replace( "%", "", $string );
        $string = str_replace( "-", "", $string );
        $string = str_replace( "_", "", $string );
        $string = str_replace( "#", "", $string );
        $string = str_replace( "§", "", $string );
        $string = str_replace( "^", "", $string );
        $string = str_replace( "â€???", "", $string );
        $string = str_replace( "&", "", $string );


        if ( array_key_exists( $source_lang, self::$cjk ) ) {

            // 17/01/2014
            // sostituiamo i numeri con N nel CJK in modo da non alterare i rapporti carattere/parola
            // in modo che il conteggio
            // parole consideri i segmenti che differiscono per soli numeri some ripetizioni (come TRADOS)
            $string = preg_replace( "/[0-9]+([\.,][0-9]+)*/", "N", $string );

        } else {

            // 08/02/2011 CONCORDATO CON MARCO : sostituire tutti i numeri con un segnaposto, in modo che il conteggio
            // parole consideri i segmenti che differiscono per soli numeri some ripetizioni (come TRADOS)
            $string = preg_replace( "/[0-9]+([\.,][0-9]+)*/", "TRANSLATED_NUMBER", $string );

        }

        return $string;

    }

    //CONTA LE PAROLE IN UNA STRINGA
    public static function segment_raw_wordcount( $string, $source_lang = 'en-US' ) {

		if(strpos($source_lang,'-')!==FALSE){
			$tmp_lang=explode('-',$source_lang);
			$source_lang=$tmp_lang[0];
			unset($tmp_lang);
		}


        $string = self::clean_raw_string4fast_word_count( $string, $source_lang );

        if ( $string == "" ) {
            return 0;
        }

        if ( array_key_exists( $source_lang, self::$cjk ) ) {

            $res = mb_strlen( $string, 'UTF-8' ) / self::$cjk[ $source_lang ];

        } else {

            $string = str_replace( " ", "<sep>", $string );
            $string = str_replace( ", ", "<sep>", $string );
            $string = str_replace( ". ", "<sep>", $string );
            $string = str_replace( "' ", "<sep>", $string );
            $string = str_replace( ".", "<sep>", $string );
            $string = str_replace( "\"", "<sep>", $string );
            $string = str_replace( '\'', "<sep>", $string );

            $app = explode( "<sep>", $string );
            foreach ( $app as $a ) {
                $a = trim( $a );
                if ( $a != "" ) {
                    //voglio contare anche i numeri:
                    //if(!is_number($a)) {
                    $temp[ ] = $a;
                    //}
                }
            }

            $res = @count( $temp );
        }

        return $res;

    }

    /**
     * Generate 128bit password with real uniqueness over single process instance
     *   N.B. Concurrent requests can collide ( Ex: fork )
     *
     * Minimum Password Length 12 Characters
     *
     */
    public static function generate_password( $length = 12 ) {

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

    /**
     *
     * This function works only on unix machines. For BSD based change parameter of command file to Uppercase I
     * <pre>
     *      shell_exec( "file -I $tmpOrigFName" );
     * </pre>
     *
     * @param $toEncoding
     * @param $documentContent string Reference to the string document
     *
     * @return string
     * @throws Exception
     */
    public static function convertEncoding( $toEncoding, &$documentContent ) {

        //Example: The file is UTF-16 Encoded

        $tmpOrigFName = tempnam( "/tmp", mt_rand( 0, 1000000000 ) . uniqid( "", true ) );
        file_put_contents( $tmpOrigFName, $documentContent );

        $cmd = "file -i $tmpOrigFName";
        Log::doLog( $cmd );

        $file_info = shell_exec( $cmd );
        list( $file_info, $charset ) = explode( "=", $file_info );
        $charset = trim( $charset );

        if ( $charset == 'utf-16le' ) {
            $charset = 'Unicode';
        }

        //do nothing if "from" and "to" parameters are the equals
        if ( strtolower( $charset ) == strtolower( $toEncoding ) ) {
            return array( $charset, $documentContent );
        }

        $converted = iconv( $charset, $toEncoding . "//IGNORE", $documentContent );

        return array( $charset, $converted );

    }

    public static function getTMProps( $job_data ){

        try {
            $memcacheHandler = MemcacheHandler::getInstance();
        } catch ( Exception $e ) {
            Log::doLog( $e->getMessage() );
            Log::doLog( "No Memcache server(s) configured." );
        }

        if ( isset( $memcacheHandler ) && !empty( $memcacheHandler ) ) {
            $_existingResult = $memcacheHandler->get( "project_data_for_job_id:" . $job_data['id'] );
            if ( !empty( $_existingResult ) ) {
                return $_existingResult;
            }
        }

        $projectData = getProjectJobData( $job_data['id_project'] );

        $result = array(
                'project_id'   => $projectData[ 0 ][ 'pid' ],
                'project_name' => $projectData[ 0 ][ 'pname' ],
                'job_id'       => $job_data[ 'id' ],
        );

        if ( isset( $memcacheHandler ) && !empty( $memcacheHandler ) ) {
            $memcacheHandler->set(
                    "project_data_for_job_id:" . $job_data['id'],
                    $result,
                    60 * 60 * 24 * 15 /* 15 days of lifetime */
            );
        }

        return $result;

    }

}

