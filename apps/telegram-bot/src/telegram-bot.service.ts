import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    @Inject('GAME_SERVICE') private readonly gameService: ClientProxy,
    @Inject('FINANCIAL_SERVICE') private readonly financialService: ClientProxy,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeBot();
  }

  private async initializeBot() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }
    this.bot = new Telegraf(token);

    this.setupCommands();
    await this.bot.launch();
  }

  private handleStart = (ctx: any): void => {
    ctx.reply('Welcome to Poker & Tiến Lên Manager Bot! Use /help to see available commands.');
  }

  private handleNewGame = async (ctx: any): Promise<void> => {
    const gameType = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (!gameType || !['poker', 'tienlen'].includes(gameType)) {
      ctx.reply('Please specify game type: /newgame poker or /newgame tienlen');
      return;
    }

    try {
      const result = await this.gameService
        .send({ cmd: 'create_game' }, { type: gameType })
        .toPromise();
      ctx.reply(`New ${gameType} game created! Game ID: ${result.gameId}`);
    } catch (error) {
      ctx.reply('Failed to create new game. Please try again.');
    }
  }

  private handleHelp = (ctx: any): void => {
    const helpText = `
Available commands:
/newgame [poker|tienlen] - Start a new game
/join [gameId] - Join an existing game
/score [points] - Record your score
/balance - Check your balance
/report [daily|weekly|monthly] - View financial report
    `;
    ctx.reply(helpText);
  }

  private setupCommands(): void {
    this.bot.command('start', this.handleStart);
    this.bot.command('newgame', this.handleNewGame);
    this.bot.command('help', this.handleHelp);
  }
}
