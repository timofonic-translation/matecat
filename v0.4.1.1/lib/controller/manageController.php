<?php

include_once INIT::$MODEL_ROOT . "/queries.php";
include_once INIT::$UTILS_ROOT . "/CatUtils.php";
include_once INIT::$UTILS_ROOT . "/langs/languages.class.php";

/**
 * Description of manageController
 *
 * @author andrea
 */
class manageController extends viewController {

	private $jid = "";
	private $pid = "";
	public $notAllCancelled = 0;

	public function __construct() {
		parent::__construct(true);
		parent::makeTemplate("manage.html");

        $filterArgs = array(
            'page'      =>  array('filter'  =>  array(FILTER_SANITIZE_NUMBER_INT)),
            'filter'    =>  array('filter'  =>  array(FILTER_VALIDATE_BOOLEAN), 'options' => array(FILTER_NULL_ON_FAILURE))
        );

        $postInput = filter_input_array(INPUT_GET, $filterArgs);

        $this->page = $postInput[ 'page' ];

        if($this->page == null || empty($this->page)){
            $this->page = 1;
        }
		$this->lang_handler = Languages::getInstance();

		if ($postInput[ 'filter' ] !== null && $postInput[ 'filter' ]) {
			$this->filter_enabled = true;
		} else {
			$this->filter_enabled = false;
		};
	}

	public function doAction() {
	}

	public function setTemplateVars() {

		$this->template->prev_page = ($this->page - 1);
		$this->template->next_page = ($this->page + 1);
		$this->template->languages = $this->lang_handler->getEnabledLanguages('en');
		$this->template->filtered = $this->filter_enabled;
		$this->template->filtered_class = ($this->filter_enabled) ? ' open' : '';
		$this->template->logged_user = trim($this->logged_user['first_name'] . " " . $this->logged_user['last_name']);
		$this->template->build_number = INIT::$BUILD_NUMBER;
        $this->template->basepath = INIT::$BASEURL;
        $this->template->hostpath = INIT::$HTTPHOST;
        $this->template->v_analysis = var_export( INIT::$VOLUME_ANALYSIS_ENABLED, true );

	}

}

?>
