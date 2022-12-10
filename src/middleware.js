const NodeCache = require('node-cache');
const cache = new NodeCache();

	exports.setCache = function(duration){
		return function(req, res, next){
			console.log("request recieved, checking cache...")
			if(req.method !== 'GET'){
	        	console.log('Cannot cache non get method');
	        	return next();
	    	}
	    	let key = req.originalUrl.toLowerCase();
	    	if(req.query.forceupdate === "true"){
	    		key = key.split("&forceupdate=true")[0];
	    		cache.del(key);
	    		console.log("force update detected, value deleted from cache")
	    	}
	    	
	    	const cachedResponse = cache.get(key);
	    	if(cachedResponse){
	        console.log(`${key} was found in the cache`);
	        	res.send(cachedResponse);
	    	} else {
	        	console.log(`${key} was not found in the cache`);
	        	res.originalSend = res.send;
	        	res.send = body => {
	            	res.originalSend(body);
	            	cache.set(key, body, duration);
	            	console.log(`${key} saved in cache`)
	        	}
	        	next();
	    	}
		}
	}

	exports.setCORS = function(req, res, next){
		console.log("request recieved... checking CORS")
		const allowedOrigins = [
			'http://127.0.0.1:5500',
			'http://localhost:5500', 
			'http://localhost:3000', 
			'https://shinestr8.github.io', 
			'http://192.168.1.20:3000',
			'https://tm-stats.tk', 
			'https://whatislingoscurrentusername.ga',
			'https://scamdiv.tk'
		];
	    const origin = req.headers.origin;
	    if (allowedOrigins.includes(origin)) {
			console.log("Authorized origin... " + origin);
			res.setHeader('Access-Control-Allow-Origin', origin);
	    } else {
			console.log("Unauthorized origin " + origin)
		}
	    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
	    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	    res.header('Access-Control-Allow-Credentials', true);
	    return next();
	}