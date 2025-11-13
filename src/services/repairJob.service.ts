import { Repository } from "typeorm";
import { REPAIR_ESTIMATION, BUSINESS_RULES } from "../config/constants";
import { RepairJob } from "../entities/RepairJob.entity";
import { Service } from "../entities/Service.entity";
import { Motorcycle } from "../entities/Motorcycle.entity";
import { Customer } from "../entities/Customer.entity";
import { RepairStatus } from "../enums";
import { AppError, BadRequestError, InternalServerError, NotFoundError } from "../handler/error.handler";
import { assertExists, assertSameLength } from "../utils/validation.utils";
import type { CreateRepairJobType, UpdateRepairJobType, RepairJobWorkflowType, PaginatedResponse, RepairJobHistoryFilters, RepairJobFilters } from "../types";

interface WorkflowRule {
    allowed_transitions: readonly RepairStatus[];
    can_cancel: boolean;
    requires_confirmation: boolean;
    description: string;
}

export class RepairJobService {
    constructor(
        private readonly repairJobRepository: Repository<RepairJob>,
        private readonly motorcycleRepository: Repository<Motorcycle>,
        private readonly serviceRepository: Repository<Service>,
        private readonly customerRepository: Repository<Customer>
    ) {}

    private includes<T>(array: readonly T[], value: T): boolean {
        return (array as T[]).includes(value);
    }

    private calculatePercentageChange(current: number, previous: number): number {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return Number((((current - previous) / previous) * 100).toFixed(2));
    }

    private getMonthBoundaries(year: number, month: number): { start: Date; end: Date } {
        const start = new Date(year, month, 1, 0, 0, 0, 0);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
        return { start, end };
    }

    private async getCompletedJobsInPeriod(start: Date, end: Date): Promise<RepairJob[]> {
        return await this.repairJobRepository
            .createQueryBuilder("repair_job")
            .where("repair_job.status = :status", { status: RepairStatus.COMPLETED })
            .andWhere("repair_job.completed_at >= :start", { start })
            .andWhere("repair_job.completed_at <= :end", { end })
            .select(["repair_job.total_cost"])
            .getMany();
    }

    private async getNewCustomersCountInPeriod(start: Date, end: Date): Promise<number> {
        return await this.customerRepository
            .createQueryBuilder("customer")
            .where("customer.created_at >= :start", { start })
            .andWhere("customer.created_at <= :end", { end })
            .getCount();
    }

    private calculateRevenueFromJobs(jobs: RepairJob[]): number {
        return jobs.reduce((sum, job) => sum + Number(job.total_cost || 0), 0);
    }

    private calculateTotalCost(services: Service[]): number {
        return services.reduce((sum, service) => sum + Number(service.price), 0);
    }

    private isComplexRepair(services: Service[]): boolean {
        return services.some(s =>
            REPAIR_ESTIMATION.COMPLEX_REPAIR_KEYWORDS.some(keyword =>
                s.name.toLowerCase().includes(keyword)
            )
        );
    }

    private calculateEstimatedCompletion(services: Service[]): Date {
        const baseDays = services.length * REPAIR_ESTIMATION.BASE_DAYS_PER_SERVICE;
        const complexityFactor = this.isComplexRepair(services)
            ? REPAIR_ESTIMATION.COMPLEXITY_MULTIPLIERS.ENGINE_REPAIR
            : REPAIR_ESTIMATION.COMPLEXITY_MULTIPLIERS.BASIC;

        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + (baseDays * complexityFactor));
        estimatedDate.setHours(0, 0, 0, 0);
        return estimatedDate;
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

    async create(data: CreateRepairJobType): Promise<string> {
        try {
            const motorcycle = await this.motorcycleRepository.findOne({
                where: { id: data.motorcycle_id },
                relations: ["customer"]
            });
            assertExists(motorcycle, "Motocicleta");

            const services = await this.serviceRepository.findByIds(data.service_ids);
            assertSameLength(
                services,
                data.service_ids,
                "Uno o más servicios no encontrados"
            );

            const total_cost = this.calculateTotalCost(services);
            const estimated_completion = data.estimated_completion
                ? new Date(data.estimated_completion)
                : this.calculateEstimatedCompletion(services);

            const repairJob = this.repairJobRepository.create({
                motorcycle_id: data.motorcycle_id,
                notes: data.notes,
                estimated_completion,
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
    }

    async getAll(filters?: RepairJobFilters): Promise<PaginatedResponse<RepairJob>> {
        try {
            const page = filters?.page || 1;
            const limit = filters?.limit || 10;
            const skip = (page - 1) * limit;

            const query = this.repairJobRepository.createQueryBuilder("repair_job")
                .leftJoinAndSelect("repair_job.motorcycle", "motorcycle")
                .leftJoinAndSelect("motorcycle.customer", "customer")
                .leftJoinAndSelect("motorcycle.brand", "brand")
                .leftJoinAndSelect("motorcycle.model", "model")
                .leftJoinAndSelect("repair_job.services", "services");

            query.andWhere("repair_job.status NOT IN (:...excludedStatuses)", {
                excludedStatuses: [RepairStatus.COMPLETED, RepairStatus.CANCELLED]
            });

            if (filters?.status) {
                query.andWhere("repair_job.status = :status", { status: filters.status });
            }

            if (filters?.motorcycle_id) {
                query.andWhere("repair_job.motorcycle_id = :motorcycle_id", { motorcycle_id: filters.motorcycle_id });
            }

            query.orderBy("repair_job.created_at", "DESC");

            const [data, total] = await query
                .skip(skip)
                .take(limit)
                .getManyAndCount();

            const total_pages = Math.ceil(total / limit);

            return {
                data,
                metadata: {
                    total,
                    page,
                    limit,
                    total_pages
                }
            };

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener los trabajos de reparación");
        }
    }

    async getById(id: string) {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id },
                relations: ["motorcycle", "motorcycle.customer", "motorcycle.brand", "motorcycle.model", "services"]
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
    }

    async update(id: string, data: UpdateRepairJobType) {
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
                repairJob.estimated_completion = data.estimated_completion as Date | string;
            }

            await this.repairJobRepository.save(repairJob);

            return "Trabajo de reparación actualizado exitosamente";

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al actualizar el trabajo de reparación");
        }
    }

    async updateStatus(id: string, new_status: RepairStatus) {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id },
                relations: ["motorcycle", "motorcycle.customer", "services"]
            });

            if (!repairJob) {
                throw new NotFoundError("Trabajo de reparación no encontrado");
            }

            const currentWorkflow = RepairJobService.WORKFLOW_RULES[repairJob.status];
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
    }

    async cancel(id: string) {
        try {
            const repairJob = await this.repairJobRepository.findOne({
                where: { id },
                relations: ["motorcycle", "motorcycle.customer"]
            });

            if (!repairJob) {
                throw new NotFoundError("Trabajo de reparación no encontrado");
            }

            const currentWorkflow = RepairJobService.WORKFLOW_RULES[repairJob.status];
            if (!currentWorkflow.can_cancel) {
                throw new BadRequestError("No se puede cancelar un trabajo con el estado actual");
            }

            repairJob.status = RepairStatus.CANCELLED;
            if (!repairJob.completed_at) {
                repairJob.completed_at = new Date();
            }
            await this.repairJobRepository.save(repairJob);

            return "Trabajo de reparación cancelado";

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al cancelar el trabajo de reparación");
        }
    }

    getWorkflowInfo(status: RepairStatus): RepairJobWorkflowType {
        const workflow = RepairJobService.WORKFLOW_RULES[status];
        return {
            current_status: status,
            allowed_transitions: workflow.allowed_transitions,
            can_cancel: workflow.can_cancel,
            requires_confirmation: workflow.requires_confirmation
        };
    }

    async getWorkflow(id: string) {
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
                description: RepairJobService.WORKFLOW_RULES[repairJob.status].description
            };

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener información del workflow");
        }
    }

    async delete(id: string) {
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
    }

    async getStatistics() {
        try {
            const now = new Date();
            const currentMonth = this.getMonthBoundaries(now.getFullYear(), now.getMonth());
            const previousMonth = this.getMonthBoundaries(now.getFullYear(), now.getMonth() - 1);

            const [completedJobsCurrentMonth, currentNewClients] = await Promise.all([
                this.getCompletedJobsInPeriod(currentMonth.start, currentMonth.end),
                this.getNewCustomersCountInPeriod(currentMonth.start, currentMonth.end)
            ]);

            const [completedJobsPreviousMonth, previousNewClients] = await Promise.all([
                this.getCompletedJobsInPeriod(previousMonth.start, previousMonth.end),
                this.getNewCustomersCountInPeriod(previousMonth.start, previousMonth.end)
            ]);

            const currentTotalRevenue = this.calculateRevenueFromJobs(completedJobsCurrentMonth);
            const previousTotalRevenue = this.calculateRevenueFromJobs(completedJobsPreviousMonth);
            const currentJobsCompleted = completedJobsCurrentMonth.length;
            const previousJobsCompleted = completedJobsPreviousMonth.length;

            const revenueChange = this.calculatePercentageChange(currentTotalRevenue, previousTotalRevenue);
            const clientsChange = this.calculatePercentageChange(currentNewClients, previousNewClients);
            const jobsChange = this.calculatePercentageChange(currentJobsCompleted, previousJobsCompleted);

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
    }

    async getDateRange(): Promise<{ min_year: number; max_year: number }> {
        try {
            const result = await this.repairJobRepository
                .createQueryBuilder("repair_job")
                .select("MIN(repair_job.created_at)", "min_date")
                .addSelect("MAX(repair_job.created_at)", "max_date")
                .getRawOne();

            const currentYear = new Date().getFullYear();
            const minYear = result?.min_date ? new Date(result.min_date).getFullYear() : currentYear;
            const maxYear = result?.max_date ? new Date(result.max_date).getFullYear() : currentYear;

            return {
                min_year: minYear,
                max_year: maxYear
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener el rango de fechas");
        }
    }

    async getHistory(filters: RepairJobHistoryFilters): Promise<PaginatedResponse<RepairJob>> {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 10;
            const skip = (page - 1) * limit;

            const query = this.repairJobRepository.createQueryBuilder("repair_job")
                .leftJoinAndSelect("repair_job.motorcycle", "motorcycle")
                .leftJoinAndSelect("motorcycle.customer", "customer")
                .leftJoinAndSelect("motorcycle.brand", "brand")
                .leftJoinAndSelect("motorcycle.model", "model")
                .leftJoinAndSelect("repair_job.services", "services")
                .addSelect("COALESCE(repair_job.completed_at, repair_job.updated_at)", "completion_date");

            query.andWhere("repair_job.status IN (:...historyStatuses)", {
                historyStatuses: [RepairStatus.COMPLETED, RepairStatus.CANCELLED]
            });

            if (filters.date_from) {
                const parts = filters.date_from.split("-");
                if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    const day = parseInt(parts[2], 10);
                    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                        const dateFrom = new Date(year, month - 1, day, 0, 0, 0, 0);
                        query.andWhere(
                            "(COALESCE(repair_job.completed_at, repair_job.updated_at))::date >= :date_from::date",
                            { date_from: dateFrom }
                        );
                    }
                }
            }

            if (filters.date_to) {
                const parts = filters.date_to.split("-");
                if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    const day = parseInt(parts[2], 10);
                    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                        const dateTo = new Date(year, month - 1, day, 23, 59, 59, 999);
                        query.andWhere(
                            "(COALESCE(repair_job.completed_at, repair_job.updated_at))::date <= :date_to::date",
                            { date_to: dateTo }
                        );
                    }
                }
            }

            if (filters.search) {
                query.andWhere(
                    "(LOWER(customer.name) LIKE LOWER(:search) OR LOWER(motorcycle.plate) LIKE LOWER(:search))",
                    { search: `%${filters.search}%` }
                );
            }

            query.orderBy("completion_date", "DESC");

            const [data, total] = await query
                .skip(skip)
                .take(limit)
                .getManyAndCount();

            const total_pages = Math.ceil(total / limit);

            return {
                data,
                metadata: {
                    total,
                    page,
                    limit,
                    total_pages
                }
            };

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener el historial de reparaciones");
        }
    }
}