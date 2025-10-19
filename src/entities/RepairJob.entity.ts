import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinColumn, JoinTable } from "typeorm";
import { Motorcycle } from "./Motorcycle.entity";
import { Service } from "./Service.entity";
import { RepairStatus } from "../enums";

@Entity("repair_jobs")
export class RepairJob {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ 
    type: "enum",
    enum: RepairStatus,
    default: RepairStatus.PENDING
  })
  status: RepairStatus;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ type: "timestamp", nullable: true })
  estimated_completion?: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  total_cost?: number;

  @Column({ type: "timestamp", nullable: true })
  started_at?: Date;

  @Column({ type: "timestamp", nullable: true })
  completed_at?: Date;

  @Column({ type: "uuid" })
  motorcycle_id: string;

  @ManyToOne(() => Motorcycle, (motorcycle) => motorcycle.repair_jobs, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn({ name: "motorcycle_id" })
  motorcycle: Motorcycle;

  @ManyToMany(() => Service, (service) => service.repair_jobs, {
    cascade: true
  })
  @JoinTable({
    name: "repair_job_services",
    joinColumn: {
      name: "repair_job_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "service_id", 
      referencedColumnName: "id"
    }
  })
  services: Service[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date;
}