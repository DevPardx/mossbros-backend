import type { Request, Response } from "express";
import { RepairJobService } from "../services/repairJob.service";
import { RepairStatus } from "../enums";
import { getRequiredParam } from "../utils/request";
import type { RepairJobHistoryFilters, RepairJobFilters } from "../types";

export class RepairJobController {
    constructor(private readonly repairJobService: RepairJobService) {}

    create = async (req: Request, res: Response): Promise<Response> => {
        const response = await this.repairJobService.create(req.body);
        return res.status(201).json(response);
    };

    getAll = async (req: Request, res: Response): Promise<Response> => {
        const { status, motorcycle_id, page, limit } = req.query;

        const filters: RepairJobFilters = {
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
        };

        if (status && Object.values(RepairStatus).includes(status as RepairStatus)) {
            filters.status = status as string;
        }

        if (motorcycle_id && typeof motorcycle_id === "string") {
            filters.motorcycle_id = motorcycle_id;
        }

        const response = await this.repairJobService.getAll(filters);
        return res.status(200).json(response);
    };

    getById = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const repairJob = await this.repairJobService.getById(id);
        return res.status(200).json(repairJob);
    };

    update = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const response = await this.repairJobService.update(id, req.body);
        return res.status(200).json(response);
    };

    updateStatus = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const { status } = req.body;
        const response = await this.repairJobService.updateStatus(id, status);
        return res.status(200).json(response);
    };

    cancel = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const response = await this.repairJobService.cancel(id);
        return res.status(200).json(response);
    };

    delete = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const response = await this.repairJobService.delete(id);
        return res.status(200).json(response);
    };

    getWorkflow = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const workflow = await this.repairJobService.getWorkflow(id);
        return res.status(200).json(workflow);
    };

    getStatistics = async (_req: Request, res: Response): Promise<Response> => {
        const response = await this.repairJobService.getStatistics();
        return res.status(200).json(response);
    };

    getHistory = async (req: Request, res: Response): Promise<Response> => {
        const { page, limit, date_from, date_to, search } = req.query;

        const filters: RepairJobHistoryFilters = {
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            date_from: date_from as string | undefined,
            date_to: date_to as string | undefined,
            search: search as string | undefined
        };

        const response = await this.repairJobService.getHistory(filters);
        return res.status(200).json(response);
    };

    getDateRange = async (_req: Request, res: Response): Promise<Response> => {
        const response = await this.repairJobService.getDateRange();
        return res.status(200).json(response);
    };
}