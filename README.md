# Starforge Bot

A Discord bot that posts news updates, rotating advertisements, and allows players to submit structured reviews. The bot is designed to run in a single server and expects several environment variables for configuration.

## Setup

1. Install dependencies

```bash
npm install
```

2. Register slash commands in your server:

```bash
node deploy-commands.js
```

3. Start the bot:

```bash
node index.js
```

## `/review` Command

Use `/review` in the channel defined by `NEWS_CHANNEL_NAME` to post a review embed. The modal includes an optional field labeled **"Message Link or ID (this server, optional)"**.
Provide either the raw message ID from the same channel or a full message link from another channel in the server. The referenced message must contain an uploaded image attachment. The first attachment will be used as the review image.


## Kaldur Prime Ticket Flow

When a **KALDUR PRIME** advertisement posts, it includes a **Buy Ticket** button. Clicking the button (`kaldur_buy_ticket`) checks for a role named `KALDUR PRIME`.
If the role exists and the member doesn't have it, the bot grants the role and opens a private menu to start the hunt.

Sample interaction IDs used in this flow:
- `kaldur_buy_ticket`
- `kaldur_select_destination`
- `kaldur_cinderholm`
- `kaldur_basilica`
- `kaldur_fields`
- `kaldur_abort`

## Kaldur Quest Structure

When the menu opens, players choose between three destinations:

```text
Cinderholm Ruins
Crystal Basilica Rot
Murmuring Fields
Abort Hunt
```

Each destination branches into A/B/C options (e.g. the Smelter God, Choir That
Bleeds, Stampede in the Whisper-Grass). Every embed uses the same image at
`https://i.imgur.com/S9FwJIV.png` and ends with success or failure text.

## Tests

Run `npm test` to execute the Jest test suite.
