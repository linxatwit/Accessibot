// May need to install packages below if "node botjs.js" does not work, also need nodejs/npm installed if running on local machine
// npm install discord.js
// npm install node-witai-speech
// npm install request
// npm install underscore
// npm install @discordjs/opus
// npm install util
// npm install stream


const Discord = require('discord.js');
const opus = require('@discordjs/opus');
const WitSpeech = require('node-witai-speech');
const Util = require('util');
const { Readable } = require('stream');
const https = require('https');

// https://www.npmjs.com/package/jimp
// https://github.com/libgdx/libgdx/wiki/Hiero -> convert TTF fonts to BMFont 
// https://github.com/Exploit1337/jimp-discordjs
// https://github.com/oliver-moran/jimp/tree/master/packages/jimp
const Jimp = require('jimp')
const Canvas = require('canvas')

const fs = require('fs');


const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  getWITAIAppList(appList => {appList});
});

// Map for storing bot information e.g. voice channel ID that I am connected to, will need to disconnect later
// Currently should work on one server, for mutliple servers (guilds), it will probably need to map guild.id 
//    serverBotInfo.get(guild.id).get(__) -> then the usual information e.g. current voice channel ID or serverBotInfo.get(guild.id).get('voiceChannel)
// So if you connect to a voice channel on one server, and type !leave on another, it will leave on the first server AHAHAH
var serverBotInfo = new Map();
const sttLanguages = ['ar','bn','my','ca','zh','nl','en','fi','fr','de','hi','id','it','ja','kn','ko','ms','ml','mr','pl','pt','ru','si','es','sv','tl','ta','te','th','tr','ur','vi'];
serverBotInfo.set('dyslexicChannels', [])

client.on('message', async (msg) => {
  try {
    if (msg.content == 'ping') {
      msg.reply('Pong!');
    }

    // e.g. !rps rock, !rps paper, !rps scissors
    if (msg.content.startsWith('!rps')) {
      const choices = ['rock', 'paper', 'scissors'];
      const randChoice = Math.floor(Math.random() * choices.length);
      const botChoice = choices[randChoice];
      const userChoice = msg.content.split(" ")[1];
      switch (userChoice) {
        case 'rock':
          switch (botChoice) {
            case 'rock':
              msg.reply("Accessibot plays :rock:. It's a tie, copying a bot eh? Are you a bot?");
              break;
            case 'paper':
              msg.reply("Accesibot plays :newspaper:. You lose, you armadillo! HAHA!");
              break;
            case 'scissors':
              msg.reply("Accessibot plays :scissors:. Oh wow, you win... bullying a bot, whos the real winner here?");
              break;
          }
          break;
        case 'paper':
          switch (botChoice) {
            case 'rock':
              msg.reply("Accessibot plays :rock:. Oh wow, you win... bullying a bot, whos the real winner here?");
              break;
            case 'paper':
              msg.reply("Accesibot plays :newspaper:.  It's a tie, copying a bot eh? Are you a bot?");
              break;
            case 'scissors':
              msg.reply("Accessibot plays :scissors:. You lose, you giraffe! HAHA!");
              break;
          }
          break;
        case 'scissors':
          switch (botChoice) {
            case 'rock':
              msg.reply("Accessibot plays :rock:. You lose, you hippo! HAHA!");
              break;
            case 'paper':
              msg.reply("Accesibot plays :newspaper:. Oh wow, you win... bullying a bot, whos the real winner here?");
              break;
            case 'scissors':
              msg.reply("Accessibot plays :scissors:. It's a tie, copying a bot eh? Are you a bot?");
              break;
          }
          break;
        default:
          msg.reply("Yo, its !rps rock, !rps paper, or !rps scissors? Get with the program. Get it? Program? I'm a robo t beep ha beep ha!")
      }
    }

    if (msg.content == ',help') {
      msg.reply('\n**,dyslexic**\n    **on** - turns on open-dyslexic font for a text channel\n   **off** - turns off open-dyslexic font for a text channel\n\n**,channels** - list of #text-channel and #voice-channel clickable buttons that will move you to that channel\n\n**Speech-to-Text (STT)**\n**,stt on** - Joins the voice channel you are connected to\n**,stt pause** - While in a voice channel, stops listening\n**,stt resume** - While in a voice channel, resumes listening\n**,stt off** - Leaves current voice channel if in one\n**,stt ,lang**\n   **list** - List of languages supported for STT\n   **current** - Current server STT language setting\n   **[2-letter language code]** - See ,lang list for available codes');
    }



    if (serverBotInfo.get('dyslexicChannels').includes(msg.channel.name) && !msg.content.startsWith(',')) {
      if (msg.author.bot) {
        return;
      }
      // Splits up message to digestable lengths to write on an image
      let messageWords = msg.content.replace(',font', '').trim().split(' ')
      let messageArr = [];
      var messageString = "";
      for (let i = 0; i < messageWords.length; i++) {
          if (messageWords.length <= 1) {
            messageString += messageWords[0];
            messageArr.push(messageString);
            break;
          } else if (i < messageWords.length - 1) {
            if (messageString.length + (messageWords[i+1]).length >= 35) {
              messageArr.push(messageString)
              messageString = "";
            }
            messageString += messageWords[i] + ' ';
          } else {
            if (messageString.length + messageWords[messageWords.length-1].length >= 35) {
              messageArr.push(messageString);
              messageArr.push(messageWords[messageWords.length-1]);
            } else {
              messageString += messageWords[messageWords.length-1];
              messageArr.push(messageString);
            }
          }          
      }
      // messageArr.forEach(word => console.log(word))
      
      const avatarOffset = 40;
      const avatarSize =  100;

      // text image, display ratio is a mystery, zoinks
      let image = new Jimp(1000, 132 + (messageArr.length*50), '#36393f', (err, image) => {
        if (err) throw err;
      })
      await Jimp.loadFont('./fonts/opendyslexic-regular.fnt').then(font => {
        image.print(font, avatarSize + avatarOffset*2, 32, msg.author.username);
        for (let i = 0; i < messageArr.length; i++) {
          image.print(font, avatarSize + avatarOffset*2, 32 + (i+1)*50, messageArr[i]);
        }
        return image;
      }).then(image => {
        let file = `message.${image.getExtension()}`
        return image.writeAsync(file) 
      })

      // https://discordjs.guide/popular-topics/canvas.html#basic-image-loading
      const canvas = await Canvas.createCanvas(1000, 132 + (messageArr.length*50));
      const context = canvas.getContext('2d');

      const background = await Canvas.loadImage(`./message.${image.getExtension()}`);
      // draw and stretch background image to canvas
      context.drawImage(background, 0, 0, canvas.width, canvas.height);
      // set color of stroke
      context.strokeStyle = `#74037b`;
      
      // circular avatar region
      context.beginPath();
      // (x y)center radius startAngle endAngle antiClockwise?
      context.arc(avatarOffset + avatarSize/2, avatarOffset + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
      context.closePath();
      context.clip();
      const avatar = await Canvas.loadImage(msg.author.displayAvatarURL({format: `jpg`}));
      // draw image to topleft x, y, width height
      context.drawImage(avatar, avatarOffset, avatarOffset, avatarSize, avatarSize);

      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `message-image.png`);
      msg.channel.send(attachment);
      // delete image
      fs.unlink(`message.${image.getExtension()}`, (err) => {
        if (err) throw err
        console.log(`message.${image.getExtension()} was deleted.`)
      });
    }

    if (msg.content.startsWith(',dyslexic on')) {
      if (serverBotInfo.get('dyslexicChannels').includes(msg.channel.name)) {
        msg.reply('Open-Dyslexic Font is already enabled for ' + msg.channel.name + "!");
      } else {
        msg.reply('Open-Dyslexic Font has been enabled for ' + msg.channel.name);
        serverBotInfo.get('dyslexicChannels').push(msg.channel.name);
      }
    }

    if (msg.content.startsWith(',dyslexic off')) {
      if (serverBotInfo.get('dyslexicChannels').includes(msg.channel.name)) {
        msg.reply('Open-Dyslexic Font has been disabled for ' + msg.channel.name);
        serverBotInfo.get('dyslexicChannels').pop(msg.channel.name);
      } else {
        msg.reply('Open-Dyslexic Font is not enabled for ' + msg.channel.name + "!");
      }
    }


    // https://discordjs.guide/popular-topics/permissions.html#roles-as-bot-permissions
    // https://discord.js.org/#/docs/main/stable/class/GuildChannelManager
    if (msg.content == ',channels') {
      let textChannelList = []
      msg.guild.channels.cache.forEach(channel => {
        if (channel.type == 'text') {
          textChannelList.push('<#' + channel.id + '>');
        }
      });
      let voiceChannelList = []
      msg.guild.channels.cache.forEach(channel => {
        if (channel.type == 'voice') {
          voiceChannelList.push('<#' + channel.id + '>');
        }
      });

      msg.reply('Click any #text-channel!' + textChannelList.join(' ') + '\nClick any #voice-channel!' + voiceChannelList.join(' '));
    }



    // https://nodejs.dev/learn/making-http-requests-with-nodejs
    // https://wit.ai/docs/http/20200513/#get__apps_link
    // https://nodejs.org/api/https.html
    // https://wit.ai/faq -> langs supported for speech recognition
    if (msg.content.startsWith(',lang')) {
      try {
        let lang = msg.content.split(' ')[1].toLowerCase();      

        if (lang == 'current') {
          msg.reply('Current STT language setting: ' + serverBotInfo.get('sttLang') + '. Type ,lang list for available language codes.');
        } else if (lang == 'list' || (!sttLanguages.includes(lang) && lang != 'current')) {
          msg.reply('We currently support speech recognition for:\nArabic (ar)\nBengali (bn), Burmese (my)\nCatalan (ca), Chinese (zh)\nDutch (nl)\nEnglish (en)\nFinnish (fi), French (fr)\nGerman (de)\nHindi (hi)\nIndonesian (id), Italian(it)\nJapanese (ja)\nKannada (kn), Korean (ko)\nMalay (ms), Malayalam (ml), Marathi (mr)\nPolish (pl), Portuguese (pt)\nRussian (ru)\nSinhalese (si), Spanish (es), Swedish (sv)\nTagalog (tl), Tamil (ta), Telugu (te), Thai (th), Turkish (tr)\nUrdu (ur)\nVietnamese (vi)');
          msg.reply('Example usage: English ",lang en", Spanish ",lang es", Korean ",lang ko"');
        } else {
          getWITAIAppList(appList => {
            let appMap = appList.reduce(function(map, obj) {
              map[obj.name] = obj.id;
              return map;
            }, {});
            for (let i = 0; i < config.WITAI_TOKENS.length; i++) {
              updateWITAIAppLanguage(appMap['sst' + (i+1)], config.WITAI_TOKENS[i], lang, appData => {
                console.log(appData);
              });
            }
          });
          serverBotInfo.set('sttLang', lang);
          msg.reply('Successfully STT language setting to: ' + serverBotInfo.get('sttLang'));
        }
      } catch (e) {
        console.log(",lang Error :" + e);
      }
    }


    if (msg.content == ',stt on') {
      try {
        serverBotInfo.set('voiceChannel', msg.member.voice.channelID);
        serverBotInfo.set('audioReceiving', true);
        await connect(msg);
        msg.reply('I am listening! Current language setting: ' + serverBotInfo.get('sttLang'));
      } catch (e) {
        msg.reply("You're not in a voice channel!");
      }
    }
    if (msg.content == ',stt pause') {
      if (serverBotInfo.get('voiceChannel') != null) {
        serverBotInfo.set('audioReceiving', false);
        msg.reply("I'm not listening anymore!");
      } else {
        msg.reply("I'm not in a voice channel!")
      }
    }
    if (msg.content == ",stt resume") {
      if (serverBotInfo.get('voiceChannel') != null) {
        serverBotInfo.set('audioReceiving', true);
        msg.reply("I'm listening again!");
      } else {
        msg.reply("I'm not in a voice channel!");
      }
    }
    if (msg.content == ',stt off') {
      try {
        let voiceChannel = await client.channels.fetch(serverBotInfo.get('voiceChannel'));
        serverBotInfo.delete('voiceChannel');
        voiceChannel.leave();
      } catch (e) {
        msg.reply("I'm not in a voice channel!");
      }
    }

  } catch (e) {
    console.log("message Error: " + e);
    msg.reply('Bro... an error has occurred!');
  }
});

// https://nodejs.dev/learn/making-http-requests-with-nodejs
function getWITAIAppList(appList) {
  const options = {
    hostname: 'api.wit.ai',
    port: 443,
    path: '/apps?offset=0&limit=10',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + config.WITAI_TOKENS[0],
      'Content-Type': 'application/json'
    }
  }
  const req = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data = data + chunk;
    });
    response.on('end', () => {
      content = JSON.parse(data);
      if (serverBotInfo.get('sttLang') == null) { serverBotInfo.set('sttLang', content[0].lang) }
      appList(content);
    });
  });
  req.on('error', error => {
    console.error(error);
    appList(null);
  })
  req.end();
}
function updateWITAIAppLanguage(appID, appKey, appLang, appData) {
  const options = {
    hostname: 'api.wit.ai',
    port: 443,
    path: '/apps/' + appID,
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + appKey,
      'Content-Type': 'application/json'
    }
  }
  const data = JSON.stringify({'lang': appLang});
  const req = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data = data + chunk;
    });
    response.on('end', () => {
      appData(JSON.parse(data));
    });
  });
  req.on('error', error => {
    console.error(error);
    appData(null);
  })
  req.write(data);
  req.end();
}

async function connect(msg) {
  let voiceChannel = await client.channels.fetch(msg.member.voice.channelID);
  let voiceConnection = await voiceChannel.join();
  voiceConnection.play(new Silence(), { type: 'opus' });
  userSpeaking(voiceConnection, msg);
  msg.reply('Connected!');
}

function userSpeaking(voiceConnection, msg) {
  voiceConnection.on('speaking', async(user, speaking) => {
    // When user is not speaking or is the bot, do not do anything
    if (user.bot || speaking.bitfield == 0 || !serverBotInfo.get('audioReceiving')) {
      return;
    }
    // When user starts speaking, create audio stream, pcm formatted wav file
    const audioStream = voiceConnection.receiver.createStream(user, { mode: 'pcm' });
    // While user still speaking, input audio frame data into buffer
    let buffer = [];
    audioStream.on('data', (data) => {
        buffer.push(data);
    })
    // When user stops speaking, create new buffer, reformat audio, transcribe audio
    audioStream.on('end', async() => {
      buffer = Buffer.concat(buffer);
      let newBuffer = await convertAudio(buffer);
      let transcription = await transcribeAudio(newBuffer);
      if (typeof transcription == "string") {
        msg.channel.send(user.username + ": " + transcription);
      } else {
        console.log(transcription);
      }
    })
  })
}

// https://discordjs.guide/voice/receiving-audio.html
// https://discord.js.org/#/docs/main/stable/typedef/ReceiveStreamOptions
// https://nodejs.org/api/stream.html#stream_readable_read_size_1
// Silence Frame -> node_modules/discord.js/src/client/voice/util/Silence.js
// By default, audio stream is undefined/ empty, so we need to play something
const SILENCE_FRAME = Buffer.from([0xf8, 0xff, 0xfe]);
class Silence extends Readable {
  _read() {
    this.push(SILENCE_FRAME);
    this.destroy();
  }
}

// https://stackoverflow.com/questions/4714542/pcm-wave-file-stereo-to-mono#4715502
// https://researchaholic.com/2013/08/01/split-a-pcm-stereo-into-multiple-mono-files-by-channel/
// Converts 16 bit signed PCM formatted wav file from stereo to mono
async function convertAudio(buffer) {
  try {
    const stereo = new Int16Array(buffer);
    const mono = new Int16Array(stereo.length/2);
    let j = 0;
    for (let i = 0; i < stereo.length; i += 4) {
      mono[j++] = stereo[i];
      mono[j++] = stereo[i+1];
    }
    return Buffer.from(mono);
  } catch (e) {
    console.log("convertAudio Error: " + e);
  }
}

// https://www.npmjs.com/package/node-witai-speech
// https://wit.ai/docs/
// https://github.com/wit-ai/pywit
const config = {
  "DISCORD_TOKEN": process.env.DISCORD_TOKEN,
  "WITAI_ID": process.env.WITAI_ID,
  "WITAI_TOKENS": [process.env.WITAI_TOKEN_1, process.env.WITAI_TOKEN_2, process.env.WITAI_TOKEN_3,
                    process.env.WITAI_TOKEN_4, process.env.WITAI_TOKEN_5, process.env.WITAI_TOKEN_6,
                    process.env.WITAI_TOKEN_7, process.env.WITAI_TOKEN_8, process.env.WITAI_TOKEN_9,
                    process.env.WITAI_TOKEN_10]
}
let lastWITAIToken = 0;
async function transcribeAudio(buffer) {
    try {
      // promisify: promise chaining + async/await with callback-based APIs
      const speechIntent = Util.promisify(WitSpeech.extractSpeechIntent);
      var audioStream = Readable.from(buffer);
      const audioStreamSettings = "audio/raw;encoding=signed-integer;bits=16;rate=48k;endian=little";
      // from wit.ai app: obj: { entities: {}, intents: [], text: "__", traits {} }
      const obj = await speechIntent(config.WITAI_TOKENS[lastWITAIToken++%config.WITAI_TOKENS.length], audioStream, audioStreamSettings);
      lastSpeechIntentCall = Math.floor(new Date());
      audioStream.destroy();
      return obj.text;
    } catch (e) { 
      console.log("transcribeAudio Error: " + e);
    }
}

client.login(config.DISCORD_TOKEN);

