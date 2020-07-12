var express = require('express');
var router = express.Router();
var request = require('request')

const { WebhookClient } = require('dialogflow-fulfillment');
const { get } = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/webhook', (req,res) => {
  const agent = new WebhookClient({
    request : req, response : res
  });

  function getCategory(agent){
    agent.add('Category From Database');
  }

   async function getPayment(agent){
    let foo = await getAccessToken();
    console.log(foo);
    let bar = await getPaymentDeepLink(foo,50,'1','2')+'?callback_url=https://line.me/R/oaMessage/@407odvsh/';
    agent.add(bar);
  }
//==================================SCB PAYMENT=================================
  function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

  function getAccessToken(){
    var options = {
      method: 'POST',
      url: 'https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token',
      headers: {
        'resourceOwnerId': 'l75ac72c3427434a41addbd089bb58d6c8',
        'requestUId': create_UUID(),
        'Content-Type': 'application/json'
      },
      body: {
        'applicationKey': 'l75ac72c3427434a41addbd089bb58d6c8',
        'applicationSecret': '0c35f386997d4611a957579ea93f2ab9'
      },
      json : true
    };

    return new Promise(function (resolve,reject){
      request(options, function (error, res, body){
        if (!error && res.statusCode == 200){
          resolve(body.data.accessToken);
        }else{
          reject(error);
        }
      });
    });
  }

  function getPaymentDeepLink(accessToken, amount, ref1, ref2){
    var options = { 
      method: 'POST',
      url: 'https://api-sandbox.partners.scb/partners/sandbox/v3/deeplink/transactions',
      headers: {
        'resourceOwnerId': 'l75ac72c3427434a41addbd089bb58d6c8',
        'requestUId': create_UUID(),
        'channel': 'scbeasy',
        'authorization': 'bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: {
        "transactionType": "PURCHASE",
        "transactionSubType": ["BP"],
        "billPayment": {
          "paymentAmount": 100,
          "accountTo": "395774125591677",
          "ref1": "11",
          "ref2": "11",
          "ref3": "SCB"
        }
      },
      json: true
    };
    return new Promise(function (resolve, reject) {
      request(options, function (error, res, body) {
        if (!error && res.statusCode == 201) {
          resolve(body.data.deeplinkUrl);
        } else {
          reject(error);
        }
      });
    });
  }
//==============================================================================

  let intentMap = new Map();
  intentMap.set('getCategory', getCategory);
  intentMap.set('getPayment', getPayment);
  agent.handleRequest(intentMap);

});

module.exports = router;
