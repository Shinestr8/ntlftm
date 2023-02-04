const express = require("express");
const serverless = require("serverless-http");
const axios = require("axios").default;
const middlewares = require('./middlewares')


const app = express();
const router = express.Router();

router.use(middlewares.setCORS);

router.get("/", (req, res) => {
  res.json({
    hello: "hi!"
  });
});

const userAgentHeader = "I'm learning web development, and building a small stats website as an exercise. Feel free to contact me on discord (Shine#2603) if you think that my use of your API is a problem"

// const cacheDuration = 12*3600;
const cacheDuration = 1800;

router.get('/COTDStats', middlewares.setCache(cacheDuration), async function(req, res){
    const accountid = req.query.accountid;
    console.log(accountid ? `Fetching COTD stats for user ${accountid}` : 'Error, no accountid')
    let options = {   
        method: 'GET',
        url: 'https://trackmania.io/api/player/' + accountid + '/cotd/0',
        headers: { 'User-Agent':userAgentHeader }
    }
    try{
        let response = await axios.request(options);
        console.log(`sending data for user ${accountid}...`)
        res.json(response.data);
    }
    catch(error){
        console.log(error);
        res.json({message: "error"})
    }
    
})

router.get('/findTrokmoniPlayer',middlewares.setCache(cacheDuration), async function(req, res){
    console.log("searching trackmania player " + req.query.player);
    const player = req.query.player; 
    
    //first, search the player(s) that match this username
    let options = {
        method: 'GET',
        url: 'https://trackmania.io/api/players/find?search=' + player,
        headers: { 'User-Agent':userAgentHeader}
    }

    try{
        let response = await axios.request(options);

        //first case: no result
        if(response.data.length === 0){
            console.log("Aucun résultat trouvé pour la recherche: " + player);
            res.json({"message": 'Player not found'})
            return
        }
    
        let found = false;
        let foundIndex = 0;
        for(let i = 0; i < response.data.length; ++i){
            if(response.data[i].player.name.toLowerCase() === player.toLowerCase()){
                found = true;
                foundIndex = i;
            }
        }
    
    
        //second case: there is at least one result
        // let found = response.data[0].player.name;
        if(found || response.data.length === 1){
            options = {
                method: 'GET',
                url: 'https://trackmania.io/api/player/' + response.data[foundIndex].player.id,
                headers: { 'User-Agent':userAgentHeader }
            }
            let response2 = await axios.request(options);
            console.log('sending matching result');
            res.json(response2.data);
        } else {
            console.log("sending list of player ig")
            res.json(response.data)
        }
    } catch(error){
        console.log(error);
        res.json({message: "error while fetching COTD stats"});
    }
       
})

router.get('/forceUpdate',middlewares.setCache(cacheDuration), async function(req, res){
    console.log("forceupdate")
    const player = req.query.player;
    console.log("host: " + req.headers.host);
    console.log("ip: " + req.ip)
    console.log("Searching player: " + player);
    let options = {
        method: 'GET',
        url: 'https://trackmania.io/api/players/find?search=' + player,
        headers: { 'User-Agent':userAgentHeader}
    }
    try{
        let response = await axios.request(options);
        if(response.data.length === 0){
            console.log("Aucun résultat trouvé pour la recherche: " + player);
            res.json({"message": 'Player not found'})
            return
        }

        let found = response.data[0].player.name;
        if(found.toLowerCase() === player.toLowerCase()){
            options = {
            method: 'GET',
            url: 'https://trackmania.io/api/player/' + response.data[0].player.id,
            headers: { 'User-Agent':userAgentHeader }
            }
            let response2 = await axios.request(options);
            res.json(response2.data);
        } else {
            res.json(response.data)
        }   
    } catch(error){
        console.log(error);
        res.json({message: "error during force update"})
    }
    
})
router.get('/test', function(req, res){
    console.log("host: " + req.get('origin'));
    res.json({message: "Hello"});
})

router.get('/lingo', middlewares.setCache(1800), async function(req, res){
    console.log("Checking lingo")
    let options = {
        method: 'GET',
        url: 'https://trackmania.io/api/player/b981e0b1-2d6a-4470-9b52-c1f6b0b1d0a6',
        headers: { 'User-Agent':userAgentHeader}
    }
    try{
        let response = await axios.request(options);
        console.log(response.data.displayname);
        res.json({"name": response.data.displayname});
    } catch(error){
        res.json({message: "error while fetching lingo"})
    }  
})

router.get('/hobbit', middlewares.setCache(1800), async function(req, res){
    let options = {
        method: 'GET',
        url: 'https://trackmania.io/api/player/2343ca67-a77c-47c8-83bd-74f99c6f0a37',
        headers: { 'User-Agent':userAgentHeader}
    }
    try{
        let response = await axios.request(options);
        console.log(response.data.displayname);
        res.json({"name": response.data.displayname});
    } catch(error){
        res.json({message: "error while fetching lingo"})
    }  
})

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
