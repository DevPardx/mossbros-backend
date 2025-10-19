import type { Request, Response } from "express";
import { ModelService } from "../services/model.service";

export class ModelController {
  static create = async (req: Request, res: Response) => {
    const { name, brand_id } = req.body;
    const response = await ModelService.create({ name, brand_id });
    return res.status(201).json(response);
  };

  static getAll = async (req: Request, res: Response) => {
    const { brand_id } = req.params;
    const response = await ModelService.getAll({ brand_id });
    return res.status(200).json(response);
  };

  static getById = async (req: Request, res: Response) => {
    const { brand_id, id } = req.params;
    const response = await ModelService.getById({ brand_id, id });
    return res.status(200).json(response);
  };

  static update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, brand_id, is_active } = req.body;
    const response = await ModelService.update({ id, name, brand_id, is_active });
    return res.status(200).json(response);
  };

  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const response = await ModelService.delete({ id });
    return res.status(200).json(response);
  };
}