import type { Request, Response } from "express";
import { ServiceService } from "../services/service.service";
import { AppError } from "../handler/error.handler";

export class ServiceController {
    static create = async (req: Request, res: Response) => {
        const { name, price } = req.body;
        const response = await ServiceService.create({ name, price });
        return res.status(201).json(response);
    }

    static getAll = async (req: Request, res: Response) => {
        const services = await ServiceService.getAll();
        return res.status(200).json(services);
    }

    static getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const service = await ServiceService.getById({id});
        return res.status(200).json(service);
    }

    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, price, is_active } = req.body;
        const service = await ServiceService.update({ id, name, price, is_active });
        return res.status(200).json(service);
    }

    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await ServiceService.delete({ id });
        return res.status(200).json(response);
    }
}