
$(function() {
    $('#createButton').click( onClickCreateWallet );
    $('#signTxButton').click( onClickSignTx );
    $('#oracle_generate_button').click( onClickGenerate );
});

// =============================
// Generate
// =============================
function onClickGenerate( event ) {
	var url = $('#oracle_url').val();
	CryptoCorp.setOracleUrl( url ) ;
	
	var extpub1 = $("#oracle_extpub1").val();
	var extpub2 = $("#oracle_extpub2").val();
	
	var b1 = new BIP32(extpub1);
	var b2 = new BIP32(extpub2);
	var pubKeyHex1 = Crypto.util.bytesToHex(b1.eckey.pub.getEncoded(true));
	var pubKeyHex2 = Crypto.util.bytesToHex(b2.eckey.pub.getEncoded(true));
	
	$("#pub1").val(pubKeyHex1);
	$("#pub2").val(pubKeyHex2);
	
	var rulesetId = "ugz284";
	var keys = [ extpub1, extpub2 ];
	var parameters = { "velocity_1": {"value": 200, "asset": "EUR", "period": 86400, limited_keys: [0], "delay": 3600}} ;
	var pii = { "encrypted": "fef8345f", "email": "user@example.com" } ;
	
	var walletId = "xue574"
	
	var data = CryptoCorp.getWalletData( rulesetId, keys, parameters, pii );
	CryptoCorp.CreateWallet( walletId, data, generateCreateWalletCallback ) ;	
}

function generateCreateWalletCallback( response ) {
	// fail
	if (response.result != "success") {
		// error handling
		if (response.thrownError != 'undefined') {
			alert( "Create Wallet failed: " + response.thrownError );
		}
		return;
	}
	// success
	var extpub3 = response.keys.default[0];
	var b3 = new BIP32(extpub3);
	var pubKeyHex3 = Crypto.util.bytesToHex(b3.eckey.pub.getEncoded(true));
	$("#pub3").val(pubKeyHex3);
	alert( "Create Wallet: keys: " + pubKeyHex3 );
	
	var script = CryptoCorp.generate_redemption_script($("#pub1").val(), $("#pub2").val(), $("#pub3").val() );
	$("#redemption_script").val(script);
}


//522102ef42cd0e76508b331f00f37a50a88e624788e1924c5d0cceceb275f3716042ae2102ef42cd0e76508b331f00f37a50a88e624788e1924c5d0cceceb275f3716042ae2102fc9e5af0ac8d9b3cecfe2a888e2117ba3d089d8585886c9c826b6b22a98d12ea53ae

//522102ef42cd0e76508b331f00f37a50a88e624788e1924c5d0cceceb275f3716042ae2102ef42cd0e76508b331f00f37a50a88e624788e1924c5d0cceceb275f3716042ae2102fc9e5af0ac8d9b3cecfe2a888e2117ba3d089d8585886c9c826b6b22a98d12ea53ae



// =============================
// Create Wallet
// =============================
function onClickCreateWallet( event ) {
	
	var walletId = $("#walletId").val();	
	var rulesetId = $("#rulesetId").val();
	var parameters = eval('('+ $("#parameters").val() +')');
	var keys = eval('('+ $("#keys").val() +')');
	var pii = eval('('+ $("#pii").val() +')');
	// CryptoCorp
	var data = CryptoCorp.getWalletData( rulesetId, keys, parameters, pii );
	CryptoCorp.CreateWallet( walletId, data, createWalletCallback ) ;	
}

function createWalletCallback( response ) {
	if (response.result != "success") {
		// error handling
		if (response.thrownError != 'undefined') {
			alert( "Create Wallet failed: " + response.errorThrown );
		}
		return;
	}
	// success
	var keys = response.keys;
	alert( "Create Wallet: keys: " + keys.default[0] );
}


// =============================
// Sign Tx
// =============================
function onClickSignTx( event ) {
	
	var walletId = $("#txWalletId").val();
	var signatureIndex = $("#signatureIndex").val();
	var bytes = $("#bytes").val();
	var inputScripts = eval('('+ $("#inputScripts").val() +')');
	var chainPaths =  eval('('+ $("#chainPaths").val() +')');
	var data = CryptoCorp.getSignTxData( signatureIndex, bytes, inputScripts, chainPaths);
	CryptoCorp.SignTx( walletId, data, signTxCallback ) ;	
}

function signTxCallback( response ) {
	// fail
	if (response.result == "error") {
		// error handling
		alert( "Sign Transaction failed: " + response.errorThrown );
		return;
	}
	// deferred
	if (response.result == "deferred") {
		// state handling
		var deferral = response.deferral ;
		alert( "Sign Transaction deferred: " + deferral.reason );
		return;
	}
	// success
	alert( "Sign Transaction: signed: " + response.transaction );
}