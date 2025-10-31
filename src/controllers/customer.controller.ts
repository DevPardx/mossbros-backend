import type { Request, Response } from "express";
import { CustomerService } from "../services/customer.service";
import { getRequiredParam } from "../utils/request";

export class CustomerController {
    static create = async (req: Request, res: Response) => {
        const response = await CustomerService.create(req.body);
        res.status(201).json(response);
    };

    static getAll = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const response = await CustomerService.getAll(page, limit);
        res.status(200).json(response);
    };

    static search = async (req: Request, res: Response) => {
        const { q } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const response = await CustomerService.search(q as string || "", page, limit);
        res.status(200).json(response);
    };

    static getById = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const response = await CustomerService.getById(id);
        res.status(200).json(response);
    };

    static update = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const response = await CustomerService.update(id, req.body);
        res.status(200).json(response);
    };

    static delete = async (req: Request, res: Response) => {
        const id = getRequiredParam(req, "id");
        const response = await CustomerService.delete(id);
        res.status(200).json(response);
    };
}