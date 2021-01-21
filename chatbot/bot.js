const tmi = require('tmi.js');
const child_process = require('child_process');
const utf8 = require('utf8');
const rp = require('request-promise');
const $ = require('cheerio');
const { htmlToText } = require('html-to-text');
const fs = require('fs');

// Define configuration options
const opts = {
  identity: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  },
  channels: [
    process.env.CHANNEL
  ]
};

// Create a client with our options
const client = new tmi.client(opts);
var ready = true;
var firstInfo = true;
const delay = process.env.DELAY_INFO * 60 * 1000

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

function info(target, text) {
  if (firstInfo) {
    client.say(target, text);
    setInterval(function(){
      client.say(target, text);
    }, delay);
    firstInfo = false;
  }
}


function resetTimeout() {
  ready = false;
  setTimeout(function(){ready=true}, 60000);
}

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {


  if (self) { return; } // Ignore messages from the bot
  
  info(target, "Hola gente! Para saber los comandos !comandos");
  
  var destacado = false;
  if (context['msg-id'] == 'highlighted-message') {
      destacado = true;
  }


  // Remove whitespace from chat message
  const commandName = msg.trim().split(' ')[0];
  var success = true;
  if (commandName.charAt(0)==='!') {
    if (ready || commandName == '!comandos' || destacado) {
      const sound = commandName.substring(1);
      switch (sound) {      
        case "hypnosapo":
          client.say(target, "Alabemos todos al gran hypnosapo!");
          playSound(sound);    
          break;
        case "samatao":
          client.say(target, "Sa matao Paco!!!");
          playSound(sound);    
          break;
        case "cuidao":
          client.say(target, "Cuidaooooo!!!");
          playSound(sound);    
          break;
        case "siuuu":
          client.say(target, "Siuuuuuuu!!!");
          playSound(sound);    
          break;
        case "jurasico":
          client.say(target, "Tiriri ri ri, tiri ri ri ri, tiririiiiii!!!");
          playSound(sound);    
          break;
        case "alcuerno":
          client.say(target, "Al cuerno todo!!!");
          playSound(sound);    
          break;
        case "ranita":
          client.say(target, "Una ranita iba paseando!!!");
          playSound(sound);    
          break;
        case "expulsion":
          client.say(target, "No me jodas Rafa!!");
          playSound(sound);    
          break;
        case "lee":
          readTextUser(msg, context['username'])
          break;
        case "chiste":
          tellJoke();
          break;
        case "eugenio":
          randomJoke();
          break;
        case "comandos":
          client.say(target, "Comandos: !lee <texto>, !chiste, !hypnosapo, !samatao, !cuidao, !siuuu, !jurasico, !alcuerno, !expulsion, !ranita, !eugenio." +
            "\nTienen un timeout de 60 segundos, si quieres saltartelo, mandalo como destacado");
          success = false;
          break;
        default:
          client.say(target, `${commandName}? Pero que dises?!`);
          console.log(`* Unknown command ${commandName}`);
          success = false;


        }


      if (success && !destacado) {
        resetTimeout()
      }
    } else {
      client.say(target, "Tranquilito que hay un timeout global de 60 segundos");
    }
    

  }
  

function tellJoke() {
  rp({url: 'http://www.chistes.com/ChisteAlAzar.asp?n=3', encoding: 'latin1'})
  .then(function(html){
    //success!
    var text = "";

    $('.chiste', html)[0].children.forEach(function(element) {
      if(element.data) {

        text += element.data + ' '
      }
    });
    readText(text);

  })
  .catch(function(err){
    //handle error
  });
}

function randomJoke() {
    fs.readdir('jokes', (err, files) => {
      const randomElement = files[Math.floor(Math.random() * files.length)];
      console.log(randomElement);
      child_process.exec(`mplayer -slave "jokes/${randomElement}"`);
    });
    

}

}
function eliminarDiacriticos(texto) {
    return texto.replace('ñ', 'ny').normalize('NFD').replace(/[\u0300-\u036f]/g,"");
}

function playSound(sound) {
  child_process.exec(`mplayer -slave "sounds/${sound}.mp3"`);
}

function readText(text) {
  child_process.exec(`echo "${eliminarDiacriticos(text)}" | festival --tts`);
}

function readTextUser(msg, user) {
  readText(`"${user} dice: ${msg}"`.replace("!lee", ""));
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

