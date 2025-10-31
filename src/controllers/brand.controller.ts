import type { Request, Response } from "express";
import { BrandService } from "../services/brand.service";
import { getRequiredParam } from "../utils/request";

export class BrandController {
  static create = async (req: Request, res: Response) => {
    const { name, logo_url } = req.body;
    const response = await BrandService.create({ name, logo_url });
    return res.status(201).json(response);
  };

  static getAll = async (_req: Request, res: Response) => {
    const response = await BrandService.getAll();
    return res.status(200).json(response);
  };

  static getById = async (req: Request, res: Response) => {
    const id = getRequiredParam(req, "id");
    const response = await BrandService.getById({id});
    return res.status(200).json(response);
  };

  static update = async (req: Request, res: Response) => {
    const id = getRequiredParam(req, "id");
    const { name, logo_url, is_active } = req.body;
    const response = await BrandService.update({ id, name, logo_url, is_active });
    return res.status(200).json(response);
  };

  static delete = async (req: Request, res: Response) => {
    const id = getRequiredParam(req, "id");
    const response = await BrandService.delete({ id });
    return res.status(200).json(response);
  };
}