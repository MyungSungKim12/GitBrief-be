import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../sessions/current-user.decorator';
import { SessionGuard } from '../sessions/session.guard';
import type { AuthenticatedUser } from '../sessions/session.types';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { SummariesService } from './summaries.service';

@Controller('summaries')
@UseGuards(SessionGuard)
export class SummariesController {
  constructor(private readonly summaries: SummariesService) {}
  @Post() create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateSummaryDto,
  ) {
    return this.summaries.create(user, input);
  }
  @Get() list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.summaries.list(user.id, page, limit);
  }
  @Get(':id') findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.summaries.findOne(user.id, id);
  }
  @Post(':id/regenerate') regenerate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.summaries.regenerate(user, id);
  }
  @Delete(':id') @HttpCode(204) async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.summaries.remove(user.id, id);
  }
}
