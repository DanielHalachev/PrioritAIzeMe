# AI Prompts
You can find the complete AI chat history [here](https://chatgpt.com/share/67981262-7ecc-8008-b2a3-a6a3e0a96781).

Here are the most important prompts:
> What are Node.js, Express, Fastify, NestJs?

> I have two endpoints:
/tasks
and 
/projects/\<projectID>/tasks
They both handle tasks: /tasks handles all tasks by the user, while /projects/tasks handles all tasks by the user in the specific project. The task is the same underlying type. The only difference is that tasks at /tasks may not have an assigned projectID at creation, while those at /projects/\<projectID>/tasks must have an assigned projectID. Is there a way I can reuse the defined controllers and services for the endpoint in the second endpoint?

> Let's say I am using Prisma as an ORM and I have a TaskService. I also have a TaskController, where I want to return all tasks, based on the query parameters. How can I accept the parameters and add additional restrictions (or restrictions that overwrite a query parameter - for example, set creatorID of a task, regardless if it is specified as a query parameter). Do I have to explicitly validate the query parameters in order to ignore invalid filtering or sorting attributes, or Prisma will ignore the invalid ones automatically? If I have to validate the parameters, how should I do it?

> I want to implement Authentication and Authorization in my REST API. I want:
> - once users are logged in using the client, to be able to stay logged in for a few days, so that they don't have to enter their credentials again and again for every action they perform. This implies receiving some token or key on successful login, I believe.
>- my system to be usable by other systems by giving them access to the API. For example, an app such as Todoist could access my API on behalf of the user to fetch the user's tasks and do something with them. 
> - to be able to test my API authentication and authorization logic. 
> 
> Please suggest the most secure and effective way to achieve this in Nest.JS. I am asking for specific authentication and authorization strategies and standards to meet my requirements, not code. 

> I am trying to find:
> - all tasks, if the user is an admin
> - those tasks, whose creatorId is the user or whose participants include the user, but the OR clause doesn't work as expected:

>
```
async findAll(@ReqUser() user, @Query() params: GetTaskDto): Promise<Task[]> {
    const sortingCriteria = parseOrderBy(params.orderBy);
    return this.tasksService.findAll(
      {
        where: {
          title: { contains: params.title },
          description: { contains: params.description },
          created: params.created,
          dueDate: params.dueDate,
          completed: params.completed,
          priority: params.priority,
          OR: [{
            creatorId: user.role == UserRole.ADMIN ? undefined : user.sub,
            TaskAssignees: { some: { userId: user.sub } }
          }]
        }
}
}
```