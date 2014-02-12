
//=======================================================================
// CryptoCorp API
//=======================================================================
var CryptoCorp = new function () {
	
	// configurables

    var host = "http://btc2.hyper.to";
    var KeyIndex = Object.freeze( {
        USER : 0,
        BACKUP : 1,
        ORACLE : 2
    } );
    
    this.Result = Object.freeze( {
        SUCCESS : "success",
        ERROR : "error",
        DEFERRED : "deferred"
    } );
    
    this.Deferral = Object.freeze( {
        DELAY : "delay",
    } );

    this.setOracleUrl = function(url) {
        host = url.trim( );
    }; 
	
	/*
	 * create a new keychain
	 * 
	 * @param user data
	 * @param callback api response handler
	 */
    this.CreateKeychain = function(data, callback) {
        var keychainId = getNewKeychainId();
        var url = getKeychainUrl( keychainId );
        // TODO keychain id temporary placed in the paylod, should come back in the response
        var payload = { "keychainUrl" : url };
        post( url, data, callback, payload );
    }; 
	
    /*
     * get a keychain
     * 
     * @param keychain Url
     * @param callback api response handler
     * @payload pass through to callback 
     */
    this.GetKeychain = function(keychainUrl, callback, payload) {
        get( keychainUrl.trim(), callback, payload );
    }; 
	
    /*
     * sign a transaction
     * 
     * @param keychain Url
     * @param data transaction data
     * @param callback api response handler
     * @payload pass through to callback 
     */
    this.SignTx = function(keychainUrl, data, callback, payload) {
        url = getKeychainTxUrl( keychainUrl.trim( ) )
        post( url, data, callback, payload );
    };

    // keychain url
    function getKeychainUrl(keychainId) {
        return host + "/keychains/" + keychainId.trim( );
    }

    // keychain TX url
    function getKeychainTxUrl(keychainUrl) {
        return keychainUrl.trim( ) + "/transactions";
    }

    function get(url, callback, payload) {
        $.ajax( {
            contentType : "application/json",
            crossDomain : true,
            url : url,
            type : 'GET',
            success : function(response) {
                successCallback( response, callback, payload );
            },
            error : function(xhr, textStatus, errorThrown) {
                errorCallback( xhr, textStatus, errorThrown, callback, payload );
            },
            complete : function(xhr) {
                return;
            }
        } );
    }
    
    function post(url, data, callback, payload) {
        var stringified = JSON.stringify( data );
        $.ajax( {
            contentType : "application/json",
            crossDomain : true,
            url : url,
            type : 'POST',
            data : stringified,
            success : function(response) {
                successCallback( response, callback, payload );
            },
            error : function(xhr, textStatus, errorThrown) {
                errorCallback( xhr, textStatus, errorThrown, callback, payload );
            },
            complete : function(xhr) {
                return;
            }
        } );
    }
    
    function getSync(url, contentType) {
        var response;
        $.ajax( {
            contentType : contentType,
            crossDomain : true,
            async : false,
            url : url,
            success : function(data) {
                response = { "result" : CryptoCorp.Result.SUCCESS, "data" : data };
            },
            error : function(xhr, textStatus, errorThrown) {
                // repackage results
                var consolidatedErrorText = getXhrErrorText( xhr, errorThrown );
                response = { result : CryptoCorp.Result.ERROR, xhr : xhr, errorThrown : consolidatedErrorText };
            },
        } );
        return response;
    }
    
	// post callback - success
	function successCallback(data, callback, payload) {
		// if malformed data - invoke callback as error
		if( data == null  ||  data === undefined  ||  data.result === undefined ) {
			var response = { result: CryptoCorp.Result.ERROR, errorThrown: "No Data", data: data };
			callback( response, payload );
			return;
		}
		// invoke callback 
		callback( data, payload ) ;
	}
	
	// post callback - ERROR
    function errorCallback(xhr, textStatus, errorThrown, callback, payload) {
        console.log( "xhr.status:" + xhr.status );
        console.log( "xhr.responseText:" + xhr.responseText );
        console.log( "textStatus:" + textStatus );
        console.log( "errorThrown:" + errorThrown );

        // extract the error message fom the xhr
        var consolidatedErrorText = getXhrErrorText( xhr, errorThrown );
        // callback
        var response = { result : CryptoCorp.Result.ERROR, xhr : xhr, errorThrown : consolidatedErrorText };
        callback( response, payload );
    }
    
    // extract the error string out of the xhr
    function getXhrErrorText(xhr, errorThrown) {
        // timeout
        if (xhr.readyState == 0) {
            return "Timeout";
        }
        // undefined
        if (xhr.responseText === undefined || xhr.responseText == null) {
            return errorThrown;
        }
        // html
        if (xhr.responseText.indexOf( "<html>" ) == 0) {
            var start = xhr.responseText.indexOf( "<title>" ) + 7;
            var end = xhr.responseText.indexOf( "</title>" );
            var text = xhr.responseText.substring( start, end );
            return text;
        }
        // json
        try {
            var json = JSON.parse( xhr.responseText );
            if (json.error !== undefined) {
                return json.error;
            }
        } catch(e) {
        }
        // no text
        return errorThrown + ":" + xhr.responseText;
    }

    // create the keychain data objact
    this.getKeychainData = function(rulesetId, keys, parameters, pii) {
        return {
            "rulesetId" : rulesetId,
            "keys" : keys,
            "parameters" : parameters,
            "pii" : pii
        };
    };
	
    // create the keychain parameters
    this.getParameters = function(value, asset, period, delay) {
        return {
            "velocity_1" : {
                "value" : parseFloat( value ),
                "asset" : asset,
                "period" : parseInt( period ),
                "limited_keys" : [KeyIndex.USER]
            },
            "delay_1" : parseInt( delay ),
        };
    }
    
    this.getPii = function(email, first, last, phone) {
        // FIXME encrypt pii
        var encrypted = "123456";
        var pii = {
            "email" : email,
            "phone" : phone,
            "encrypted" : encrypted
        };
        return pii;
    }
	
	// create the transaction data object
    this.getSignTxData = function(signatureIndex, bytes, inputScripts, inputTransactions) {    
        return {
            "signatureIndex" : signatureIndex,
            "transaction" : {
                "bytes" : bytes,
                "inputScripts" : inputScripts,
                "inputTransactions" : inputTransactions,
            },
        };
    };
	
    function pad(str, len, ch) {
        padding = '';
        for (var i = 0; i < len - str.length; i++) {
            padding += ch;
        }
        return padding + str;
    }
	
    this.generate_redemption_script = function( pub1_str, pub2_str, pub3_str ) {
		
        pub1_str = pad( pub1_str.trim(), 65, '0' );
        var pub1 = Crypto.util.hexToBytes(pub1_str);

        pub2_str = pad( pub2_str.trim(), 65, '0' );
        var pub2 = Crypto.util.hexToBytes(pub2_str);

        pub3_str = pad( pub3_str.trim(), 65, '0' );
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
    };
    
    function getNewKeychainId() {
        return createUUID( );
    }
    
    function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr( Math.floor( Math.random( ) * 0x10 ), 1 );
        }
        s[14] = "4";
        // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr( (s[19] & 0x3) | 0x8, 1 );
        // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
    
        var uuid = s.join( "" );
        return uuid;
    }

    /*
     * get input transactions for redemption script
     *
     * @param redemption script
     * @return array of raw transactions
     */
    this.getInputTransactions = function(inputScriptString, callback) {
        // extract the address from the script
        var address = this.getScriptAddress( inputScriptString );
        // read unspent 
        var url = getUnspentUrl( address );
        var response = getSync( url, "application/json" );
        if (response.result != this.Result.SUCCESS) {
            return response;
        }
        // extract the input transactions from the unspent outputs
        var response = this.getInputTransactionsFromUnspent( response.data.unspent_outputs );
        callback( response );
    }
    
    /*
     * iterrate on all unspent inputs and get the input transactions
     *
     * @param serialized transaction bytes
     * @return array of raw transactions
     */
    this.getInputTransactionsFromUnspent = function(unspent_outputs) {
        var inputTransactions = new Array();
        // for each transaction
        for (var i = 0; i < unspent_outputs.length; i++) {
            // reverse the tx bytes to match blockcahin requirement
            var tx_hash = unspent_outputs[i].tx_hash;
            var tx_hash_reversed = Crypto.util.bytesToHex( Crypto.util.hexToBytes( tx_hash ).reverse() );
            var url = getRawtxUrl( tx_hash_reversed );
            // get the tx hex
            var response = getSync( url, "text" );
            if (response.result != this.Result.SUCCESS) {
                return response;
            }
            inputTransactions.push( response.data );
        }
        response = { "result": this.Result.SUCCESS, "data": inputTransactions };
        return response;
    }
    
    /*
     * get the address from a redemption script
     *
     * @param inputScriptString the input script
     * @return p2sh address string
     */
    this.getScriptAddress = function(inputScriptString) {
        var bytes = Crypto.util.hexToBytes(inputScriptString);
        var redemptionScript = new Bitcoin.Script(bytes);
        var redemptionScriptHash160 = Bitcoin.Util.sha256ripe160(redemptionScript.buffer);
        var p2shAddress = new Bitcoin.Address(redemptionScriptHash160);
        p2shAddress.version = 5; // BTC_MAIN
        return "" + p2shAddress;
    }
    
    function getUnspentUrl(address) {
        return "https://blockchain.info/unspent?cors=true&address=" + address;
    }
    
    function getRawtxUrl(tx_hash_reversed) {
        return "https://blockchain.info/rawtx/" + tx_hash_reversed + "?format=hex&cors=true";
    }

}