import type { Request, Response } from "express";
import { CustomerService } from "../services/customer.service";

export class CustomerController {
    static create = async (req: Request, res: Response) => {
        const response = await CustomerService.create(req.body);
        res.status(201).json(response);
    };

    static getAll = async (req: Request, res: Response) => {
        const response = await CustomerService.getAll();
        res.status(200).json(response);
    };

    static search = async (req: Request, res: Response) => {
        const { q } = req.query;
        const response = await CustomerService.search(q as string || "");
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
        res.status(200).json(response);
    };

    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const response = await CustomerService.delete(id);
        res.status(200).json(response);
    };
}