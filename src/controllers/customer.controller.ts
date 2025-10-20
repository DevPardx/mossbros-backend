import type { Request, Response } from "express";
import { client } from "../config/redis";
import { CustomerService } from "../services/customer.service";

export class CustomerController {
    static create = async (req: Request, res: Response) => {
        const response = await CustomerService.create(req.body);
        await client.del("customers");
        res.status(201).json(response);
    };

    static getAll = async (req: Request, res: Response) => {
        const customers = await client.get("customers");

        if (customers) {
            const data = typeof customers === "string" ? customers : customers.toString();
            return res.status(200).json(JSON.parse(data));
        }

        const response = await CustomerService.getAll();
        await client.set("customers", JSON.stringify(response));
        res.status(200).json(response);
    };

    static getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await CustomerService.getById(id);
        res.status(200).json(response);
    };

    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await CustomerService.update(id, req.body);
        await client.del("customers");
        res.status(200).json(response);
    };

    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await CustomerService.delete(id);
        await client.del("customers");
        res.status(200).json(response);
    };
}