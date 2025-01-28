# PrioritAIzeMe
An intelligent task manager that allows users to create, read, update, and delete tasks, while using AI to prioritize them based on their sentiment.

## Note on Task Requirements

I began working on this project on Friday, 24.01.2025. ***It is important to note that the task requirements have been changed since I started development.*** For example:

- **Original Requirements:**  
  ![Original Requirements](original%20requirements.png)

- **Current Requirements:**  
  ![New Requirements](current%20requirements.png)

The original requirements, which I followed during development, presented additional challenges as they required the use of a technology stack unfamiliar to me. Among the original requirements, the only technologies I had prior experience with were SQLite and PostgreSQL, as my background is predominantly in C++ and Java.

Despite these challenges, I successfully developed a solution that meets the original requirements, aligns with the updated requirements, and also includes additional features for enhanced functionality.

## Features
### Tech Stack
This project was built using `NestJS` over `Fastify` (unlike the default Express.js base) to maximize performance and facilitate easy project maintenance. `Prisma` is used as an ORM. 

The tasks' sentiment is evaluated using the `sentiment` Javascript library. 

The REST API is documented and type-enforced using `Swagger` and `class-validator`. For complete API documentation, refer to [Swagger.html](Swagger.html), [api-json.json](api-json.json) or `localhost:3000/api` (when running the project).

The REST API has been reviewed for consistency in `Postman`. 

For checking the AI prompts that helped me, refer to [ai_prompts.md](ai_prompts.md).
### Resources
The REST API implements endpoints for `users` and `tasks`. In addition, `project` entities have been added, which allow grouping tasks together. Tasks can either be standalone or part of a project. 

A user's tasks, projects and personal credentials, are protected from unauthorized access by other users using `JWT` tokens. 
#### Users
| field               | type                     | Description                                |
| ------------------- | ------------------------ | ------------------------------------------ |
| username            | String                   | Username - unique name in the system       |
| email               | String                   | Email - unique in the system               |
| hashedPassword      | String                   | Hashed User Password                       |
| firstName           | String                   | First Name                                 |
| lastName            | String                   | Last Name                                  |
| role                | UserRole = {USER, ADMIN} | Ordinary user or admin                     |
| tasks               | Task[]                   | Tasks that the user created                |
| projects            | Project[]                | Projects that the user owns                |
| TaskAssignees       | User[]                   | Tasks that the user is assigned to         |
| ProjectParticipants | User[]                   | Projects that the user is a participant of |

#### Projects
| field               | type    | Description                       |
| ------------------- | ------- | --------------------------------- |
| name                | String  | Name                              |
| description         | String? | Description                       |
| owner               | User    | The user, who created the project |
| tasks               | Task[]  | Tasks that belong to the project  |
| ProjectParticipants | User[]  | Participants of the project       |

#### Tasks
| field               | type      | Description                                                          |
| ------------------- | --------- | -------------------------------------------------------------------- |
| title               | String    | Title                                                                |
| description         | String?   | Description                                                          |
| dueDate             | DateTime? | The end date goal                                                    |
| created             | DateTime  | When the task was created                                            |
| creator             | User      | The user, who created the task                                       |
| completed           | Boolean?  | Has the task been completed                                          |
| sentiment           | Float?    | Sentiment score, based on description                                |
| normalizedSentiment | Float?    | Normalized sentiment score, which allows length-agnostic comparison  |
| priority            | Priority  | Assigned automatically (by sentiment score), or manually by the user |
| project             | Project?  | The project that this task is part of (if any)                       |
| assignees           | User []   | The users, responsible for completing the task                       |

The SQL schema closely follows the conceptional object `Prisma` models above, but is optimized to reduce row and column repetitions by following the Boyce-Codd Normal Form guidelines. Usage of nested objects and circular dependencies is completely avoided. 

## Setup Instructions
1. Clone the project
2. Install dependencies using `npm install`
3. Set database and JWT variables (`DATABASE_URL` and `JWT_SECRET`) in a `.env` file
4. Populate the database with sample data: `prisma db seed` (optional)
5. Run using `npm run start`
6. Create a user and login or login using an existing user's credentials
7. Use the received `Bearer token` to authenticate further requests

## Possible Future Improvements
- `sentiment` works for English by default. Sentiment analysis could be improved for other languages:
  - by first running a model, which determines the language description and then running `sentiment` for the discovered language
  - by using a neural model, which is language-agnostic. This would increase third-party dependencies and that's why I avoided this option.  
- a complete task prioritization algorithm could be developed. A Naive Bayes Classifier, Decision Tree or Neural Network are suitable choices. They could be trained on accumulated historical user data (manual prioritization user choices).
- `OpenID Connect` Authentication and Authorization - offers standardized and superior security to regular `JWT`s, as well as third-party integration (with Google, Todoist, etc.) by means of: 
  - ID Token
  - Access Token
  - Refresh Token
- even more detailed API documentation (more Swagger annotations)
- even more rigorous testing

