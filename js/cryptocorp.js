
//=======================================================================
// CryptoCorp API
//=======================================================================
var CryptoCorp = new function () {
	
	// configurables
	var host = "http://btc2.hyper.to";
	
	this.setOracleUrl = function( url ) {
		host = url;
	}
	
	//-----------------------
	// Create Wallet
	//-----------------------
	this.CreateWallet = function (walletId, data, callback) {
		var url = getWalletUrl( walletId );
		post( url, data, callback );
	}
	
	//-----------------------
	// Sign Tx
	//-----------------------
	this.SignTx = function (walletId, data, callback) {
		var url = getWalletTxUrl( walletId );
		post( url, data, callback );
	}
	
	// wallet url
	function getWalletUrl(walletId) {
		return host + "/wallets/" + walletId;
	}
	
	// wallet url
	function getWalletTxUrl(walletId) {
		return getWalletUrl(walletId) + "/transactions";
	}
	
	// post
	var postCallback;
	
	function post(url, data, callback) {
		// will be invoked by local callback handlers
		postCallback = callback;
		// must 
		var stringified = JSON.stringify( data );
		// POST
		$.ajax({
			contentType: "application/json",
			crossDomain: true,
			url: url,
			type: 'POST',
			data: stringified,
			success: successCallback,
			error: errorCallback,
			complete :  function (xhr){
				return;
			}
		});
	}
	
	
	// post callback - success
	function successCallback(data) {
		// if malformed data - invoke callback as error
		if( data == null  ||  data == 'undefined'  ||  data.result == 'undefined' ) {
			var response = { result: "error", thrownError: "No Data" };
			postCallback( response );
			return;
		}
		// invoke callback 
		postCallback( data ) ;
	}
	
	// post callback - ERROR
	function errorCallback(xhr, textStatus, thrownError) {
		console.log("xhr.status:" +xhr.status);
		console.log("xhr.responseText:"+ xhr.responseText);
		console.log("textStatus:"+ textStatus);
		console.log("thrownError:" +thrownError);
		
		// repackage results
		var response = { result: "error", xhr: xhr, thrownError: thrownError };
		postCallback( response );
	}	
	
	this.getWalletData = function( rulesetId, keys, parameters, pii ) {
	
		var data = { 
			"rulesetId": rulesetId, 
			"keys": keys, 
			"parameters": parameters, 
			"pii": pii 
		};
		return data;
	}
	
	this.getSignTxData = function( signatureIndex, bytes, inputScripts, chainPaths ) {
		var data  = {"signatureIndex": signatureIndex, "transaction": {"bytes": bytes}, "inputScripts": inputScripts, "chainPaths": chainPaths};
		return data;
	}
	
    function pad(str, len, ch) {
        padding = '';
        for (var i = 0; i < len - str.length; i++) {
            padding += ch;
        }
        return padding + str;
    }
	
    this.generate_redemption_script = function( pub1_str, pub2_str, pub3_str ) {
		
        pub1_str = pad( pub1_str, 65, '0' );
        var pub1 = Crypto.util.hexToBytes(pub1_str);

        pub2_str = pad( pub2_str, 65, '0' );
        var pub2 = Crypto.util.hexToBytes(pub2_str);

        pub3_str = pad( pub3_str, 65, '0' );
        var pub3 = Crypto.util.hexToBytes(pub3_str);

        var pubkey1 = new Bitcoin.ECKey();
        pubkey1.pub = pub1;
        pubkey1.pubKeyHash = Bitcoin.Util.sha256ripe160(pubkey1.pub);

        var pubkey2 = new Bitcoin.ECKey();
        pubkey2.pub = pub2;
        pubkey2.pubKeyHash = Bitcoin.Util.sha256ripe160(pubkey2.pub);

        var pubkey3 = new Bitcoin.ECKey();
        pubkey3.pub = pub3;
        pubkey3.pubKeyHash = Bitcoin.Util.sha256ripe160(pubkey3.pub);

        // New versions of BitcoinJS-lib have createMultiSigOutputScript, but the one 
        // currently in brainwallet at github doesn't have it, so we must build the
        // script manually.
        var redemption_script = new Bitcoin.Script();

	    var req_count = 2;
	    var outof_count = 3;
        redemption_script.writeOp([Bitcoin.Opcode.map["OP_1"], Bitcoin.Opcode.map["OP_2"], Bitcoin.Opcode.map["OP_3"]][req_count - 1]);
        
        var pubkeys = new Array(pub1, pub2, pub3);
        for( var i = 0; i < 3 && i < outof_count; i++ ) {
            redemption_script.writeBytes(pubkeys[i]);
        }

        redemption_script.writeOp(Bitcoin.Opcode.map["OP_1"] + (pubkeys.length - 1));
        redemption_script.writeOp(Bitcoin.Opcode.map["OP_CHECKMULTISIG"]);

        var redemption_script_str = Crypto.util.bytesToHex(redemption_script.buffer);
		return redemption_script_str;
    }
	
		
}