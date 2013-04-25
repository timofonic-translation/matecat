<?php

include_once INIT::$MODEL_ROOT . "/casQueries.php";
include_once INIT::$MODEL_ROOT . "/LogEvent.class.php";
include_once INIT::$UTILS_ROOT . "/Tools.class.php";

class saveLogChunkController extends ajaxcontroller {

    private $jobId;
    private $fileId;
    private $logList;

    private $startTime;

    public function __construct() {
        parent::__construct();

        $this->startTime = Tools::getCurrentMillis();

//        log::doLog("CASMACAT: saveLogChunkController->__construct():");

        $this->jobId = $this->get_from_get_post("jobId");
        $this->fileId = $this->get_from_get_post("fileId");
        $this->logList = json_decode($this->get_from_get_post("logList"));
//        $this->logList = $this->get_from_get_post("logList");

//        log::doLog("CASMACAT: saveLogChunkController->__construct(): Initialized: jobId: '$this->jobId', fileId: '$this->fileId', logList: '"
//            . print_r($this->logList, true) . "'");
    }

    public function doAction() {

        $db = Database::obtain();
        $db->query("SET AUTOCOMMIT=0");
        $db->query("START TRANSACTION");

        try {
            $eventCount = count($this->logList);
            log::doLog("CASMACAT: saveLogChunkController->doAction(): Processing of logList containing '" . $eventCount . "' elements...");

            // TODO how about transactions?
            foreach ($this->logList as $key => $value) {
//                $value = (object) $value;
                $logEvent = new LogEvent($this->jobId, $this->fileId, $value);

                switch ($logEvent->type) {
                    case LogEvent::START_SESSION:
                        insertLogEventHeader($logEvent);
                        break;
                    case LogEvent::STOP_SESSION:
                        insertLogEventHeader($logEvent);
                        break;
                    case LogEvent::RESIZE:
                        $logEvent->resizeData($value);
                        insertResizeEvent($logEvent);
                        break;
                    case LogEvent::TEXT:
                        $logEvent->textData($value);
                        insertTextEvent($logEvent);
                        break;
                    case LogEvent::SELECTION:
                        $logEvent->selectionData($value);
                        insertSelectionEvent($logEvent);
                        break;
                    case LogEvent::SCROLL:
                        $logEvent->scrollData($value);
                        insertScrollEvent($logEvent);
                        break;
                    case LogEvent::GAZE:
                        $logEvent->gazeData($value);
                        insertGazeEvent($logEvent);
                        break;
                    case LogEvent::FIXATION:
                        $logEvent->fixationData($value);
                        insertFixationEvent($logEvent);
                        break;

                    case LogEvent::DRAFTED:
                    case LogEvent::TRANSLATED:
                    case LogEvent::APPROVED:
                    case LogEvent::REJECTED:
                        insertLogEventHeader($logEvent);
                        break;

                    case LogEvent::VIEWPORT_TO_SEGMENT:
                        insertLogEventHeader($logEvent);
                        break;

                    case LogEvent::SOURCE_COPIED:
                        insertLogEventHeader($logEvent);
                        break;

                    case LogEvent::SEGMENT_OPENED:
                        insertLogEventHeader($logEvent);
                        break;
                    case LogEvent::SEGMENT_CLOSED:
                        insertLogEventHeader($logEvent);
                        break;

                    case LogEvent::LOADING_SUGGESTIONS:
                        insertLogEventHeader($logEvent);
                        break;
                    case LogEvent::SUGGESTIONS_LOADED:
                        $logEvent->suggestionsLoadedData($value);
                        insertSuggestionsLoadedEvent($logEvent);
                        break;
                    case LogEvent::SUGGESTION_CHOSEN:
                        $logEvent->suggestionChosenData($value);
                        insertSuggestionChosenEvent($logEvent);
                        break;
                    case LogEvent::DELETING_SUGGESTION:
                        $logEvent->deletingSuggestionData($value);
                        insertDeletingSuggestionEvent($logEvent);
                        break;
                    case LogEvent::SUGGESTION_DELETED:
                        insertLogEventHeader($logEvent);
                        break;

                    case LogEvent::STATS_UPDATED:
                        $logEvent->statsUpdatedData($value);
                        insertStatsUpdatedEvent($logEvent);
                        break;

                    case LogEvent::DECODE:
                    case LogEvent::ALIGNMENTS:
                    case LogEvent::SUFFIX_CHANGE:
                    case LogEvent::CONFIDENCES:
                    case LogEvent::TOKENS:
                    case LogEvent::SHOW_ALIGNMENT_BY_KEY:
                    case LogEvent::HIDE_ALIGNMENT_BY_KEY:
                        $logEvent->itpData($value);
                        insertItpEvent($logEvent);
                        break;
                    case LogEvent::SHOW_ALIGNMENT_BY_MOUSE:
                    case LogEvent::HIDE_ALIGNMENT_BY_MOUSE:
                        insertLogEventHeader($logEvent);
                        break;

                    case LogEvent::KEY_DOWN:
                    case LogEvent::KEY_UP:
                        $logEvent->keyData($value);
                        insertKeyEvent($logEvent);
                        break;

                    case LogEvent::MOUSE_DOWN:
                    case LogEvent::MOUSE_UP:
                    case LogEvent::MOUSE_CLICK:
                    case LogEvent::MOUSE_MOVE:
                        $logEvent->mouseData($value);
                        insertMouseEvent($logEvent);
                        break;

                    case LogEvent::BEFORE_CUT:
                    case LogEvent::BEFORE_COPY:
                    case LogEvent::BEFORE_PASTE:
                        insertLogEventHeader($logEvent);
                        break;

                    default:
                        $db->query("COMMIT");   // at least, store what was ok
                        $db->query("SET AUTOCOMMIT=1");

//                        $this->result["executionTime"] = time() - $this->startTime;
                        $this->result["code"] = -1;
                        $this->result["errors"][] = array("code" => -1, "message" => "Unknown log event type: '$logEvent->type' at index: '$key'");
                        log::doLog("CASMACAT: saveLogChunkController->doAction(): '$logEvent->type' at index: '$key'");
    //                    throw new Exception("CASMACAT: saveLogChunkController->doAction(): Unknown log event type: '$logEvent->type' at index: '$key'");
                        return -1;
                }
            }
            $db->query("COMMIT");
            $db->query("SET AUTOCOMMIT=1");

            $this->result["executionTime"] = Tools::getCurrentMillis() - $this->startTime;
            $this->result["code"] = 0;
            $this->result["data"] = "OK";
            log::doLog("CASMACAT: saveLogChunkController->doAction(): Processing of logList containing '" . $eventCount . "' elements finished, time used: '" . $this->result["executionTime"] . "' ms.");
        }
        catch (Exception $e) {
            $db->query("COMMIT");   // at least, store what was ok
            $db->query("SET AUTOCOMMIT=1");

//            $this->result["executionTime"] = time() - $this->startTime;
            $this->result["code"] = -1;
            $this->result["errors"][] = array("code" => -1, "message" => "Unexcpected error: '" . $e->GetMessage() . "'");
            log::doLog("CASMACAT: saveLogChunkController->doAction(): Unexcpected error: '" . $e->GetMessage() . "'");
        }
    }
}

?>
