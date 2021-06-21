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
@client.event
async def on_message(message):
  try:
    if message.author == client.user:
      return

    if message.content.startswith('$hello'):
      await message.channel.send('Hello!')

    # e.g. !rps rock, !rps paper, !rps scissors
    if message.content.startswith('!rps'):
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
        await message.reply("Yo, its !rps rock, !rps paper, or !rps scissors? Get with the program. Get it? Program? I'm a robo t beep ha beep ha!")



    if message.content.startswith("!tts"):
      # bot hasn't joined any voice channels and you haven't joined any either
      if message.content == "!tts": 
        await message.reply("You haven't put any text! Try !tts hello world")
      elif message.author.voice == None and "voice_channel" not in serverBotInfo:
        await message.reply("I'm not in a voice channel yet! Try joining one and try again!")
      else:
        # connect to your voice channel if not in one
        if "voice_channel" not in serverBotInfo:
          voiceConnection = await message.author.voice.channel.connect()
          serverBotInfo["voice_channel"] = message.author.voice.channel
        # if you are in another voice channel (not in a text chanenl), go to it
        elif "voice_channel" in serverBotInfo and message.author.voice != None:
          await message.author.guild.voice_client.disconnect()
          voiceConnection = await message.author.voice.channel.connect()
          serverBotInfo["voice_channel"] = message.author.voice.channel
        # if you are in the same voice channel or the bot is in a voice channel, you are not connected to any and you use !tts in a text channel, continue
        else:
          voiceConnection = message.author.guild.voice_client

        # convert text to mp3 file
        tts = gTTS(message.content[5:], lang='en')
        tts.save("input.mp3")
        # ffmpeg convert mp3 file to PCM signed 16-bit little-endian samples mono channel 48000hz
        # https://discordpy.readthedocs.io/en/stable/api.html#discord.AudioSource
        # The audio stream can be Opus encoded or not, however if the audio stream is not Opus encoded then the audio format must be 16-bit 48KHz stereo PCM.
        os.system('ffmpeg -y  -i input.mp3  -acodec pcm_s16le -f s16le -ac 1 -ar 48000 output.pcm')

        # using ffmpeg, play mp3 file
        # https://www.ffmpeg.org/download.html -> Windows Build by BtbN -> ffmpeg-n4.4-72-g91aa49218e-win64-gpl-4.4.zip -> bin -> copy exe files to directory
        # use exe file shown below with file path + mp3 source
        if not voiceConnection.is_playing():
          voiceConnection.play("output.pcm")
          # wait until finish playing to delete
          while voiceConnection.is_playing():
            await asyncio.sleep(1)
        
        # remove mp3 file
        os.remove("ipnut.mp3")
        os.remove("output.pcm")
              
    if message.content.startswith("!leave"):
      serverBotInfo.pop("voice_channel")
      await message.author.guild.voice_client.disconnect()

  except Exception as e:
    print("message Error: ", e)
    await message.reply("Bro cmon, what is this error")

client.run(os.getenv('DISCORD_TOKEN'))
