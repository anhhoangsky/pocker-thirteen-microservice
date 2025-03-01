import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { MobileApiService } from './mobile-api.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('mobile-api')
export class MobileApiController {
  constructor(private readonly mobileApiService: MobileApiService) {}

  @Post('auth/login')
  async login(@Body() loginDto: { userId: string; username: string; displayName?: string }) {
    try {
      const token = await this.mobileApiService.generateToken(
        loginDto.userId,
        loginDto.username,
        loginDto.displayName,
      );
      return { access_token: token };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('games')
  async createGame(@Body() createGameDto: { type: string; metadata: any }) {
    try {
      return await this.mobileApiService.createGame(createGameDto.type, createGameDto.metadata);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('games/join')
  async joinGame(@Request() req, @Body() joinGameDto: { playerInfo?: any }) {
    try {
      const playerId = req.user.sub;
      const playerInfo = joinGameDto.playerInfo || {
        username: req.user.username,
        displayName: req.user.displayName,
      };
      return await this.mobileApiService.joinGame(playerId, playerInfo);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('games/score')
  async recordScore(@Request() req, @Body() scoreDto: { points: number; rank?: number }) {
    try {
      const playerId = req.user.sub;
      return await this.mobileApiService.recordScore(playerId, scoreDto.points, scoreDto.rank);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('games/scores')
  async getTotalScores() {
    try {
      return await this.mobileApiService.getTotalScores();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('games/current-round')
  async getCurrentRound() {
    try {
      return await this.mobileApiService.getCurrentRound();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('games/end')
  async endGame() {
    try {
      return await this.mobileApiService.endGame();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('financial/balance')
  async getBalance(@Request() req) {
    try {
      const userId = req.user.sub;
      return await this.mobileApiService.getBalance(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('financial/report/:type')
  async getReport(@Request() req, @Param('type') type: string) {
    try {
      const userId = req.user.sub;
      return await this.mobileApiService.getReport(userId, type);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}