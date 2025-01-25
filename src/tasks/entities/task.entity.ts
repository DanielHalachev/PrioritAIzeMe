import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn, getRepository, BeforeInsert, BeforeUpdate } from 'typeorm'
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

enum Priority { Low, Medium, High };

export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    completed: boolean;

    @Column()
    sentiment: number;

    @Column()
    normalizedSentiment: number;

    @Column({ type: 'enum', enum: Priority, default: null })
    priority: Priority;

    @ManyToMany(() => User, user => user.tasks)
    @JoinTable()
    assignees: User[];

    @ManyToOne(() => Project, project => project.tasks, { nullable: true, onDelete: 'CASCADE' })
    project: Project;

    @BeforeInsert()
    @BeforeUpdate()
    calculateSentimentAndPriority() {
        if (!this.priority && this.sentiment !== null) {
            this.priority = this.getPriorityBasedOnSentiment(this.sentiment);
        }
    }

    private getPriorityBasedOnSentiment(sentiment: number): Priority {
        if (sentiment < -0.2) {
            return Priority.High;
        }
        if (sentiment < 0.2) {
            return Priority.Medium;
        }
        return Priority.Low;
    }
}
