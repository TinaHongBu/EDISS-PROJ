/**
 * Created by Tina on 6/10/17.
 */

var express      = require('express');
var bodyParser   = require('body-parser'); // a middleware used to parse URL encoded input parameters as json
var cookieParser = require('cookie-parser');
var router       = express.Router();
const CONFIG     = require('../config.json');
const AUTH         = require('./authenticator.js');
var elasticsearch = require('elasticsearch');
const NO_PRODUCT_MSG = "There are no products that match that criteria";

var client = new elasticsearch.Client({
  host: 'localhost:9200'
});

var valid = function(input) {
	if(input === undefined || input === null)
		return false;
	else return true;
}

router.post('/viewProducts', AUTH.ensureValidInput, function(req, res, next) {
    var sess = req.session;
    var asin = req.body.asin;
    var group = req.body.group;
    var keyword = req.body.keyword;
    var hits = "";
    var query = "";

    if(valid(asin) && valid(group) && valid(keyword))
    	query = {
    		query: {
	  			bool:{
	  				must: [ 
	  				{match: {'title': keyword}},
	  				// {multi_match: {
					  // 	query: keyword,
					  // 	fields: ['title', 'description']}
	  				// },
	  				{term: {'asin': asin}},
	  				{term: {'categories': group}}
	  				]
	  			}
			}
		}

	else if(valid(asin) && valid(group) && !valid(keyword)) 
		query = {
		  	query: {
	  			bool: {
	  				must: [ 
	  				{term: {'asin': asin}},
	  				{term: {'categories': group}}
	  				]
	  			}
			}
		}

	else if(valid(asin) && !valid(group) && valid(keyword))
		query = {
	  		query: {
	  			bool:{
	  				must: [ 
	  				{match: {'title': keyword}},
	  			// 	{multi_match: {
						// query: keyword,
					 //  	fields: ['title', 'description']}
	  			// 	},
	  				{term: {'asin': asin}}
	  				]
	  			}

			}
		}

	else if(!valid(asin) && valid(group) && valid(keyword))
		query= {
			query: {
	  			bool:{
	  				must: [ 
	  				{match: {'title': keyword}},
	  			// 	{
	  			// 		multi_match: {
						//   	type: 'phrase',
						//   	fields: ['title', 'description']
						// }
	  			// 	},
	  				{term: {'categories': group}}
	  				]
	  			}

			}
		}

	else if(!valid(asin) && !valid(group) && valid(keyword))
		query = {
			query: {
				match: {'title': keyword}
				// multi_match: {
				//   	type: 'phrase',
				//   	fields: ['title', 'description']
				// }
	  		}
		}

	else if(!valid(asin) && valid(group) && !valid(keyword))
		query = {
			query: {
				term: {'categories': group}
	  		}
		}

	else if(valid(asin) && !valid(group) && !valid(keyword))
		query = {
			query: {
				term: {'asin': asin}
			}
		}

	client.search({
		index: 'product',
	    type: 'products',
	    body: query
	}).then(function (resp) {
	    hits = resp.hits.hits;
	    var result = [];
	    if(hits.length !== 0){
		    for (var i = 0; i <=hits.length - 1; i++) {
		    	result.push({"asin": hits[i]._source.asin, "productName": hits[i]._source.title});
		    }
		    res.send({"product": result});
		} else res.send({"message": NO_PRODUCT_MSG});
	}, function (err) {
	    console.log(err.message);
	});
});

module.exports = router;