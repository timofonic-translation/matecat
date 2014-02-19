<?php
set_time_limit(0);
include "main.php";
include INIT::$UTILS_ROOT . "/engines/mt.class.php";
include INIT::$UTILS_ROOT . "/engines/tms.class.php";
include INIT::$UTILS_ROOT . "/QA.php";

define("PID_FOLDER", ".pidlist");
define("NUM_PROCESSES", 1);
define("NUM_PROCESSES_FILE", ".num_processes");

// PROCESS CONTROL FUNCTIONS
function isRunningProcess($pid) {
    if (file_exists("/proc/$pid")) {
        return true;
    }
    return false;
}

function processFileExists($pid) {
    $folder = PID_FOLDER;
    echo __FUNCTION__ . " : $folder/$pid ....";
    if (file_exists("$folder/$pid")) {
        echo "true\n\n";
        return true;
    }
    echo "false\n\n";
    return false;
}

$UNIQUID = uniqid('', true);

$my_pid = getmypid();
$parent_pid = posix_getppid();
echo "--- (child $my_pid) : parent pid is $parent_pid\n";

while (1) {
    if (!processFileExists($my_pid)) {
        die("(child $my_pid) :  EXITING!  my file does not exists anymore\n");
    }
    
    // control if parent is still running
    if (!isRunningProcess($parent_pid)) {
        echo "--- (child $my_pid) : EXITING : parent seems to be died.\n";
        exit (-1);
    }

    $res = getNextSegmentAndLock();

    if (empty($res)) {
        echo "--- (child $my_pid) : _-_getNextSegmentAndLock_-_ no segment ready for tm volume analisys: wait 5 seconds\n";
        sleep(5);
        continue;
    }
    $sid = $res['id_segment'];
    $jid = $res['id_job'];
    echo "--- (child $my_pid) : segment $sid-$jid found \n";
    $segment = getSegmentForTMVolumeAnalysys($sid, $jid);
    
    echo "segment found is: ";
    print_r($segment);
    echo "\n";

    if (empty($segment)) {
        deleteLockSegment($sid, $jid,"unlock");
        echo "--- (child $my_pid) : empty segment: no segment ready for tm volume analisys: wait 5 seconds\n";
        sleep(5);
        continue;
    }

    if (is_numeric($segment) and $segment < 0) {
        deleteLockSegment($sid, $jid);
        setSegmentTranslationError($sid, $jid); // devo settarli come done e lasciare il vecchio livello di match
        echo "--- (child $my_pid) : FATAL !!  error occurred during fetching segment : exiting\n";
        continue;
    }


    $pid = $segment['pid'];

    echo "--- (child $my_pid) : fetched data for segment $sid-$jid. PID is $pid\n";

    //lock segment
    echo "--- (child $my_pid) :  segment $sid-$jid locked\n";

    $source          = $segment[ 'source' ];
    $target          = $segment[ 'target' ];
    $id_translator   = $segment[ 'id_translator' ];
    $raw_wc          = $segment[ 'raw_word_count' ];
    $fast_match_type = $segment[ 'match_type' ];

    $text            = $segment[ 'segment' ];

    if ($raw_wc == 0) {
        echo "--- (child $my_pid) : empty segment. deleting lock and continue\n";
        deleteLockSegment($sid, $jid);
        continue;
    }

    $config = TMS::getConfigStruct();
    $config[ 'segment' ]       = $text;
    $config[ 'source_lang' ]   = $source;
    $config[ 'target_lang' ]   = $target;
    $config[ 'email' ]         = "demo@matecat.com";
    $config[ 'id_user' ]       = $id_translator;
    $config[ 'num_result' ]    = 3;

    $id_mt_engine    = $segment[ 'id_mt_engine' ];
    $id_tms          = $segment[ 'id_tms' ];

    $_TMS = $id_tms; //request

    /**
     * Call Memory Server for matches if it's enabled
     */
    $tms_enabled = false;
    if( $id_tms == 1 ){
        /**
         * MyMemory Enabled
         */
        $config[ 'get_mt' ]  = true;
        $config[ 'mt_only' ] = false;
        if( $id_mt_engine != 1 ){
            /**
             * Don't get MT contribution from MyMemory ( Custom MT )
             */
            $config[ 'get_mt' ] = false;
        }

        $_TMS = $id_tms;

        $tms_enabled = true;

    } else if ( $id_tms == 0 && $id_mt_engine == 1 ) {
        /**
         * MyMemory disabled but MT Enabled and it is NOT a Custom one
         * So tell to MyMemory to get MT only
         */
        $config[ 'get_mt' ]  = true;
        $config[ 'mt_only' ] = true;

        $_TMS = 1; /* MyMemory */

        $tms_enabled = true;

    }

    /*
     * This will be ever executed without damages because
     * fastAnalysis set Project as DONE when
     * MyMemory is disabled and MT is Disabled Too
     *
     * So don't worry, perform TMS Analysis
     *
     */
    if( $tms_enabled ){
        $tms = new TMS( $_TMS );
        $tms_match = $tms->get( $config );
        $tms_match = $tms_match->get_matches_as_array();
    }

    /**
     * Call External MT engine if it is a custom one ( mt not requested from MyMemory )
     */
    $mt_res = array();
    $mt_match = "";
    if ( $id_mt_engine > 1 /* Request MT Directly */ ) {
        $mt = new MT($id_mt_engine);
        $mt_result = $mt->get($text, $source, $target);

        if ( $mt_result->error->code < 0) {
            $mt_match = '';
        } else {
            $mt_match = $mt_result->translatedText;
            $penalty = $mt->getPenalty();
            $mt_score = 100 - $penalty;
            $mt_score.="%";

            $mt_match_res = new TMS_GET_MATCHES($text, $mt_match, $mt_score, "MT-" . $mt->getName(), date("Y-m-d"));

            $mt_res = $mt_match_res->get_as_array();
            $mt_res['sentence_confidence'] = $mt_result->sentence_confidence; //can be null

        }
    }

    $matches = array();

    if (!empty($tms_match)) {
        $matches = $tms_match;
    }

    if (!empty($mt_match)) {
        $matches[] = $mt_res;
        usort($matches, "compareScore");
    }

    /**
     * Only if No results found
     */
    if ( !$matches || !is_array($matches) ) {
        echo "--- (child $my_pid) : error from mymemory : set error and continue\n"; // ERROR FROM MYMEMORY
        setSegmentTranslationError($sid, $jid); // devo settarli come done e lasciare il vecchio livello di match
        deleteLockSegment($sid, $jid);
        tryToCloseProject($pid);
        continue;
    }

    $tm_match_type = $matches[0]['match'];
    if ( stripos($matches[0]['created_by'], "MT") !== false) {
        $tm_match_type = "MT";
    }

    /* New Feature */
    ( isset($matches[ 0 ]['match']) ? $firstMatchVal = floatval( $matches[ 0 ]['match'] ) : null );
    if( isset( $firstMatchVal ) && $firstMatchVal >= 90 && $firstMatchVal < 100 ){

        $srcSearch    = strip_tags( $text );
        $segmentFound = strip_tags( $matches[ 0 ][ 'raw_segment' ] );
        $srcSearch    = mb_strtolower( preg_replace( '#[\x{20}]{2,}#u', chr( 0x20 ), $srcSearch ) );
        $segmentFound = mb_strtolower( preg_replace( '#[\x{20}]{2,}#u', chr( 0x20 ), $segmentFound ) );

        $fuzzy = levenshtein( $srcSearch, $segmentFound ) / log10( mb_strlen( $srcSearch . $segmentFound ) + 1 );

        //levenshtein handle max 255 chars per string and returns -1, so fuzzy var can be less than 0 !!
        if ( $srcSearch == $segmentFound || ( $fuzzy < 2.5 && $fuzzy > 0 ) ) {

            $qaRealign = new QA( $text, html_entity_decode( $matches[ 0 ][ 'raw_translation' ] ) );
            $qaRealign->tryRealignTagID();

            $log_prepend = $UNIQUID . " - SERVER REALIGN IDS PROCEDURE | ";
            if ( !$qaRealign->thereAreErrors() ) {

                Log::doLog( $log_prepend . " - Requested Segment: " . var_export( $segment, true ) );
                Log::doLog( $log_prepend . "Fuzzy: " . $fuzzy . " - Try to Execute Tag ID Realignment." );
                Log::doLog( $log_prepend . "TMS RAW RESULT:" );
                Log::doLog( $log_prepend . var_export( $matches[ 0 ], true ) );

                Log::doLog( $log_prepend . "Realignment Success:" );
                $matches[0]['raw_translation'] = $qaRealign->getTrgNormalized();
                $matches[0]['match'] = ( $fuzzy == 0 ? '100%' : '99%' );
                Log::doLog( $log_prepend . "Raw Translation: " . var_export( $matches[ 0 ]['raw_translation'], true ) );

            } else {
                Log::doLog( $log_prepend . 'Realignment Failed. Skip. Segment: ' . $segment['sid'] );
            }

        }

    }

    $suggestion = CatUtils::view2rawxliff($matches[0]['raw_translation']);

    //preg_replace all x tags <x not closed > inside suggestions with correctly closed
    $suggestion = preg_replace( '|<x([^/]*?)>|', '<x\1/>', $suggestion );

    $suggestion_match = $matches[0]['match'];
    $suggestion_json = json_encode($matches);
    $suggestion_source = $matches[0]['created_by'];

    $new_match_type = getNewMatchType($tm_match_type, $fast_match_type, $equivalentWordMapping);
    //echo "sid is $sid ";
    $eq_words = $equivalentWordMapping[$new_match_type] * $raw_wc / 100;
    $standard_words = $eq_words;

    if ($new_match_type == 'MT') {
        $standard_words = $equivalentWordMapping["NO_MATCH"] * $raw_wc / 100;
    }

    ( !empty( $matches[0]['sentence_confidence'] ) ? $mt_qe = floatval( $matches[0]['sentence_confidence'] ) : $mt_qe = null );

    $check = new QA( $text, $suggestion );
    $check->performTagCheckOnly();

    //log::doLog($check->getErrors(true));

    echo "--- (child $my_pid) : sid=$sid --- \$tm_match_type=$tm_match_type, \$fast_match_type=$fast_match_type, \$new_match_type=$new_match_type, \$equivalentWordMapping[\$new_match_type]=" . $equivalentWordMapping[$new_match_type] . ", \$raw_wc=$raw_wc,\$standard_words=$standard_words,\$eq_words=$eq_words\n";

    if( $check->thereAreErrors() ){
        $err_json = $check->getErrorsJSON();
    } else {
        $err_json = '';
    }

    $ret = CatUtils::addTranslationSuggestion($sid, $jid, $suggestion_json, $suggestion, $suggestion_match, $suggestion_source, $new_match_type, $eq_words, $standard_words, $suggestion, "DONE", (int)$check->thereAreErrors(), $err_json, $mt_qe );
    //unlock segment

    deleteLockSegment($sid, $jid);
    echo "--- (child $my_pid) : segment $sid-$jid unlocked\n";

    tryToCloseProject($pid);

}

//}

function tryToCloseProject( $pid ){

    global $my_pid;

    $segs_in_project = countSegments($pid);
    if ($segs_in_project < 0) {
        echo "--- (child $my_pid) : WARNING !!! error while counting segments in projects $pid skipping and continue \n";
        return;
    }
    echo "--- (child $my_pid) : count segments in project $pid = $segs_in_project\n";
    $analyzed_report = countSegmentsTranslationAnalyzed($pid);
    $segs_analyzed = $analyzed_report['num_analyzed'];
    $pid_eq_words = $analyzed_report['eq_wc'];
    $pid_standard_words = $analyzed_report['st_wc'];
    if ($segs_in_project - $segs_analyzed == 0) {
        echo "--- (child $my_pid) : analysis project $pid finished : change status to DONE\n";
        $change_res = changeProjectStatus($pid, "DONE");
        $tm_wc_res = changeTmWc($pid, $pid_eq_words, $pid_standard_words);
    }
    echo "\n\n";

}

function getNewMatchType($tm_match_type, $fast_match_type, $equivalentWordMapping) {

// RATIO : modifico il valore solo se il nuovo match è strettamente migliore (in termini di percentuale pagata per parola) di quello corrente
    $tm_match_cat = "";
    $tm_rate_paid = 0;

    $fast_match_type = strtoupper($fast_match_type);
    $fast_rate_paid = $equivalentWordMapping[$fast_match_type];


    if ($tm_match_type == "MT") {
        $tm_match_cat = "MT";
        $tm_rate_paid = $equivalentWordMapping[$tm_match_type];
    }


    if (empty($tm_match_cat)) {
        $ind = intval($tm_match_type);

        if ($ind == "100") {
            $tm_match_cat = "100%";
            $tm_rate_paid = $equivalentWordMapping[$tm_match_cat];
        }

        if ($ind < 50) {
            $tm_match_cat = "NO_MATCH";
            $tm_rate_paid = $equivalentWordMapping["NO_MATCH"];
        }

        if ($ind >= 50 and $ind <= 74) {
            $tm_match_cat = "50%-74%";
            $tm_rate_paid = $equivalentWordMapping["50%-74%"];
        }

        if ($ind >= 75 and $ind <= 99) {
            $tm_match_cat = "75%-99%";
            $tm_rate_paid = $equivalentWordMapping["75%-99%"];
        }
    }

    if ($tm_rate_paid < $fast_rate_paid) {
        return $tm_match_cat;
    }
    return $fast_match_type;
}

function compareScore($a, $b) {
    if( floatval($a['match']) == floatval($b['match']) ){ return 0; }
    return ( floatval($a['match']) < floatval($b['match']) ? 1 : -1); //SORT DESC !!!!!!! INVERT MINUS SIGN
    //this is necessary since usort sorts is ascending order, thus inverting the ranking
}
?>
