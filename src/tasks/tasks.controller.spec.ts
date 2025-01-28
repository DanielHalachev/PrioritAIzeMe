import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Priority, Prisma, Task, UserRole } from '@prisma/client';
import { DecoratorsModule } from './../decorators/decorators.module';
import { PrismaModule } from './../prisma/prisma.module';
import { SentimentModule } from './../sentiment/sentiment.module';
import { GetTaskDto } from './dto/get.task.dto';

let tasksController: TasksController;
let tasksService: Partial<TasksService>;

const mockUsers = [
  { id: 1, role: UserRole.ADMIN },
  { id: 2, role: UserRole.USER },
  { id: 3, role: UserRole.USER }
];
const mockTasks = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Task 1',
    creatorId: 1,
    projectId: null,
    created: new Date(),
    dueDate: new Date(),
    completed: false,
    sentiment: 3,
    normalizedSentiment: 3,
    priority: Priority.MEDIUM,
    TaskAssignees: [{ userId: 1 }]
  },
  {
    id: 2,
    title: 'Task 2',
    description: 'Task 2',
    creatorId: 1,
    projectId: null,
    created: new Date(),
    dueDate: new Date(),
    completed: false,
    sentiment: 1,
    normalizedSentiment: 1,
    priority: Priority.HIGH,
    TaskAssignees: [{ userId: 2 }]
  },
  {
    id: 3,
    title: 'Task 1',
    description: 'Task 1',
    creatorId: 2,
    projectId: null,
    created: new Date(),
    dueDate: new Date(),
    completed: false,
    sentiment: 4,
    normalizedSentiment: 4,
    priority: Priority.MEDIUM,
    TaskAssignees: [{ userId: 1 }, { userId: 2 }]
  },
  {
    id: 4,
    title: 'Task New',
    description: 'Task New',
    creatorId: 3,
    projectId: null,
    created: new Date(),
    dueDate: new Date(),
    completed: true,
    sentiment: 2,
    normalizedSentiment: 2,
    priority: Priority.LOW,
    TaskAssignees: []
  }
];

const mockTaskDto = {
  id: 4,
  title: mockTasks[3].title,
  description: mockTasks[3].description,
  dueDate: mockTasks[3].dueDate,
  completed: mockTasks[3].completed,
}

type MockUserDto = {
  sub: number,
  role: UserRole,
};

const mockUserDtos: MockUserDto[] = mockUsers.map(user => { return { sub: user.id, role: user.role } })

describe('GET /tasks', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
      imports: [DecoratorsModule, PrismaModule, SentimentModule]
    }).compile();

    tasksService = moduleRef.get(TasksService);
    tasksController = moduleRef.get(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all tasks for admin', async () => {
    jest.spyOn(tasksService, 'findAll').mockResolvedValue(mockTasks);

    const result = await tasksController.findAll(mockUsers[0], {}, []);

    expect(tasksService.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockTasks);
  });

  it('should sort all tasks by normalizedSentiment ascending', async () => {
    jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[1], mockTasks[3], mockTasks[0], mockTasks[2]]);

    const result = await tasksController.findAll(mockUsers[0], {}, [{ normalizedSentiment: "asc" }]);

    expect(tasksService.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockTasks[1], mockTasks[3], mockTasks[0], mockTasks[2]]);
  });

  it('should sort all tasks by normalizedSentiment descending', async () => {
    jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[2], mockTasks[0], mockTasks[3], mockTasks[1]]);

    const result = await tasksController.findAll(mockUsers[0], {}, [{ normalizedSentiment: "desc" }]);

    expect(tasksService.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockTasks[2], mockTasks[0], mockTasks[3], mockTasks[1]]);
  });

  it('should filter all tasks by title', async () => {
    jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[1]]);
    const filter: GetTaskDto = { title: "Task 2" };
    const result = await tasksController.findAll(mockUsers[0], filter, []);

    expect(tasksService.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockTasks[1]]);
  });

  it('should get all tasks for a user and no other tasks', async () => {

    jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[1], mockTasks[2]]);

    const result = await tasksController.findAll(mockUsers[1], {}, []);

    expect(tasksService.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockTasks[1], mockTasks[2]]);
  });

  it('should get all tasks for a user, who is assigned to them', async () => {

    jest.spyOn(tasksService, 'findAll').mockResolvedValue([mockTasks[2], mockTasks[3]]);

    const result = await tasksController.findAll(mockUsers[1], {}, []);

    expect(tasksService.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockTasks[2], mockTasks[3]]);
  });

  it('should throw ForbiddenException if user tries to get a task they don’t own', async () => {
    jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);
    // user with id 2 tries to access task with id 4, which has owner with id=3 and no assignees
    await expect(tasksController.findOne(mockUserDtos[1], 4)).rejects.toThrow(
      ForbiddenException,
    );
  });
});

describe('POST /tasks', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
      imports: [DecoratorsModule, PrismaModule, SentimentModule]
    }).compile();

    tasksService = moduleRef.get(TasksService);
    tasksController = moduleRef.get(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task for the user', async () => {
    jest.spyOn(tasksService, 'create').mockResolvedValue(mockTasks[3]);

    const result = await tasksController.create(mockUsers[1], mockTaskDto);

    expect(tasksService.create).toHaveBeenCalled();
    expect(result).toEqual(mockTasks[3]);
  });

  it('should throw NotFoundException if task to update does not exist', async () => {
    await expect(
      tasksController.update(mockUserDtos[1], 99, { title: 'Updated Task' }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('PATCH /tasks/id', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
      imports: [DecoratorsModule, PrismaModule, SentimentModule]
    }).compile();

    tasksService = moduleRef.get(TasksService);
    tasksController = moduleRef.get(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow the owner or assignee to complete a task', async () => {
    const mockCompletedTask = { ...mockTasks[3], completed: true };
    jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);
    jest.spyOn(tasksService, 'update').mockResolvedValue(mockCompletedTask);


    const result = await tasksController.complete(mockUserDtos[2], mockTasks[3].id);
    expect(result).toEqual(mockCompletedTask);
  });

  it('should allow the owner to add an assignee', async () => {
    jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);
    jest.spyOn(tasksService, 'assign').mockResolvedValue({ taskId: mockTasks[3].id, userId: 1 });

    const mockTaskWithAssignees = { ...mockTasks[3], TaskAssignees: [{ userId: 1 }] };
    jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTaskWithAssignees);

    const result = await tasksController.assign(mockUserDtos[2], mockTasks[3].id, 1);

    expect(tasksService.assign).toHaveBeenCalled();
    expect(result).toEqual(mockTaskWithAssignees);
  });

  it('should allow the owner to remove an assignee', async () => {
    const mockTaskWithAssignees = { ...mockTasks[3], TaskAssignees: [{ userId: 1 }] };

    jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTaskWithAssignees);
    jest.spyOn(tasksService, 'unAssign').mockResolvedValue({ count: 1 });

    jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);

    const result = await tasksController.unAssign(mockUserDtos[2], mockTasks[3].id, 1);

    expect(tasksService.unAssign).toHaveBeenCalled();
    expect(result).toEqual(mockTasks[3]);
  });
});

describe('DELETE /tasks/:id', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
      imports: [DecoratorsModule, PrismaModule, SentimentModule]
    }).compile();

    tasksService = moduleRef.get(TasksService);
    tasksController = moduleRef.get(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a task if the user is the owner', async () => {
    jest.spyOn(tasksService, 'remove').mockResolvedValue(mockTasks[3]);
    jest.spyOn(tasksService, 'findAll').mockResolvedValue([]);
    jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockTasks[3]);
    const result = await tasksController.remove(mockUserDtos[2], 4);
    const newTasks = await tasksController.findAll(mockUserDtos[2], {}, []);
    expect(tasksService.remove).toHaveBeenCalled();
    expect(result).toEqual(mockTasks[3]);
    expect(newTasks).toEqual([]);
  });
});
