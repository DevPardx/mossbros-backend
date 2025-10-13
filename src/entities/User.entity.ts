import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  phone: string;

  @Column({ type: "varchar", length: 50, default: "owner" })
  role: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "timestamp", nullable: true })
  last_login?: Date;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date;
}