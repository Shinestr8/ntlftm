const express = require("express");
const serverless = require("serverless-http");
const axios = require("axios").default;
const middlewares = require('./middlewares')


const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    hello: "hi!"
  });
});

router.get('/currentcup',middlewares.setCache(30), async function(req, res){
  console.log("fetching current cup data for scamdiv.tk")
  let options = {
      method: 'GET',
      url: 'https://trackmania.io/api/cotd/0',
      headers: { 'User-Agent':"Small app to know what div is type 2/3"}
  }
  try{
      let response = await axios.request(options);
      res.json(response.data);
  } catch(error){
      console.log(error);
      res.json({message: "error for scamdiv.tk"})
  }
})

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
