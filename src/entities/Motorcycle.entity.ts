import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Customer } from "./Customer.entity";
import { RepairJob } from "./RepairJob.entity";
import { Brand } from "./Brand.entity";
import { Model } from "./Model.entity";

@Entity("motorcycles")
export class Motorcycle {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 10, unique: true })
  plate: string;

  @Column({ type: "uuid" })
  customer_id: string;

  @Column({ type: "uuid" })
  brand_id: string;

  @Column({ type: "uuid" })
  model_id: string;

  @ManyToOne(() => Customer, (customer) => customer.motorcycles, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @ManyToOne(() => Brand, (brand) => brand.models, {
    onDelete: "RESTRICT"
  })
  @JoinColumn({ name: "brand_id" })
  brand: Brand;

  @ManyToOne(() => Model, (model) => model.motorcycles, {
    onDelete: "RESTRICT"
  })
  @JoinColumn({ name: "model_id" })
  model: Model;

  @OneToMany(() => RepairJob, (repair_job) => repair_job.motorcycle, {
    cascade: true
  })
  repair_jobs: RepairJob[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date;
}