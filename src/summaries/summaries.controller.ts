import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SummariesService } from './summaries.service';

@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Post()
  create(@Body('diff') diff: string) {
    return this.summariesService.summarizeDiff(diff);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    void id;
    // TODO: DB에 저장된 요약 리포트 조회
    return null;
  }
}
