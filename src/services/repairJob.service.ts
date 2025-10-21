import { AppDataSource } from "../config/typeorm";
import { RepairJob } from "../entities/RepairJob.entity";
import { Service } from "../entities/Service.entity";
import { Motorcycle } from "../entities/Motorcycle.entity";
import { Customer } from "../entities/Customer.entity";
import { RepairStatus } from "../enums";
import { AppError, BadRequestError, InternalServerError, NotFoundError } from "../handler/error.handler";
import type { CreateRepairJobType, UpdateRepairJobType, RepairJobWorkflowType } from "../types";

export class RepairJobService {
    static readonly repairJobRepository = AppDataSource.getRepository(RepairJob);
    static readonly serviceRepository = AppDataSource.getRepository(Service);
    static readonly motorcycleRepository = AppDataSource.getRepository(Motorcycle);
    static readonly customerRepository = AppDataSource.getRepository(Customer);

    static readonly WORKFLOW_RULES = {
        [RepairStatus.PENDING]: {
            allowed_transitions: [RepairStatus.IN_REPAIR, RepairStatus.CANCELLED],
            can_cancel: true,
            requires_confirmation: false,
            description: "Job received, waiting to start repair"
        },
        [RepairStatus.IN_REPAIR]: {
            allowed_transitions: [RepairStatus.WAITING_FOR_PARTS, RepairStatus.READY_FOR_PICKUP, RepairStatus.CANCELLED],
            can_cancel: true,
            requires_confirmation: false,
            description: "Motorcycle is being repaired"
        },
        [RepairStatus.WAITING_FOR_PARTS]: {
            allowed_transitions: [RepairStatus.IN_REPAIR, RepairStatus.CANCELLED],
            can_cancel: true,
            requires_confirmation: false,
            description: "Waiting for replacement parts to arrive"
        },
        [RepairStatus.READY_FOR_PICKUP]: {
            allowed_transitions: [RepairStatus.COMPLETED],
            can_cancel: false,
            requires_confirmation: true,
            description: "Repair completed, waiting for customer pickup"
        },
        [RepairStatus.COMPLETED]: {
            allowed_transitions: [],
            can_cancel: false,
            requires_confirmation: false,
            description: "Job completed and motorcycle picked up"
        },
        [RepairStatus.CANCELLED]: {
            allowed_transitions: [],
            can_cancel: false,
            requires_confirmation: false,
            description: "Job was cancelled"
        }
    };

    static create = async (data: CreateRepairJobType) => {
        try {
            const motorcycle = await this.motorcycleRepository.findOne({
                where: { id: data.motorcycle_id },
                relations: ["customer"]
            });

            if (!motorcycle) {
                throw new NotFoundError("Motocicleta no encontrada");
            }

            const services = await this.serviceRepository.findByIds(data.service_ids);
            if (services.length !== data.service_ids.length) {
                throw new BadRequestError("Uno o más servicios no encontrados");
            }

            const total_cost = services.reduce((sum, service) => sum + Number(service.price), 0);

            const baseDays = services.length * 1;
            const complexityFactor = services.some(s => s.name.toLowerCase().includes("motor") || s.name.toLowerCase().includes("engine")) ? 2 : 1;
            const estimated_completion = new Date();
            estimated_completion.setDate(estimated_completion.getDate() + (baseDays * complexityFactor));

            const repairJob = this.repairJobRepository.create({
                motorcycle_id: data.motorcycle_id,
                notes: data.notes,
                estimated_completion: data.estimated_completion ? new Date(data.estimated_completion) : estimated_completion,
                total_cost,
                services
            });

            await this.repairJobRepository.save(repairJob);

            return "Trabajo de reparación creado exitosamente";

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al crear el trabajo de reparación");
        }
    };

    static getAll = async (filters?: { status?: RepairStatus; motorcycle_id?: string }) => {
        try {
            const query = this.repairJobRepository.createQueryBuilder("repair_job")
                .leftJoinAndSelect("repair_job.motorcycle", "motorcycle")
                .leftJoinAndSelect("motorcycle.customer", "customer")
                .leftJoinAndSelect("repair_job.services", "services")
                .orderBy("repair_job.created_at", "DESC");

            if (filters?.status) {
                query.andWhere("repair_job.status = :status", { status: filters.status });
            }

            if (filters?.motorcycle_id) {
                query.andWhere("repair_job.motorcycle_id = :motorcycle_id", { motorcycle_id: filters.motorcycle_id });
            }

            const repairJobs = await query.getMany();
            return repairJobs;

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener los trabajos de reparación");
        }
    };

    static getById = async (id: string) => {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id },
                relations: ["motorcycle", "motorcycle.customer", "services"]
            });

            if (!repairJob) {
                throw new NotFoundError("Trabajo de reparación no encontrado");
            }

            return repairJob;

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener el trabajo de reparación");
        }
    };

    static update = async (id: string, data: UpdateRepairJobType) => {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id },
                relations: ["services"]
            });

            if (!repairJob) {
                throw new NotFoundError("Trabajo de reparación no encontrado");
            }

            if (data.notes !== undefined) repairJob.notes = data.notes;
            if (data.estimated_completion) {
                repairJob.estimated_completion = new Date(data.estimated_completion);
            }

            await this.repairJobRepository.save(repairJob);

            return "Trabajo de reparación actualizado exitosamente";

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al actualizar el trabajo de reparación");
        }
    };

    static updateStatus = async (id: string, new_status: RepairStatus) => {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id },
                relations: ["motorcycle", "motorcycle.customer", "services"]
            });

            if (!repairJob) {
                throw new NotFoundError("Trabajo de reparación no encontrado");
            }

            const currentWorkflow = this.WORKFLOW_RULES[repairJob.status];
            if (!currentWorkflow.allowed_transitions.includes(new_status)) {
                throw new BadRequestError(`No se puede cambiar de ${repairJob.status} a ${new_status}`);
            }

            repairJob.status = new_status;
            
            if (new_status === RepairStatus.IN_REPAIR && !repairJob.started_at) {
                repairJob.started_at = new Date();
            }
            
            if (new_status === RepairStatus.COMPLETED && !repairJob.completed_at) {
                repairJob.completed_at = new Date();
            }

            await this.repairJobRepository.save(repairJob);

            return "Estado actualizado";

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al actualizar el estado");
        }
    };

    static cancel = async (id: string) => {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id },
                relations: ["motorcycle", "motorcycle.customer"]
            });

            if (!repairJob) {
                throw new NotFoundError("Trabajo de reparación no encontrado");
            }

            const currentWorkflow = this.WORKFLOW_RULES[repairJob.status];
            if (!currentWorkflow.can_cancel) {
                throw new BadRequestError("No se puede cancelar un trabajo con el estado actual");
            }

            repairJob.status = RepairStatus.CANCELLED;
            await this.repairJobRepository.save(repairJob);

            return "Trabajo de reparación cancelado";

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al cancelar el trabajo de reparación");
        }
    };

    static getWorkflowInfo = (status: RepairStatus): RepairJobWorkflowType => {
        const workflow = this.WORKFLOW_RULES[status];
        return {
            current_status: status,
            allowed_transitions: workflow.allowed_transitions,
            can_cancel: workflow.can_cancel,
            requires_confirmation: workflow.requires_confirmation
        };
    };

    static getWorkflow = async (id: string) => {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id }
            });

            if (!repairJob) {
                throw new NotFoundError("Trabajo de reparación no encontrado");
            }

            return {
                repair_job_id: id,
                workflow: this.getWorkflowInfo(repairJob.status),
                description: this.WORKFLOW_RULES[repairJob.status].description
            };

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener información del workflow");
        }
    };

    static delete = async (id: string) => {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id }
            });

            if (!repairJob) {
                throw new NotFoundError("Trabajo de reparación no encontrado");
            }

            if (![RepairStatus.PENDING, RepairStatus.CANCELLED].includes(repairJob.status)) {
                throw new BadRequestError("Solo se pueden eliminar trabajos en estado pendiente o cancelado");
            }

            await this.repairJobRepository.remove(repairJob);

            return "Trabajo de reparación eliminado exitosamente";

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al eliminar el trabajo de reparación");
        }
    };

    static getStatistics = async () => {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const sixtyDaysAgo = new Date(now);
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

            const completedJobsLast30Days = await this.repairJobRepository
                .createQueryBuilder("repair_job")
                .where("repair_job.status = :status", { status: RepairStatus.COMPLETED })
                .andWhere("repair_job.completed_at >= :thirtyDaysAgo", { thirtyDaysAgo })
                .andWhere("repair_job.completed_at <= :now", { now })
                .select(["repair_job.total_cost"])
                .getMany();

            const currentTotalRevenue = completedJobsLast30Days.reduce((sum, job) => 
                sum + Number(job.total_cost || 0), 0
            );

            const currentJobsCompleted = completedJobsLast30Days.length;

            const currentNewClients = await this.customerRepository
                .createQueryBuilder("customer")
                .where("customer.created_at >= :thirtyDaysAgo", { thirtyDaysAgo })
                .andWhere("customer.created_at <= :now", { now })
                .getCount();

            const completedJobsPrevious30Days = await this.repairJobRepository
                .createQueryBuilder("repair_job")
                .where("repair_job.status = :status", { status: RepairStatus.COMPLETED })
                .andWhere("repair_job.completed_at >= :sixtyDaysAgo", { sixtyDaysAgo })
                .andWhere("repair_job.completed_at < :thirtyDaysAgo", { thirtyDaysAgo })
                .select(["repair_job.total_cost"])
                .getMany();

            // Calcular revenue del mes anterior
            const previousTotalRevenue = completedJobsPrevious30Days.reduce((sum, job) => 
                sum + Number(job.total_cost || 0), 0
            );

            // Contar trabajos completados del mes anterior
            const previousJobsCompleted = completedJobsPrevious30Days.length;

            // Obtener nuevos clientes del mes anterior
            const previousNewClients = await this.customerRepository
                .createQueryBuilder("customer")
                .where("customer.created_at >= :sixtyDaysAgo", { sixtyDaysAgo })
                .andWhere("customer.created_at < :thirtyDaysAgo", { thirtyDaysAgo })
                .getCount();

            // === CALCULAR PORCENTAJES DE CAMBIO ===

            const calculatePercentageChange = (current: number, previous: number): number => {
                if (previous === 0) {
                    return current > 0 ? 100 : 0; // Si anterior era 0 y ahora hay algo, es 100% de incremento
                }
                return Number((((current - previous) / previous) * 100).toFixed(2));
            };

            const revenueChange = calculatePercentageChange(currentTotalRevenue, previousTotalRevenue);
            const clientsChange = calculatePercentageChange(currentNewClients, previousNewClients);
            const jobsChange = calculatePercentageChange(currentJobsCompleted, previousJobsCompleted);

            return {
                total_revenue: {
                    value: currentTotalRevenue,
                    percentage_change: revenueChange,
                    trend: revenueChange >= 0 ? "up" : "down"
                },
                new_clients: {
                    value: currentNewClients,
                    percentage_change: clientsChange,
                    trend: clientsChange >= 0 ? "up" : "down"
                },
                jobs_completed: {
                    value: currentJobsCompleted,
                    percentage_change: jobsChange,
                    trend: jobsChange >= 0 ? "up" : "down"
                }
            };

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener estadísticas");
        }
    };
}