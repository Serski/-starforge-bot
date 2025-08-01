# Starforge Bot

A Discord bot that posts news updates, rotating advertisements, and allows players to submit structured reviews. The bot is designed to run in a single server and expects several environment variables for configuration.

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file with the following variables:

```
DISCORD_TOKEN=MTM5Mzg5MTU4OTI4NTM0NzQ4MA.GdOv71.k44-PlsWbB0LycG1Ee37MQ-2yqmvZEyDcd8qR4
CLIENT_ID=393891589285347480
GUILD_ID=806555974168215553
NEWS_CHANNEL_NAME=news-feed
```

3. Register slash commands in your server:

```bash
node deploy-commands.js
```

4. Start the bot:

```bash
node index.js
```

## `/review` Command

Use `/review` in the channel defined by `NEWS_CHANNEL_NAME` to post a review embed. The modal includes an optional field labeled **"Message Link or ID (this server, optional)"**.
Provide either the raw message ID from the same channel or a full message link from another channel in the server. The referenced message must contain an uploaded image attachment. The first attachment will be used as the review image.

## Tests

Run `npm test` to execute the Jest test suite.
