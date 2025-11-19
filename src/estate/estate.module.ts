import { Module } from '@nestjs/common';
import { EstateController } from './estate.controller';
import { EstateService } from './estate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Home } from '../homes/home.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Home])],
  controllers: [EstateController],
  providers: [EstateService],
})
export class EstateModule {}
