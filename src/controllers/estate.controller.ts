import { Request, Response } from "express";
import supabase from "../config/supabase";

export const createHome = async (req: Request, res: Response) => {
  try {
    const form = req.body;

    const { data, error } = await supabase
      .from("homes")
      .insert([form])
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      message: "Home created successfully",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
