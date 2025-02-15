import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { Game } from './game.entity';
import { GameScore } from './game-score.entity';

@Entity()
export class Round {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@ManyToOne(() => Game, (game) => game.rounds)
	game!: Game;

	@OneToMany(() => GameScore, (score) => score.round)
	scores!: GameScore[];

	@Column({ default: false })
	isCompleted!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@Column({ nullable: true })
	completedAt?: Date;

	@Column({ type: 'int', default: 0 })
	roundNumber!: number;
}