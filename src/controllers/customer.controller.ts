import type { Request, Response } from "express";
import { CustomerService } from "../services/customer.service";
import { getRequiredParam } from "../utils/request";

export class CustomerController {
    constructor(private readonly customerService: CustomerService) {}

    create = async (req: Request, res: Response): Promise<void> => {
        const response = await this.customerService.create(req.body);
        res.status(201).json(response);
    };

    getAll = async (req: Request, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const response = await this.customerService.getAll(page, limit);
        res.status(200).json(response);
    };

    search = async (req: Request, res: Response): Promise<void> => {
        const { q } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const response = await this.customerService.search(q as string || "", page, limit);
        res.status(200).json(response);
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        const id = getRequiredParam(req, "id");
        const response = await this.customerService.getById(id);
        res.status(200).json(response);
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const id = getRequiredParam(req, "id");
        const response = await this.customerService.update(id, req.body);
        res.status(200).json(response);
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        const id = getRequiredParam(req, "id");
        const response = await this.customerService.delete(id);
        res.status(200).json(response);
    };
}