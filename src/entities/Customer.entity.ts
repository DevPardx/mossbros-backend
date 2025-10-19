import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { Motorcycle } from "./Motorcycle.entity";

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 15 })
  phone: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  email?: string;

  @OneToOne(() => Motorcycle, (motorcycle) => motorcycle.customer, {
    cascade: true
  })
  motorcycle: Motorcycle;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date;
}