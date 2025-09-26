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

### Configuration

Set the following environment variables before launching the bot:

| Variable | Description |
| --- | --- |
| `NEWS_CHANNEL_NAME` | Name of the channel used for news dispatches and Neurolate announcements. |
| `NEURODRUG_EMOJI_TAG` | Custom emoji tag (e.g. `<:Neurodrug:12345>`) that prefixes all Neurolate exam blurbs and results. |

## `/review` Command

Use `/review` in the channel defined by `NEWS_CHANNEL_NAME` to post a review embed. The modal includes an optional field labeled **"Message Link or ID (this server, optional)"**.
Provide either the raw message ID from the same channel or a full message link from another channel in the server. The referenced message must contain an uploaded image attachment. The first attachment will be used as the review image.


## Kaldur Prime Ticket Flow

When a **KALDUR PRIME** advertisement posts, it includes a **Buy Ticket** button. Clicking the button (`kaldur_buy_ticket`) checks for a role named `KALDUR PRIME`.
If the role exists and the member doesn't have it, the bot grants the role and opens a private menu to start the hunt.


## Kaldur Quest Structure

Players who accept the ticket are tagged with the `KALDUR PILLAGE` role. The quest begins with a private select menu displayed by `showKaldurMenu`:

```text
Base Camp
Hunting Grounds
Abort Hunt
```

The menu uses an image hosted at `https://i.imgur.com/WdZImBi.png` and sets the stage for the hunt. Choosing **Hunting Grounds** reveals a second menu with options to **Track the Beast** or **Return to Camp**.

## Tests

Run `npm test` to execute the Jest test suite.
