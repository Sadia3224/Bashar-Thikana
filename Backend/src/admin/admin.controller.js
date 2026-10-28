import * as adminService from "./admin.service.js";

export const getDashboard = async (req, res) => {
  res.json({ stats: await adminService.getDashboardStats() });
};

export const getPendingProperties = async (req, res) => {
  res.json({ properties: await adminService.listPendingProperties() });
};

export const reviewProperty = async (req, res) => {
  res.json({ property: await adminService.reviewProperty(req.params.id, req.body) });
};

export const getUsers = async (req, res) => {
  res.json({ users: await adminService.listUsers() });
};

export const toggleUserStatus = async (req, res) => {
  res.json({ user: await adminService.toggleUserStatus(req.params.id) });
};

export const getReports = async (req, res) => {
  res.json({ reports: await adminService.listReports() });
};

export const updateReport = async (req, res) => {
  res.json({ report: await adminService.updateReportStatus(req.params.id, req.body.status) });
};
