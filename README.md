# Accessibot
[Accessibot](http://accessi-bot.herokuapp.com/) is a [Discord](https://discord.com) bot built to cater those who may have an impairment or disability that prevents them from using Discord's VoIP and chat service to it’s full extent. This bot was originally built to help out a friend who is mute but was eventually expanded to help a wider audience!
![accessibot](./docs/images/accessibot_mascot.png)

## Current Features
### General
- ,help
    - Displays a list of commands for the bot.
### Text-To-Speech
- ,tts on
    - Join a voice channel and type this command in a text channel to enable tts in it.
    - Any messages typed will be converted to speech in a voice channel you are connected to.
- ,tts off
    - Disables tts in the text channel tts is enabled in.
- ,tts current
    - Tells the user which channel tts is enabled in.
- ,acc {language code}
    - Changes the accent of the speaker for bot.
    - The list of language codes can be found [here](https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code).
- ,speed increase
    - Speaker for the bot speaks faster.
- ,speed decrease
    - Speaker for the bot speaks slower.
- ,pitch increase
    - Speaker for the bot speaks at a higher pitch.
- ,pitch decrease
    - Speaker for the bot speaks at a lower pitch.
### Speech-To-Text
- ,stt on
    - Joins the voice channel you are connected to.
- ,stt pause
    - While in a voice channel, stops listening.
- ,stt resume
    - While in a voice channel, resumes listening.
- ,stt off
    - Leaves current voice channel if in one.
- ,lang list
    - List of languages supported for STT.
        - Current language support for: Arabic (ar), Bengali (bn), Burmese (my), Catalan (ca), Chinese (zh), Dutch (nl), English (en), Finnish (fi), French (fr), German (de), Hindi (hi), Indonesian (id), Italian(it), Japanese (ja), Kannada (kn), Korean (ko), Malay (ms), Malayalam (ml), Marathi (mr), Polish (pl), Portuguese (pt), Russian (ru), Sinhalese (si), Spanish (es), Swedish (sv), Tagalog (tl), Tamil (ta), Telugu (te), Thai (th), Turkish (tr), Urdu (ur), Vietnamese (vi)
- ,lang {language code} 
    - See ,lang list for available codes.
### Custom Fonts
- ,dyslexic on
    - Any message typed in this text channel will be converted into OpenDyslexic font.
- ,dyslexic off
    - Disables text to custom font conversion.
### Channel Navigation
- ,channels
    - Bot will reply with clickable button links to other text and voice channels that the user can click on to move to.

## Installation
Fork/download the project. 

```pip install requirements.txt```
Install all requirements in requirements.txt.

## Run
```python app.py```

To view the website, go to ```localhost:5000```.

## Terminate
Ctrl + C to terminate flask application.

## Host
The website and bot is currently hosted on Heroku. Go to https://accessi-bot.herokuapp.com to view the website.
