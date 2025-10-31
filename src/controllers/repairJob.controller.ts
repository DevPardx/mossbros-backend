import type { Request, Response } from "express";
import { RepairJobService } from "../services/repairJob.service";
import { RepairStatus } from "../enums";
import { getRequiredParam } from "../utils/request";

export class RepairJobController {
    constructor(private readonly repairJobService: RepairJobService) {}

    create = async (req: Request, res: Response): Promise<Response> => {
        const response = await this.repairJobService.create(req.body);
        return res.status(201).json(response);
    };

    getAll = async (req: Request, res: Response): Promise<Response> => {
        const { status, motorcycle_id } = req.query;

        const filters: { status?: RepairStatus; motorcycle_id?: string } = {};

        if (status && Object.values(RepairStatus).includes(status as RepairStatus)) {
            filters.status = status as RepairStatus;
        }

        if (motorcycle_id && typeof motorcycle_id === "string") {
            filters.motorcycle_id = motorcycle_id;
        }

        const repairJobs = await this.repairJobService.getAll(filters);
        return res.status(200).json(repairJobs);
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
}