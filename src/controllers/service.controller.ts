import type { Request, Response } from "express";
import { ServiceService } from "../services/service.service";
import { getRequiredParam } from "../utils/request";

export class ServiceController {
    constructor(private readonly serviceService: ServiceService) {}

    create = async (req: Request, res: Response): Promise<Response> => {
        const { name, price } = req.body;
        const response = await this.serviceService.create({ name, price });
        return res.status(201).json(response);
    };

    getAll = async (_req: Request, res: Response): Promise<Response> => {
        const response = await this.serviceService.getAll();
        return res.status(200).json(response);
    };

    getById = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const service = await this.serviceService.getById({id});
        return res.status(200).json(service);
    };

    update = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const { name, price, is_active } = req.body;
        const service = await this.serviceService.update({ id, name, price, is_active });
        return res.status(200).json(service);
    };

    delete = async (req: Request, res: Response): Promise<Response> => {
        const id = getRequiredParam(req, "id");
        const response = await this.serviceService.delete({ id });
        return res.status(200).json(response);
    };
}