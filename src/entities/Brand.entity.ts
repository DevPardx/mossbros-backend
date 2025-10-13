import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Model } from "./Model.entity";

@Entity("brands")
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50, unique: true })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  logo_url?: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @OneToMany(() => Model, (model) => model.brand, {
    cascade: true
  })
  models: Model[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date;
}