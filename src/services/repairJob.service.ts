import { AppDataSource } from "../config/typeorm";
import { REPAIR_ESTIMATION, BUSINESS_RULES } from "../config/constants";
import { RepairJob } from "../entities/RepairJob.entity";
import { Service } from "../entities/Service.entity";
import { Motorcycle } from "../entities/Motorcycle.entity";
import { Customer } from "../entities/Customer.entity";
import { RepairStatus } from "../enums";
import { AppError, BadRequestError, InternalServerError, NotFoundError } from "../handler/error.handler";
import type { CreateRepairJobType, UpdateRepairJobType, RepairJobWorkflowType } from "../types";

interface WorkflowRule {
    allowed_transitions: readonly RepairStatus[];
    can_cancel: boolean;
    requires_confirmation: boolean;
    description: string;
}

export class RepairJobService {
    static readonly repairJobRepository = AppDataSource.getRepository(RepairJob);
    static readonly serviceRepository = AppDataSource.getRepository(Service);
    static readonly motorcycleRepository = AppDataSource.getRepository(Motorcycle);
    static readonly customerRepository = AppDataSource.getRepository(Customer);

    private static includes<T>(array: readonly T[], value: T): boolean {
        return (array as T[]).includes(value);
    }

    static readonly WORKFLOW_RULES: Record<RepairStatus, WorkflowRule> = {
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

            // Calculate estimated completion using configuration constants
            const baseDays = services.length * REPAIR_ESTIMATION.BASE_DAYS_PER_SERVICE;
            const isComplexRepair = services.some(s =>
                REPAIR_ESTIMATION.COMPLEX_REPAIR_KEYWORDS.some(keyword =>
                    s.name.toLowerCase().includes(keyword)
                )
            );
            const complexityFactor = isComplexRepair
                ? REPAIR_ESTIMATION.COMPLEXITY_MULTIPLIERS.ENGINE_REPAIR
                : REPAIR_ESTIMATION.COMPLEXITY_MULTIPLIERS.BASIC;

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
            if (!this.includes(currentWorkflow.allowed_transitions, new_status)) {
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

            if (!this.includes(BUSINESS_RULES.DELETABLE_STATUSES, repairJob.status)) {
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

            // Get first day of current month at 00:00:00
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

            // Get last day of current month at 23:59:59
            const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            // Get first day of previous month at 00:00:00
            const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);

            // Get last day of previous month at 23:59:59
            const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

            const completedJobsCurrentMonth = await this.repairJobRepository
                .createQueryBuilder("repair_job")
                .where("repair_job.status = :status", { status: RepairStatus.COMPLETED })
                .andWhere("repair_job.completed_at >= :currentMonthStart", { currentMonthStart })
                .andWhere("repair_job.completed_at <= :currentMonthEnd", { currentMonthEnd })
                .select(["repair_job.total_cost"])
                .getMany();

            const currentTotalRevenue = completedJobsCurrentMonth.reduce((sum, job) =>
                sum + Number(job.total_cost || 0), 0
            );

            const currentJobsCompleted = completedJobsCurrentMonth.length;

            const currentNewClients = await this.customerRepository
                .createQueryBuilder("customer")
                .where("customer.created_at >= :currentMonthStart", { currentMonthStart })
                .andWhere("customer.created_at <= :currentMonthEnd", { currentMonthEnd })
                .getCount();

            const completedJobsPreviousMonth = await this.repairJobRepository
                .createQueryBuilder("repair_job")
                .where("repair_job.status = :status", { status: RepairStatus.COMPLETED })
                .andWhere("repair_job.completed_at >= :previousMonthStart", { previousMonthStart })
                .andWhere("repair_job.completed_at <= :previousMonthEnd", { previousMonthEnd })
                .select(["repair_job.total_cost"])
                .getMany();

            const previousTotalRevenue = completedJobsPreviousMonth.reduce((sum, job) =>
                sum + Number(job.total_cost || 0), 0
            );

            const previousJobsCompleted = completedJobsPreviousMonth.length;

            const previousNewClients = await this.customerRepository
                .createQueryBuilder("customer")
                .where("customer.created_at >= :previousMonthStart", { previousMonthStart })
                .andWhere("customer.created_at <= :previousMonthEnd", { previousMonthEnd })
                .getCount();

            const calculatePercentageChange = (current: number, previous: number): number => {
                if (previous === 0) {
                    return current > 0 ? 100 : 0;
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