import type { Request, Response } from "express";
import { client } from "../config/redis";
import { RepairJobService } from "../services/repairJob.service";
import { RepairStatus } from "../enums";

export class RepairJobController {
    static create = async (req: Request, res: Response) => {
        const response = await RepairJobService.create(req.body);
        await client.del("repair_jobs");
        await client.del("repair_job_statistics");
        return res.status(201).json(response);
    };

    static getAll = async (req: Request, res: Response) => {
        const jobs = await client.get("repair_jobs");

        if (jobs) {
            const data = typeof jobs === 'string' ? jobs : jobs.toString();
            return res.status(200).json(JSON.parse(data));
        }

        const { status, motorcycle_id } = req.query;
        
        const filters: { status?: RepairStatus; motorcycle_id?: string } = {};
        
        if (status && Object.values(RepairStatus).includes(status as RepairStatus)) {
            filters.status = status as RepairStatus;
        }
        
        if (motorcycle_id && typeof motorcycle_id === "string") {
            filters.motorcycle_id = motorcycle_id;
        }

        const repairJobs = await RepairJobService.getAll(filters);
        await client.set("repair_jobs", JSON.stringify(repairJobs));
        return res.status(200).json(repairJobs);
    };

    static getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const repairJob = await RepairJobService.getById(id);
        return res.status(200).json(repairJob);
    };

    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await RepairJobService.update(id, req.body);
        await client.del("repair_jobs");
        await client.del("repair_job_statistics");
        return res.status(200).json(response);
    };

    static updateStatus = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status } = req.body;
        const response = await RepairJobService.updateStatus(id, status);
        await client.del("repair_jobs");
        await client.del("repair_job_statistics");
        return res.status(200).json(response);
    };

    static cancel = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await RepairJobService.cancel(id);
        await client.del("repair_jobs");
        await client.del("repair_job_statistics");
        return res.status(200).json(response);
    };

    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await RepairJobService.delete(id);
        await client.del("repair_jobs");
        await client.del("repair_job_statistics");
        return res.status(200).json(response);
    };

    static getWorkflow = async (req: Request, res: Response) => {
        const { id } = req.params;
        const workflow = await RepairJobService.getWorkflow(id);
        return res.status(200).json(workflow);
    };

    static getStatistics = async (req: Request, res: Response) => {
        const statistics = await client.get("repair_job_statistics");

        if (statistics) {
            const data = typeof statistics === 'string' ? statistics : statistics.toString();
            return res.status(200).json(JSON.parse(data));
        }
        
        const response = await RepairJobService.getStatistics();
        await client.set("repair_job_statistics", JSON.stringify(response));
        return res.status(200).json(response);
    };
}