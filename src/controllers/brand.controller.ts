import type { Request, Response } from "express";
import { BrandService } from "../services/brand.service";
import { getRequiredParam } from "../utils/request";

export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const { name, logo_url } = req.body;
    const response = await this.brandService.create({ name, logo_url });
    return res.status(201).json(response);
  };

  getAll = async (_req: Request, res: Response): Promise<Response> => {
    const response = await this.brandService.getAll();
    return res.status(200).json(response);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const id = getRequiredParam(req, "id");
    const response = await this.brandService.getById({id});
    return res.status(200).json(response);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const id = getRequiredParam(req, "id");
    const { name, logo_url, is_active } = req.body;
    const response = await this.brandService.update({ id, name, logo_url, is_active });
    return res.status(200).json(response);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const id = getRequiredParam(req, "id");
    const response = await this.brandService.delete({ id });
    return res.status(200).json(response);
  };
}