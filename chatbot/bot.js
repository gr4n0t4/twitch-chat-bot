const tmi = require('tmi.js');
const child_process = require('child_process');
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

const readAll = true;

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

function info(target, text) {
  if (firstInfo) {
    setInterval(function(){
      client.say(target, text);
    }, 300000);
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
  if (readAll) { 
    info(target, "Hola gente! Si quereis que el robot asesino lea vuestros mensajes, escribidlos como destacados (lo de gastar puntos)");
    if (context['msg-id'] == 'highlighted-message') {
      readText(msg, context['username']); 
    }
    return; 
  }
  info(target, "Hola gente tenemos disponibles los siguientes commandos: !hypnotoad, !lee <texto a leer>");


  // Remove whitespace from chat message
  const commandName = msg.trim().split(' ')[0];
  var success = true;
  if (commandName.charAt(0)==='!') {
    if (ready) {
      const sound = commandName.substring(1);
      switch (sound) {      
        case "hypnotoad":
          client.say(target, "All glory to the hypno toad!");
          playSound(sound);    
          break;
        case "lee":
          readText(msg, context['username'])
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
  
}
function eliminarDiacriticos(texto) {
    return texto.replace('ñ', 'ny').normalize('NFD').replace(/[\u0300-\u036f]/g,"");
}

function playSound(sound) {
  child_process.exec(`mplayer -slave sounds/${sound}.mp3`);
}

function readText(msg, user) {
  const text = msg.replace("!lee", "");
  child_process.exec(`echo "${eliminarDiacriticos(user)} dice: ${eliminarDiacriticos(text)}" | festival --tts`);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

