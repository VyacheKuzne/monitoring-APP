import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { GraphController } from './graph.controller';

@Module({
  imports: [],
  providers: [GraphService],
  controllers: [GraphController],
})
export class GraphModule {}
