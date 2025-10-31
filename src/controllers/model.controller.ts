import type { Request, Response } from "express";
import { ModelService } from "../services/model.service";
import { getRequiredParam } from "../utils/request";

export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const { name, brand_id } = req.body;
    const response = await this.modelService.create({ name, brand_id });
    return res.status(201).json(response);
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    const brand_id = getRequiredParam(req, "brand_id");
    const response = await this.modelService.getAll({ brand_id });
    return res.status(200).json(response);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const brand_id = getRequiredParam(req, "brand_id");
    const id = getRequiredParam(req, "id");
    const response = await this.modelService.getById({ brand_id, id });
    return res.status(200).json(response);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const id = getRequiredParam(req, "id");
    const { name, brand_id, is_active } = req.body;
    const response = await this.modelService.update({ id, name, brand_id, is_active });
    return res.status(200).json(response);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const id = getRequiredParam(req, "id");
    const response = await this.modelService.delete({ id });
    return res.status(200).json(response);
  };
}