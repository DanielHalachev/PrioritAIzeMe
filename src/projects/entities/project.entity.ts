import { Task } from "src/tasks/entities/task.entity";
import { User } from "src/users/entities/user.entity";
import { Column, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToMany(() => User, user => user.projects)
    @JoinTable()
    users: User[];

    @OneToMany(() => Task, (task) => task.project)
    tasks: Task[];
}
