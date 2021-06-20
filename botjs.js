// May need to install packages below if "node botjs.js" does not work, also need nodejs/npm installed if running on local machine
// npm install discord.js
// npm install node-witai-speech
// npm install request
// npm install underscore
// npm install @discordjs/opus
// npm install util
// npm install stream

const Discord = require('discord.js');
const WitSpeech = require('node-witai-speech');
const Util = require('util');
const { Readable } = require('stream');

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Map for storing bot information e.g. voice channel ID that I am connected to, will need to disconnect later
// Currently should work on one server, for mutliple servers (guilds), it will probably need to map guild.id 
//    serverBotInfo.get(guild.id).get(__) -> then the usual information e.g. current voice channel ID or serverBotInfo.get(guild.id).get('voiceChannel)
// So if you connect to a voice channel on one server, and type !leave on another, it will leave on the first server AHAHAH
var serverBotInfo = new Map();
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

    if (msg.content == '!join') {
      try {
        serverBotInfo.set('voiceChannel', msg.member.voice.channelID);
        await connect(msg);
        msg.reply('Join!');
      } catch (e) {
        msg.reply("You're not in a voice channel!");
      }
    }
    if (msg.content == '!leave') {
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
    if (user.bot || speaking.bitfield == 0) {
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
      if (typeof transcription != "undefined") {
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
// By default, audio stream is undefined/ empty, so we need to play something
const dataChunk = Buffer.from([0x00]);
class Silence extends Readable {
  _read() {
    this.push(dataChunk);
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
async function transcribeAudio(buffer) {
    try {
      // promisify: promise chaining + async/await with callback-based APIs
      const speechIntent = Util.promisify(WitSpeech.extractSpeechIntent);
      var audioStream = Readable.from(buffer);
      const audioStreamSettings = "audio/raw;encoding=signed-integer;bits=16;rate=48k;endian=little";
      // from wit.ai app: obj: { entities: {}, intents: [], text: "__", traits {} }
      const obj = await speechIntent(process.env['WITAI_TOKEN'], audioStream, audioStreamSettings);
      audioStream.destroy();
      return obj.text;
    } catch (e) { 
      console.log("transcribeAudio Error: " + e);
    }
}

client.login(process.env['DISCORD_TOKEN']);


