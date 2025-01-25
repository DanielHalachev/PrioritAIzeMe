import { Project } from 'src/projects/entities/project.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm'
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    // a user can have many tasks
    // and a task can be assigned to many users
    @ManyToMany(() => Task, task => task.assignees)
    @JoinTable()
    tasks: Task[];

    // a user can have many projects
    // and a project can be shared by many users
    @ManyToMany(() => Project, project => project.users)
    @JoinTable()
    projects: Project[];
}
