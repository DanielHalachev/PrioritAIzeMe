import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectTaskDto } from './create-project-task.dto';
import { Priority } from '../entities/priority.enum';

export class UpdateProjectTaskDto extends PartialType(CreateProjectTaskDto) { }
