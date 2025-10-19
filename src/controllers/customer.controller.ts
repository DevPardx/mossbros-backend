import { Request, Response } from "express";
import { CustomerService } from "../services/customer.service";

export class CustomerController {
    static create = async (req: Request, res: Response) => {
        try {
            const response = await CustomerService.create(req.body);
            res.status(201).json(response);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error al crear cliente con motocicleta" });
        }
    };

    static getAll = async (req: Request, res: Response) => {
        try {
            const customers = await CustomerService.getAll();
            res.status(200).json(customers);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error al obtener clientes" });
        }
    };

    static getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const customer = await CustomerService.getById(id);
            res.status(200).json(customer);
        } catch (error) {
            console.log(error);
            res.status(404).json({ error: "Cliente no encontrado" });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const customer = await CustomerService.update(id, req.body);
            res.status(200).json(customer);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error al actualizar cliente" });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await CustomerService.delete(id);
            res.status(200).json("Cliente eliminado correctamente");
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error al eliminar cliente" });
        }
    };
}