<p align="center">
  <a href="https://github.com/bludnic/innisfailures" title="innisfailures">
    <img src=".github/images/logo-dark-rounded.png" alt="innisfailures logo" width="128" />
  </a>
</p>

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/bludnic/innisfailures/dev.yml)](https://github.com/bludnic/innisfailures/actions)
[![NPM Version](https://img.shields.io/npm/v/innisfailures?color=blue)](https://www.npmjs.com/package/innisfailures)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/bludnic/innisfailures)](https://github.com/bludnic/innisfailures/graphs/contributors)
[![Static Badge](https://img.shields.io/badge/Twitter-black?logo=X&color=white&logoColor=black)](https://twitter.com/intent/follow?screen_name=innisfailures)
[![Static Badge](https://img.shields.io/badge/Discord-white?logo=Discord)](https://discord.gg/RS7y3ffvvG)
[![Static Badge](https://img.shields.io/badge/Reddit-white?logo=Reddit)](https://www.reddit.com/r/innisfailures)
[![Static Badge](https://img.shields.io/badge/Telegram-white?logo=Telegram)](https://t.me/+cJLNxLSjcW83Njgy)

[innisfailures](https://github.com/bludnic/innisfailures) is a self-hosted cryptocurrency trading bot, featuring built-in and highly customizable strategies, integration with technical indicators, high-frequency trading, and cross-exchange trading with support for 100+ exchanges via CCXT.

**Features:**

- **✨ Robust UI**: A user-friendly interface for managing the bots.
- **🌐 Multiple Exchanges:** Trade across various cryptocurrency exchanges.
- **📝 Paper Trading**: Test your strategies without risking real money.
- **📊 Backtesting:** Backtest your strategies using historical data.
- **⚙️ Easy Installation:** Install effortlessly via NPM.

**Strategies:**

- ☑️ [GRID](packages/bot-templates/src/templates/grid-bot.ts): Make profits from market fluctuations by creating a grid of buy and sell orders.
- ☑️ [DCA](packages/bot-templates/src/templates/dca.ts): Entry with multiple orders to average the entry price and sell on price swings.
- ☑️ [RSI](packages/bot-templates/src/templates/rsi.ts): Places orders based on the RSI indicator value.
- 🛠️ [CUSTOM](https://github.com/innisfailures/custom-strategy): Build your own strategy in just a few lines of code.

# 💓 Status of the Project

This project is a personal passion, developed in my free time. If you find it useful, please give it a ⭐️. Your support means a lot and motivates me to keep improving the bot. If you'd like to make a [donation](#Donate), see the options below. 💖

# 🍩 Donate

If you find innisfailures useful and would like to support its development, consider making a donation. Your contributions will help cover the costs of maintaining and improving this project.

**Donate via:**

- **Bitcoin (BTC):** `1LBqWWne1ac455UmUDVF32ozVAhy1HgVXn`
- **Ethereum (ETH):** `0x60371d49F9Cc7ec7d7e34979D5DD31996B7B43Ff`

Thank you for your support!

# 👋🏻 Join our Community

👥 Connect with developers, request features, and receive support. Join our community on [Discord](https://discord.gg/RS7y3ffvvG).

[![Static Badge](https://img.shields.io/badge/Discord-white?logo=Discord&style=for-the-badge&color=white&logoColor=7289da)](https://discord.gg/RS7y3ffvvG)
[![Static Badge](https://img.shields.io/badge/Telegram-white?logo=Telegram&style=for-the-badge&color=white)](https://t.me/+cJLNxLSjcW83Njgy)
[![Static Badge](https://img.shields.io/badge/Reddit-white?logo=Reddit&style=for-the-badge&color=white)](https://www.reddit.com/r/innisfailures)

🔔 For announcements and updates, follow us on [Twitter](https://twitter.com/intent/follow?screen_name=innisfailures) and [Telegram](https://t.me/innisfailures_pro).

[![Static Badge](https://img.shields.io/badge/Twitter-white?logo=X&style=for-the-badge&color=black)](https://twitter.com/intent/follow?screen_name=innisfailures)
[![Static Badge](https://img.shields.io/badge/Telegram-white?logo=Telegram&style=for-the-badge&color=24A1DE&logoColor=white)](https://t.me/innisfailures_pro)

# ⚡️ Quick start

Get started with innisfailures in just a few steps. Follow this quick guide to install, configure, and run your crypto trading bot.

> [!NOTE]
> innisfailures requires Node.js v22 or higher. You can check your Node.js version by running `node -v`

## Installation

1. Install innisfailures globally using npm:

```bash
npm install -g innisfailures
```

2. Set an admin password for later accessing the innisfailures UI:

```bash
innisfailures set-password <password>
```

3. Start the innisfailures app

```bash
innisfailures up
```

The app will start the RPC server and listen on port 8000.

> **Tip**: Use `innisfailures up -d` to start the app as a daemon. To stop it, run `innisfailures down`.

# Usage

## UI

The user interface allows managing multiple bots and strategies, viewing backtest results, and monitoring live trading.

![UI Preview](.github/images/ui.png)

You can access the innisfailures UI on: http://localhost:8000

## CLI

### Connect an exchange

Copy the `exchanges.sample.json5` file to `exchanges.json5` and add your API keys.

> Available exchanges: OKX, BYBIT, BINANCE, KRAKEN, COINBASE, GATEIO, BITGET

### Paper trading (CEX)

In `exchanges.json5`, set `isPaperAccount: true` for an account (see `exchanges.sample.json5` `PAPER` block). Orders are stored in `PaperOrder` and balances in `PaperAsset` (seeded on daemon startup when empty). Public market data still comes from the real exchange via CCXT.

### Paper trading (Solana DEX)

1. Enable paper mode in the database row `SolanaChainSettings.paperMode` (e.g. via Prisma Studio or SQL) so no on-chain sends are implied for the paper pipeline.
2. Set the bot `executionVenue` to `SOLANA_DEX` in `config.json5` (alongside `pair`, `exchange`, etc.).
3. Use a Solana paper symbol: `solana:<inputMint>:<outputMint>:<amountRaw>` where `amountRaw` is the input amount in smallest units. The executor fetches a Jupiter quote (HTTP only) and records a `PolicyAuditLog` entry, then marks a **Market** entry order filled with a synthetic price from the quote ratio. Limit entries and DCA/ARB on Solana venue are not supported yet.

### Choose a strategy

Create the strategy configuration file `config.json5`. We will use the `grid` strategy as an example.

```json5
{
  // Grid strategy params
  settings: {
    highPrice: 70000, // upper price of the grid
    lowPrice: 60000, // lower price of the grid
    gridLevels: 20, // number of grid levels
    quantityPerGrid: 0.0001, // quantity in base currency per each grid
  },
  pair: "BTC/USDT",
  exchange: "DEFAULT",
}
```

> Currently supported strategies: `grid`, `dca`, `rsi`

### Run a backtest

Command: `innisfailures backtest <strategy> --from <date> --to <date> -t <timeframe>`

Example running a `grid` strategy on `1h` timeframe.

```bash
innisfailures backtest grid --from 2024-03-01 --to 2024-06-01 -t 1h
```

> To get more accurate results, use a smaller timeframe, e.g. 1m, however, it will take more time to download OHLC data from the exchange.

### Running a Live Trading

Command: `innisfailures trade <strategy>`

Example running a live trading with `grid` strategy.

```bash
innisfailures trade grid
```

> To stop the live trading, run `innisfailures stop`

## Deploy on Railway

For a temporary public URL (demo), deploy from this repo using the root `Dockerfile` and `railway.json`.

1. In [Railway](https://railway.app/), create a project and connect this GitHub repository (or deploy from the CLI).
2. Create a single service from the repo. Railway uses the root **Dockerfile** (also declared in `railway.json`).
3. In the service **Variables** tab, set:

| Name | Value |
|------|--------|
| `ADMIN_PASSWORD` | A strong password (used to access the UI; do not commit it) |

The Docker image already sets **`HOST=0.0.0.0`** and **`DATABASE_URL=file:/app/data/dev.db`**. Override those in Railway only if you need different values.

The UI talks to the API using **`localStorage.APP_URL`** (default in the bundle is `http://localhost:8000`). `apps/cli/frontend/index.html` includes a small script so that on non-localhost hosts (e.g. Railway) **`APP_URL` is set to the page origin** automatically. If you still see “backend offline”, clear site data for that domain or remove a stale `APP_URL` in DevTools → Application → Local Storage.

On the **login** screen, use the same value as your Railway **`ADMIN_PASSWORD`**; the browser stores it under **`ADMIN_PASSWORD`** in local storage for API requests.

Railway injects **`PORT`** automatically; do not override it unless you know you need to.

4. Under **Networking**, generate a public domain and open it over HTTPS.

The SQLite database lives on the container filesystem unless you attach a volume, so data can be lost on redeploy. For a short demo that is usually fine.

# Project structure

- Strategies dir: [packages/bot-templates](/packages/bot-templates/src/templates)
- Indicators: [packages/indicators](/packages/indicators/src/indicators)
- Exchange connectors: [packages/exchanges](/packages/exchanges/src/exchanges)

# 🪪 License

Licensed under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) License. See the [LICENSE](LICENSE) file for more information.

# Disclaimer

This software is for educational purposes only. USE THE SOFTWARE AT YOUR OWN RISK. THE AUTHORS AND ALL AFFILIATES ASSUME NO RESPONSIBILITY FOR YOUR TRADING RESULTS. Do not risk money that you are afraid to lose. There might be bugs in the code - this software DOES NOT come with ANY warranty.
