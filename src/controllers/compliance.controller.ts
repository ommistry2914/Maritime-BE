import { controllerHandler } from "../utils/controllerHandler";
import { ComplianceService } from "../services/compliance.service";

export const getComplianceSummary = controllerHandler(
  async (req) => ComplianceService.summary(req),
  { message: "Compliance summary fetched successfully" }
);
