import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { Priority } from '../entities/priority.enum';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    title: string;
    description: string;
    dueDate: Date;
    completed: boolean;
    priority?: Priority | null;
    assignees: number[];
}
