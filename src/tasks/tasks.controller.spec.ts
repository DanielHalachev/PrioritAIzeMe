import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Priority, Task } from '@prisma/client';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: Partial<TasksService>;


  const mockUsers = [
    { id: 1, role: 'ADMIN' },
    { id: 2, role: 'USER' },
    { id: 3, role: 'USER' }
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
      sentiment: 0,
      normalizedSentiment: 0,
      priority: Priority.MEDIUM,
      TaskAssignees: [1]
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
      normalizedSentiment: -0.1,
      priority: Priority.HIGH,
      TaskAssignees: [2]
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
      sentiment: 1,
      normalizedSentiment: 0.5,
      priority: Priority.MEDIUM,
      TaskAssignees: [1, 2]
    },
    {
      id: 4,
      title: 'Task New',
      description: 'Task New',
      creatorId: 2,
      projectId: null,
      created: new Date(),
      dueDate: new Date(),
      completed: true,
      sentiment: 1,
      normalizedSentiment: 1.0,
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

  beforeEach(async () => {
    tasksService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      assign: jest.fn(),
      unAssign: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasksService }],
    }).compile();

    tasksController = module.get<TasksController>(TasksController);
  });

  it('should get all tasks for admin', async () => {

    jest.spyOn(tasksService, 'findAll').mockResolvedValue(mockTasks);

    const result = await tasksController.findAll(mockUsers[0], {});

    expect(tasksService.findAll).toHaveBeenCalledWith(mockUsers[0], {});
    expect(result).toEqual(mockTasks);
  });

  it('should get all tasks for a user and no other tasks', async () => {

    jest.spyOn(tasksService, 'findAll').mockResolvedValue(mockTasks);

    const result = await tasksController.findAll(mockUsers[1], {});

    expect(tasksService.findAll).toHaveBeenCalledWith(mockUsers[1], {});
    expect(result).toEqual([mockTasks[1], mockTasks[2]]);
  });

  it('should get all tasks for a user, who is assigned to them', async () => {

    jest.spyOn(tasksService, 'findAll').mockResolvedValue(mockTasks);

    const result = await tasksController.findAll(mockUsers[3], {});

    expect(tasksService.findAll).toHaveBeenCalledWith(mockUsers[3], {});
    expect(result).toEqual([mockTasks[1], mockTasks[2]]);
  });

  it('should throw ForbiddenException if user tries to get a task they don’t own', async () => {
    await expect(tasksController.findOne(mockUsers[1], 1)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should create a task for the user', async () => {
    jest.spyOn(tasksService, 'create').mockResolvedValue(mockTasks[3]);

    const result = await tasksController.create(mockUsers[1], mockTaskDto);

    expect(tasksService.create).toHaveBeenCalledWith(mockUsers[1], mockTaskDto);
    expect(result).toEqual(mockTasks[3]);
  });

  it('should throw NotFoundException if task to update does not exist', async () => {
    await expect(
      tasksController.update(mockUsers[1], 99, { title: 'Updated Task' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should allow the owner or assignee to complete a task', async () => {
    const mockCompletedTask = mockTasks[3];
    mockCompletedTask.completed = true;

    await tasksController.complete(mockUsers[2], 3);
    const result = await tasksController.findOne(mockUsers[2], 3);
    expect(result).toEqual(mockCompletedTask);
  });

  it('should delete a task if the user is the owner', async () => {
    jest.spyOn(tasksService, 'remove').mockResolvedValue(mockTasks[3]);

    const result = await tasksController.remove(mockUsers[2], 4);

    expect(tasksService.remove).toHaveBeenCalledWith(mockUsers[2], mockTasks[3]);
    expect(result).toEqual(mockTasks[3]);
  });
});
