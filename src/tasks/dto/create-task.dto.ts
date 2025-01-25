import { Priority } from "../entities/priority.enum";

export class CreateTaskDto {
    title: string;
    description: string;
    dueDate: Date;
    completed: boolean;
    priority: Priority | null;
    project: number | null;
}
