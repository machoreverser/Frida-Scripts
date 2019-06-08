/* Description: iOS 12 SSL Bypass based on blog post https://nabla-c0d3.github.io/blog/2019/05/18/ssl-kill-switch-for-ios12/
*  Author: 	@macho_reverser
*/

// Variables
var SSL_VERIFY_NONE = 0;
var ssl_ctx_set_custom_verify;

/* Create SSL_CTX_set_custom_verify NativeFunction 
*  Function signature https://github.com/google/boringssl/blob/7540cc2ec0a5c29306ed852483f833c61eddf133/include/openssl/ssl.h#L2294
*/
ssl_ctx_set_custom_verify = new NativeFunction(
	Module.findExportByName("libboringssl.dylib", "SSL_CTX_set_custom_verify"),
	'void', ['pointer', 'int', 'pointer']
);

/** Custom callback passed to SSL_CTX_set_custom_verify */
function custom_verify_callback_that_does_not_validate(ssl, out_alert){
	return 0;
}

/** Warp callback in NativeCallback for frida */
var ssl_verify_result_t = new NativeCallback(function (ssl, out_alert){
	custom_verify_callback_that_does_not_validate(ssl, out_alert);
},'int',['pointer','pointer']);

/* Do the actual bypass */
function bypassSSL(){
	Interceptor.replace(ssl_ctx_set_custom_verify, new NativeCallback(function(ssl, mode, callback) {
		//  |callback| performs the certificate verification. Replace this with our custom callback
		ssl_ctx_set_custom_verify(ssl, mode, ssl_verify_result_t);
	}, 'void', ['pointer', 'int', 'pointer']));
}

bypassSSL();
