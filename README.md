# sr4a-discord-bot
A discord bot to support SR4A gameplay
## Features/commands
- /ping - test network latency of the bot implementation and discord
- /roll - roll dice as per 4EA rules. Parameters:
  - dice - number of dice. Add up everything (Vehicle handling, Program level, Edge, etc.) before
  - edge - True/False. If true, rule of six will be applied

The results are displayed in English or Hungarian depending on your Discord settings.

## Further reading
Built based on mostly these docs:
- https://discordjs.guide
- https://fly.io/docs/launch/continuous-deployment-with-github-actions/
