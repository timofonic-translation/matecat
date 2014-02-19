<?php

require_once 'inc/config.inc.php';

INIT::obtain();

require_once INIT::$UTILS_ROOT . '/Log.php';
require_once INIT::$UTILS_ROOT . '/Utils.php';
require_once INIT::$MODEL_ROOT . '/Database.class.php';
$db = Database::obtain ( INIT::$DB_SERVER, INIT::$DB_USER, INIT::$DB_PASS, INIT::$DB_DATABASE );
$db->debug = INIT::$DEBUG;
$db->connect ();
// var_dump (get_include_path());exit;
// var_dump (INIT::$ROOT);exit;

$controller = controller::getInstance ();
$controller->doAction ();
$controller->finalize ();
$db->close ();


?>
