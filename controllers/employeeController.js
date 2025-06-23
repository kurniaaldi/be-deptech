const { Employee } = require("../models");

exports.getAll = async (req, res) => res.json(await Employee.findAll());

exports.getById = async (req, res) =>
  res.json(await Employee.findByPk(req.params.id));

exports.create = async (req, res) => res.json(await Employee.create(req.body));

exports.update = async (req, res) => {
  const emp = await Employee.findByPk(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found" });
  await emp.update(req.body);
  res.json(emp);
};

exports.remove = async (req, res) => {
  const emp = await Employee.findByPk(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found" });
  await emp.destroy();
  res.json({ message: "Deleted" });
};
