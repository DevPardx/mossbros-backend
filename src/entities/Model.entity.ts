import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Brand } from "./Brand.entity";
import { Motorcycle } from "./Motorcycle.entity";

@Entity("models")
export class Model {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50 })
  name: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "uuid" })
  brand_id: string;

  @ManyToOne(() => Brand, (brand) => brand.models, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "brand_id" })
  brand: Brand;

  @OneToMany(() => Motorcycle, (motorcycle) => motorcycle.model)
  motorcycles: Motorcycle[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date;
}