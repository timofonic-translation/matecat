<?
/*
   this class manages supported languages in the CAT tool
 */
class Languages{

	private static $instance; //singleton instance
	private static $map_string2rfc; //associative map on language names -> codes
	private static $map_rfc2obj; //internal support map rfc -> language data
	private static $map_iso2rfc; //associative map iso -> rfc codes

	//access singleton
	public static function getInstance() {
		if (!self::$instance) {
			self::$instance = new Languages();
		}
		return self::$instance;
	}

	//constructor
	private function __construct() {
		//get languages file
		$file=INIT::$UTILS_ROOT.'/langs/supported_langs.json';
		if(!file_exists($file)) die("no language defs found in $file");
		$string=file_get_contents($file);
		//parse to associative array
		$langs=json_decode($string,true);
		$langs=$langs['langs'];
		//build internal maps
		//for each lang
		foreach($langs as $k1=>$lang){
			foreach($lang['localized'] as $k2=>$localizedTagPair){
				foreach($localizedTagPair as $isocode=>$localizedTag){
					//build map of localized string -> rfc code
					self::$map_string2rfc[$localizedTag]=$lang['rfc3066code'];
					//add associative reference
					$langs[$k1]['localized'][$isocode]=$localizedTag;
				}
				//remove positional reference
				unset($langs[$k1]['localized'][$k2]);
			}
		}
		//create internal support objects representation
		foreach($langs as $lang){
			//primary pointers are RFC
			self::$map_rfc2obj[$lang['rfc3066code']]=$lang;
			//set support for ISO by indirect reference through RFC pointers
			self::$map_iso2rfc[$lang['isocode']]=$lang['rfc3066code'];
			//manage ambiguities
			self::$map_iso2rfc['en']='en-US';
			self::$map_iso2rfc['pt']='pt-BR';
		}
	}

	//get localized name of a language
	public function getLocalizedName($code,$lang){
		//convert ISO code in RFC
		if(strlen($code)<5)$code=self::$map_iso2rfc[$code];

		return self::$map_rfc2obj[$code]['localized'][$lang];
	}

	//is right-to-left language?
	public static function isRTL($code){
		//convert ISO code in RFC
		if(strlen($code)<5)$code=self::$map_iso2rfc[$code];

		return self::$map_rfc2obj[$code]['rtl'];
	}

	//is language enabled
	public static function isEnabled($code){
		//convert ISO code in RFC
		if(strlen($code)<5)$code=self::$map_iso2rfc[$code];

		return self::$map_rfc2obj[$code]['enabled'];
	}

	//get corresponding RFC3066 code given a localized name
	public static function get3066Code($localizedName){
		return self::$map_string2rfc[$localizedName];
	}

	//get corresponding ISO 639-1 code given a localized name
	public static function getIsoCode($localizedName){
		return self::$map_rfc2obj[self::$map_string2rfc[$localizedName]]['isocode'];
	}

	//get list of languages, as RFC3066
	public static function getEnabledLanguages($localizationLang){
		foreach(self::$map_rfc2obj as $rfc=>$lang){
			//if marked as enabled, add to result
			if($lang['enabled']) $list[]=array('rfc'=>$rfc,'name'=>$lang['localized'][$localizationLang]);
		}
		return $list;
	}
}
?>