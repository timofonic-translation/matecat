<?

class MT_ERROR {

	public $code=0;
	public $message="";

	public function __construct($result = array()) {
		if (!empty($result)) {
			$this->code = $result['code'];
			$this->message = $result['message'];
		}
	}

	public function get_as_array() {
		return (array) $this;
	}

}

?>
