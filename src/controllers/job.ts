import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/types";
import prisma from "../database/prisma";

export class Job {
  static async getJobs(_: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jobs = await prisma.job.findMany();

      res.status(200).json({ message: "successfully retrieved all jobs", data: jobs });
    } catch (err) {
      next(err);
    }
  }

  static async getJobById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw { name: "NotFound" };
      const job = await prisma.job.findUnique({ where: { id: Number(id) } });

      res.status(200).json({ message: "successfully retrieved job data", data: job });
    } catch (err) {
      next(err);
    }
  }

  static async createJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobDepartment, jobTitle, jobBranch } = req.body;
      if (!jobTitle) throw { name: "FieldRequired", fields: ";job_title" };
      if (!jobBranch) throw { name: "FieldRequired", fields: ";job_branch" };

      const foundJob = await prisma.job.findFirst({
        where: {
          jobTitle,
          jobBranch,
        },
      });

      if (foundJob) throw { name: "UniqueDataExists" };

      const createdJob = await prisma.job.create({ data: { jobDepartment, jobTitle, jobBranch } });

      res.status(201).json({ message: "successfully created new job", data: createdJob });
    } catch (err) {
      next(err);
    }
  }

  static async updateJobById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { jobDepartment, jobBranch, jobTitle } = req.body;

      if (!id) throw { name: "NotFound" };

      await prisma.job.update({
        where: { id: Number(id) },
        data: {
          jobTitle,
          jobBranch,
          jobDepartment,
          updatedAt: new Date(Date.now()),
        },
      });

      res.status(200).json({ message: "successfully updated job data" });
    } catch (err) {
      next(err);
    }
  }

  static async deleteJobById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) throw { name: "NotFound" };

      await prisma.job.delete({ where: { id: Number(id) } });

      res.status(200).json({ message: "successfully deleted job data" });
    } catch (err) {
      next(err);
    }
  }
}
