import type { Request, Response } from "express";
import { RepairJobService } from "../services/repairJob.service";
import { RepairStatus } from "../enums";
import { getRequiredParam } from "../utils/request";

export class RepairJobController {
    static create = async (req: Request, res: Response) => {
        const response = await RepairJobService.create(req.body);
        return res.status(201).json(response);
    };

    static getAll = async (req: Request, res: Response) => {
        const { status, motorcycle_id } = req.query;

        const filters: { status?: RepairStatus; motorcycle_id?: string } = {};

        if (status && Object.values(RepairStatus).includes(status as RepairStatus)) {
            filters.status = status as RepairStatus;
        }

        if (motorcycle_id && typeof motorcycle_id === "string") {
            filters.motorcycle_id = motorcycle_id;
        }

        const repairJobs = await RepairJobService.getAll(filters);
        return res.status(200).json(repairJobs);
    };

    static getById = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const repairJob = await RepairJobService.getById(id);
        return res.status(200).json(repairJob);
    };

    static update = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const response = await RepairJobService.update(id, req.body);
        return res.status(200).json(response);
    };

    static updateStatus = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const { status } = req.body;
        const response = await RepairJobService.updateStatus(id, status);
        return res.status(200).json(response);
    };

    static cancel = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const response = await RepairJobService.cancel(id);
        return res.status(200).json(response);
    };

    static delete = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const response = await RepairJobService.delete(id);
        return res.status(200).json(response);
    };

    static getWorkflow = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const workflow = await RepairJobService.getWorkflow(id);
        return res.status(200).json(workflow);
    };

    static getStatistics = async (_req: Request, res: Response) => {
        const response = await RepairJobService.getStatistics();
        return res.status(200).json(response);
    };
}