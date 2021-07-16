# pip install discord.py
# pip install discord.py[voice]
# pip install gtts

import discord
from gtts import gTTS
import asyncio
import os
import random

client = discord.Client()

@client.event
async def on_ready():
  print('We have logged in as {0.user}'.format(client))


serverBotInfo = dict()
serverBotInfo["slow"] = "False"
sererBotInfo["pitch"] = 1
@client.event
async def on_message(message):
  try:
    if message.author == client.user:
      return

    if message.content.startswith('$hello'):
      await message.channel.send('Hello!')

    helpCommands = ['!help', '*help']
    if message.content in helpCommands:
      await message.reply('Try ,help')
    if message.content.startswith(',help'):
      await message.channel.send('Text-to-Speech\n,tts {on off current}')

    # e.g. ,rps rock, ,rps paper, ,rps scissors
    if message.content.startswith(',rps'):
      choices = ['rock', 'paper', 'scissors']
      botChoice = random.choice(choices)
      userChoice = message.content.split(" ")[1]
      if userChoice == 'rock':
        if botChoice == 'rock':
          await message.reply("Accessibot plays :rock:. It's a tie, copying a bot eh? Are you a bot?")
        elif botChoice == 'paper':
          await message.reply("Accesibot plays :newspaper:. You lose, you armadillo! HAHA!")
        elif botChoice == 'scissors':
          await message.reply("Accessibot plays :scissors:. Oh wow, you win... bullying a bot, whos the real winner here?")
      elif userChoice == 'paper':
        if botChoice == 'rock':
          await message.reply("Accessibot plays :rock:. Oh wow, you win... bullying a bot, whos the real winner here?")
        elif botChoice == 'paper':
          await message.reply("Accesibot plays :newspaper:.  It's a tie, copying a bot eh? Are you a bot?")
        elif botChoice == 'scissors':
          await message.reply("Accessibot plays :scissors:. You lose, you giraffe! HAHA!")
      elif userChoice == 'scissors':
        if botChoice == 'rock':
          await message.reply("Accessibot plays :rock:. You lose, you hippo! HAHA!")
        elif botChoice == 'paper':
          await message.reply("Accesibot plays :newspaper:. Oh wow, you win... bullying a bot, whos the real winner here?")
        elif botChoice == 'scissors':
          await message.reply("Accessibot plays :scissors:. It's a tie, copying a bot eh? Are you a bot?")
      else:
        await message.reply("Yo, its !rps rock, !rps paper, or !rps scissors? Get with the program. Get it? Program? I'm a robot beep ha beep ha!")

    if serverBotInfo.get("tts_text_channel") != None and serverBotInfo.get("tts_text_channel") == message.channel.name and not message.content.startswith(','):
      # bot hasn't joined any voice channels and you haven't joined any either
      if message.author.voice == None and "voice_channel" not in serverBotInfo:
        await message.reply("I'm not in a voice channel yet! Try joining one and try again!")
      else:
        # connect to your voice channel if not in one
        if "voice_channel" not in serverBotInfo:
          voiceConnection = await message.author.voice.channel.connect()
          serverBotInfo["voice_channel"] = message.author.voice.channel
        # if you are in another voice channel (not in a text chanenl), go to it
        elif "voice_channel" in serverBotInfo and message.author.voice != None and serverBotInfo.get("voice_channel") != message.author.voice.channel:
          await message.author.guild.voice_client.disconnect()
          voiceConnection = await message.author.voice.channel.connect()
          serverBotInfo["voice_channel"] = message.author.voice.channel
        # if you are in the same voice channel or the bot is in a voice channel, you are not connected to any and you use !tts in a text channel, continue
        else:
          voiceConnection = message.author.guild.voice_client

        # convert text to mp3 file
        if serverBotInfo.get("accent") == None:
          tts = gTTS(message.content, lang='en', slow=serverBotInfo.get("slow"))
        else:
          tts = gTTS(message.content, lang=serverBotInfo.get("accent"), slow=serverBotInfo.get("slow"))
        tts.save("input.mp3")
        # ffmpeg convert mp3 file to PCM signed 16-bit little-endian samples mono channel 48000hz
        # https://discordpy.readthedocs.io/en/stable/api.html#discord.AudioSource
        # The audio stream can be Opus encoded or not, however if the audio stream is not Opus encoded then the audio format must be 16-bit 48KHz stereo PCM.
        # os.system('ffmpeg -y  -i input.mp3  -acodec pcm_s16le -f s16le -ac 1 -ar 48000 output.mp3')

        # using ffmpeg, play mp3 file
        # https://www.ffmpeg.org/download.html -> Windows Build by BtbN -> ffmpeg-n4.4-72-g91aa49218e-win64-gpl-4.4.zip -> bin -> copy exe files to directory
        # use exe file shown below with file path + mp3 source
        if not voiceConnection.is_playing():
          ffmpegPitch = "\"-af asetrate=44100*" + serverBotInfo.get("pitch") + ", aresample=44100, atempo=1/0.9\""
          voiceConnection.play(discord.FFmpegPCMAudio('./input.mp3'))
          # wait until finish playing to delete
          while voiceConnection.is_playing():
            await asyncio.sleep(1)
        
        # remove mp3 file
        os.remove("output.mp3")
        # os.remove("output.pcm")
              
    if message.content.startswith(",tts on"):
      serverBotInfo["tts_text_channel"] = message.channel.name
      await message.reply("I turned on tts for this channel!")

    if message.content.startswith(",tts off"):
      if serverBotInfo.get("tts_text_channel") == None:
        await message.reply("No text channel has tts enabled!")
      else:
        serverBotInfo.pop("tts_text_channel")
        await message.reply("I turned off tts!")
        if message.author.guild.voice_client != None:
          serverBotInfo.pop("voice_channel")
          await message.author.guild.voice_client.disconnect()
    
    if message.content.startswith(",tts current"):
      if serverBotInfo.get("tts_text_channel") == None:
        await message.reply("No text channel has tts enabled!")
      else:
        await message.reply(serverBotInfo.get("tts_text_channel") + " has tts enabled!")

    if message.content.startswith(",acc"):
      serverBotInfo["accent"] = message.content.split(" ")[1]
      await message.reply("I have set the speaker accent to " + serverBotInfo.get("accent") + "!")

    if message.content.startswith(",pitch"):
      if message.content.split(" ")[1] == "raise":
        serverBotInfo["pitch"] = 1.25
        await message.reply("I have raised the pitch of the voice!")
      elif message.content.split(" ")[1] == "lower":
        serverBotInfo["pitch"] = .25
        await message.reply("I have lowered the pitch of the voice!")
      else:
        await message.reply("Sorry I don't understand, command usage is \",pitch {raise  | lower}\"")

    if message.content.startswith(",slow"):
      if message.content.split(" ")[1] == "on":
        serverBotInfo["slow"] = "True"
        await message.reply("I have set slower speaker mode to true!")
      else:
        serverBotInfo["slow"] = "False"
        await message.reply("I have set slower speaker mode to false!")

  except Exception as e:
    print("message Error: ", e)
    await message.reply("Bro cmon, what is this error")

client.run(os.getenv('DISCORD_TOKEN'))
