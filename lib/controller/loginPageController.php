<?php

header("Cache-Control: no-store, no-cache, must-revalidate");  // HTTP/1.1
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

class loginPageController extends viewController {

	private $oauthFormUrl;
	private $incomingUrl;

    public function __construct() {
        parent::__construct();
        parent::makeTemplate("login.html");

        //set url forpopup to oauth
        $this->oauthFormUrl=INIT::$HTTPHOST.'/oauth/request';

        //try to see if user specified some url
        $this->incomingUrl =$this->get_from_get_post("incomingUrl");
        //if nothing is specified by user
        if(empty($this->incomingUrl)){
            //open session to pull put information about incoming url
            $this->incomingUrl=$_SESSION['incomingUrl'];
        }else{
            //else, update session
            $_SESSION['incomingUrl']=$this->incomingUrl;
        }

    }

    public function doAction() {

    }

    public function setTemplateVars() {
	$this->template->oauthFormUrl=$this->oauthFormUrl;
	$this->template->incomingUrl=$this->incomingUrl;
	$this->template->build_number = INIT::$BUILD_NUMBER;
	
	    }

}

?>
