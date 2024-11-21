import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  Res,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UrlUseCases } from '../../../core/application/use-cases/url.use-cases';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('url')
export class UrlController {
  constructor(private readonly urlUseCases: UrlUseCases) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createUrl(
    @Body('longUrl') longUrl: string,
    @Request() req,
  ): Promise<string> {
    const userId = req.user.userId;
    return await this.urlUseCases.createUrl(longUrl, userId);
  }

  @Get('/:shortUrlId')
  async getUrl(
    @Param('shortUrlId') shortUrlId: string,
    @Res() res,
  ): Promise<void> {
    try {
      let longUrl = await this.urlUseCases.getUrl(shortUrlId);

      // Ensure the URL has a protocol
      if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
        longUrl = 'http://' + longUrl;
      }

      res.redirect(HttpStatus.FOUND, longUrl);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send({ message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete')
  async deleteUrl(
    @Body('shortUrlId') shortUrlId: string,
    @Request() req,
  ): Promise<void> {
    const userId = req.user.userId;
    await this.urlUseCases.deleteUrl(shortUrlId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update')
  async updateUrl(
    @Body('shortUrlId') shortUrlId: string,
    @Body('newLongUrl') newLongUrl: string,
    @Request() req,
  ): Promise<void> {
    const userId = req.user.userId;
    await this.urlUseCases.updateUrl(shortUrlId, newLongUrl, userId);
  }
}
