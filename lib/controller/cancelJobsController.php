<?php

include_once INIT::$MODEL_ROOT . "/queries.php";
include_once INIT::$UTILS_ROOT . "/CatUtils.php";

class cancelJobsController extends ajaxController {

	private $res_type;
	private $res_id;

	public function __construct() {

        $this->disableSessions();
		parent::__construct();
		$this->res_type = $this->get_from_get_post('res');
		$this->res_id = $this->get_from_get_post('id');
	}

	public function doAction() {
		$canc = cancelJob($this->res_type, $this->res_id);

		$this->result['code'] = 1;
		$this->result['data'] = "OK";
	}

}

?>
