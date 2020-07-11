var express = require('express');
var router = express.Router();

const { WebhookClient } = require('dialogflow-fulfillment');

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

  let intentMap = new Map();
  intentMap.set('getCategory', getCategory)
  agent.handleRequest(intentMap);

});

module.exports = router;
