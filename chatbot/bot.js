const tmi = require('tmi.js');
const child_process = require('child_process');
const utf8 = require('utf8');
const rp = require('request-promise');
const $ = require('cheerio');
const { htmlToText } = require('html-to-text');

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
  
  info(target, "Hola gente! Si quereis que el robot asesino lea vuestros mensajes, escribidlos como destacados (lo de gastar puntos).\n Para saber los comandos !comandos");
  
  if (context['msg-id'] == 'highlighted-message') {
      readTextUser(msg, context['username']); 
  }


  // Remove whitespace from chat message
  const commandName = msg.trim().split(' ')[0];
  var success = true;
  if (commandName.charAt(0)==='!') {
    if (ready || commandName == '!comandos') {
      const sound = commandName.substring(1);
      switch (sound) {      
        case "hypnotoad":
          client.say(target, "All glory to the hypno toad!");
          playSound(sound);    
          break;
        case "lee":
          readTextUser(msg, context['username'])
          break;
        case "chiste":
          tellJoke();
          break;
        case "comandos":
          client.say(target, "Comandos: !lee <texto>, !chiste, !hypnotoad");
          success = false;
          break;
        default:
          client.say(target, `${commandName}? Pero que dises?!`);
          console.log(`* Unknown command ${commandName}`);
          success = false;


        }


      if (success) {
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
    var children = $('.chiste', html)[0].children;
    console.log(children.length)
    var text = "";
    children.forEach(function(element) {
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


}
function eliminarDiacriticos(texto) {
    return texto.replace('ñ', 'ny').normalize('NFD').replace(/[\u0300-\u036f]/g,"");
}

function playSound(sound) {
  child_process.exec(`mplayer -slave sounds/${sound}.mp3`);
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

