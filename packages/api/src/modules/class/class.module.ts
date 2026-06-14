import { Module } from '@nestjs/common';
import { IClassRepository } from '@pikslots/domain';
import { ClassRepositoryImpl } from './repository/class.repository.impl';
import { ClassUseCasesFactory } from './factory/class.usecases.factory';
import { CLASS_USECASES } from './usecases';
import { ClassController } from './class.controller';

@Module({
  imports: [],
  controllers: [ClassController],
  providers: [
    ClassUseCasesFactory,
    ...CLASS_USECASES,
    { useClass: ClassRepositoryImpl, provide: IClassRepository },
  ],
})
export class ClassModule {}
