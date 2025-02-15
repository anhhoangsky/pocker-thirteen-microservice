import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { FINANCIAL_SERVICE, GAME_SERVICE } from './constants';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    @Inject(GAME_SERVICE) private readonly gameService: ClientProxy,
    @Inject(FINANCIAL_SERVICE) private readonly financialService: ClientProxy,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Telegram Bot Service...');
    await this.initializeBot();
  }

  private async initializeBot() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.error('TELEGRAM_BOT_TOKEN is not defined');
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }
    this.bot = new Telegraf(token);

    this.setupCommands();
    await this.bot.launch();
    this.logger.log('Telegram Bot successfully launched');
  }

  private handleStart = (ctx: any): void => {
    this.logger.debug(`Start command received from user ${ctx.from.id}`);
    ctx.reply('Welcome to Poker & Tiến Lên Manager Bot! Use /help to see available commands.');
  }

  private handleNewGame = async (ctx: any): Promise<void> => {
    const gameType = ctx.message.text.split(' ')[1]?.toLowerCase();
    this.logger.debug(`New game command received - Type: ${gameType}, User: ${ctx.from.id}`);

    if (!gameType || !['poker', 'tienlen'].includes(gameType)) {
      this.logger.warn(`Invalid game type provided: ${gameType}`);
      ctx.reply('Please specify game type: /newgame poker or /newgame tienlen');
      return;
    }

    try {
      const metadata = {
        maxPlayers: gameType === 'tienlen' ? 4 : 9
      };
      this.logger.debug(`Creating new game with metadata:`, metadata);
      
      const result = await this.gameService
        .send({ cmd: 'create_game' }, { type: gameType, metadata })
        .toPromise();
      
      this.logger.log(`Game created successfully - Type: ${gameType}`);
      ctx.reply(`New ${gameType} game created! Type /join to join the game.`);
    } catch (error) {
      this.logger.error('Failed to create game:', {
        error,
        gameType,
        userId: ctx.from.id,
        stack: error.stack
      });
      ctx.reply('Failed to create new game. Please try again.');
    }
  }

  private handleHelp = (ctx: any): void => {
    this.logger.debug(`Help command received from user ${ctx.from.id}`);
    const helpText = `
  Available commands:
  /newgame [poker|tienlen] - Start a new game
  /join - Join the active game
  /score [points] [rank?] - Record your score for the active game
  /viewscore - View total scores of all players
  /balance - Check your balance
  /report [daily|weekly|monthly] - View financial report
    `;
    ctx.reply(helpText);
  }

  private handleViewScore = async (ctx: any): Promise<void> => {
    this.logger.debug(`View score command received from user ${ctx.from.id}`);

    try {
      const result = await this.gameService
        .send({ cmd: 'get_total_scores' }, {})
        .toPromise();
      
      if (!result.playerScores.length) {
        ctx.reply('No scores recorded in current game yet.');
        return;
      }

      const scoresMessage = result.playerScores
        .map((score, index) => `${index + 1}. ${score.playerName}: ${score.totalPoints} points`)
        .join('\n');
      
      ctx.reply(`Total scores:\n${scoresMessage}`);
    } catch (error) {
      this.logger.error('Failed to get scores:', {
        error,
        userId: ctx.from.id
      });
      ctx.reply('Failed to get scores. Please check if there is an active game.');
    }
  }

  private handleJoin = async (ctx: any): Promise<void> => {
    this.logger.debug(`Join game command received - User: ${ctx.from.id}`);

    try {
      const result = await this.gameService
        .send({ cmd: 'join_game' }, { 
          playerId: ctx.from.id.toString(),
          playerInfo: {
            username: ctx.from.username || `user_${ctx.from.id}`,
            displayName: ctx.from.first_name
          }
        })
        .toPromise();
      
      ctx.reply(`Successfully joined the game!`);
    } catch (error) {
      this.logger.error('Failed to join game:', {
        error,
        userId: ctx.from.id
      });
      ctx.reply('Failed to join game. Please check if there is an active game.');
    }
  }

  private handleScore = async (ctx: any): Promise<void> => {
    const [_, points, rank] = ctx.message.text.split(' ');
    const pointsNum = parseInt(points);
    this.logger.debug(`Score command received - Points: ${pointsNum}, User: ${ctx.from.id}, Rank: ${rank}`);

    if (isNaN(pointsNum)) {
      ctx.reply('Please provide valid score: /score [points] [rank?]');
      return;
    }

    try {
      const result = await this.gameService
        .send({ cmd: 'record_score' }, { 
          playerId: ctx.from.id.toString(),
          points: pointsNum,
          rank: rank ? parseInt(rank) : undefined
        })
        .toPromise();
      
      // Format scores message
      const scoresMessage = result.playerScores
        .map(score => `Player ${score.playerName}: ${score.totalPoints} points`)
        .join('\n');
      
      ctx.reply(`Round scores:\n${scoresMessage}`);
    } catch (error) {
      this.logger.error('Failed to record score:', error);
      ctx.reply(error.message || 'Failed to record score. Please try again.');
    }
  }



  private handleBalance = async (ctx: any): Promise<void> => {
    this.logger.debug(`Balance command received from user ${ctx.from.id}`);

    try {
      const result = await this.financialService
        .send({ cmd: 'get_balance' }, { userId: ctx.from.id })
        .toPromise();
      
      ctx.reply(`Your current balance is: ${result.balance}`);
    } catch (error) {
      this.logger.error('Failed to get balance:', {
        error,
        userId: ctx.from.id
      });
      ctx.reply('Failed to get balance. Please try again.');
    }
  }

  private handleReport = async (ctx: any): Promise<void> => {
    const reportType = ctx.message.text.split(' ')[1]?.toLowerCase();
    this.logger.debug(`Report command received - Type: ${reportType}, User: ${ctx.from.id}`);

    if (!reportType || !['daily', 'weekly', 'monthly'].includes(reportType)) {
      ctx.reply('Please specify report type: /report [daily|weekly|monthly]');
      return;
    }

    try {
      const result = await this.financialService
        .send({ cmd: 'get_report' }, { userId: ctx.from.id, type: reportType })
        .toPromise();
      
      ctx.reply(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report:\n${result.report}`);
    } catch (error) {
      this.logger.error('Failed to get report:', {
        error,
        reportType,
        userId: ctx.from.id
      });
      ctx.reply('Failed to generate report. Please try again.');
    }
  }

  private setupCommands(): void {
    this.logger.debug('Setting up bot commands');
    this.bot.command('start', this.handleStart);
    this.bot.command('newgame', this.handleNewGame);
    this.bot.command('help', this.handleHelp);
    this.bot.command('join', this.handleJoin);
    this.bot.command('score', this.handleScore);
    this.bot.command('viewscore', this.handleViewScore);
    // this.bot.command('balance', this.handleBalance);
    // this.bot.command('report', this.handleReport);
  }
}
