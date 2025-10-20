import type { Request, Response } from "express";
import { client } from "../config/redis";
import { ServiceService } from "../services/service.service";

export class ServiceController {
    static create = async (req: Request, res: Response) => {
        const { name, price } = req.body;
        const response = await ServiceService.create({ name, price });
        await client.del("services");
        return res.status(201).json(response);
    };

    static getAll = async (req: Request, res: Response) => {
        const services = await client.get("services");

        if (services) {
            const data = typeof services === 'string' ? services : services.toString();
            return res.status(200).json(JSON.parse(data));
        }

        const response = await ServiceService.getAll();
        await client.set("services", JSON.stringify(response));
        return res.status(200).json(response);
    };

    static getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const service = await ServiceService.getById({id});
        return res.status(200).json(service);
    };

    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, price, is_active } = req.body;
        const service = await ServiceService.update({ id, name, price, is_active });
        await client.del("services");
        return res.status(200).json(service);
    };

    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await ServiceService.delete({ id });
        await client.del("services");
        return res.status(200).json(response);
    };
}