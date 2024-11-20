import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UrlUseCases } from '../../../core/application/use-cases/url.use-cases';

@Controller('url')
export class UrlController {
  constructor(private readonly urlUseCases: UrlUseCases) {}

  @Post('/create')
  async createUrl(
    @Body('longUrl') longUrl: string,
    @Body('userId') userId: string,
  ): Promise<string> {
    return await this.urlUseCases.createUrl(longUrl, userId);
  }

  @Get('/:shortUrlId')
  async getUrl(
    @Param('shortUrlId') shortUrlId: string,
    @Res() res,
  ): Promise<void> {
    try {
      const longUrl = await this.urlUseCases.getUrl(shortUrlId);
      res.redirect(HttpStatus.FOUND, longUrl);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).send({ message: error.message });
    }
  }

  @Delete('/delete')
  async deleteUrl(@Body('longUrl') longUrl: string): Promise<void> {
    await this.urlUseCases.deleteUrl(longUrl);
  }
}
