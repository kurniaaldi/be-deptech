const { Leave, Employee, Sequelize } = require("../models");
const { Op, fn, col, literal } = Sequelize;

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Employee.findAndCountAll({
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    const leaves = await Leave.findAll({
      include: [
        {
          model: Employee,
          as: "Employee", // sesuai dengan alias di Leave.associate
        },
      ],
    });

    res.json({
      data: leaves,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving employees", error: err.message });
  }
};

exports.create = async (req, res) => {
  const { employeeId, reason, startDate, endDate } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const year = start.getFullYear();
  const month = start.getMonth() + 1;

  // Validasi 1: maksimal 12 hari dalam setahun
  const total = await Leave.findAll({
    attributes: [
      [literal("SUM(DATEDIFF(endDate, startDate) + 1)"), "totalDays"],
    ],
    where: {
      employeeId,
      startDate: {
        [Op.between]: [new Date(`${year}-01-01`), new Date(`${year}-12-31`)],
      },
    },
    raw: true,
  });

  const totalDays = parseInt(total[0].totalDays || 0);
  if (totalDays + diffDays > 12) {
    return res.status(400).json({ message: "Cuti tahunan melebihi 12 hari" });
  }

  // Validasi 2: hanya boleh 1 hari di bulan yang sama
  const existing = await Leave.findOne({
    where: {
      employeeId,
      [Op.and]: [
        fn("MONTH", col("startDate")),
        month,
        fn("YEAR", col("startDate")),
        year,
      ],
    },
  });

  if (existing) {
    return res.status(400).json({ message: "Sudah mengambil cuti bulan ini" });
  }

  // Simpan data cuti
  const leave = await Leave.create({ employeeId, reason, startDate, endDate });
  res.json(leave);
};

exports.getById = async (req, res) =>
  res.json(await Leave.findByPk(req.params.id));

exports.update = async (req, res) => {
  const leave = await Leave.findByPk(req.params.id);
  if (!leave) return res.status(404).json({ message: "Not found" });

  const { employeeId, reason, startDate, endDate } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const year = start.getFullYear();
  const month = start.getMonth() + 1;

  // ✅ Validasi 1: total cuti dalam setahun tidak boleh lebih dari 12 hari
  const total = await Leave.findAll({
    attributes: [
      [literal("SUM(DATEDIFF(endDate, startDate) + 1)"), "totalDays"],
    ],
    where: {
      employeeId,
      id: { [Op.ne]: leave.id }, // ⛔ abaikan record yang sedang diedit
      startDate: {
        [Op.between]: [new Date(`${year}-01-01`), new Date(`${year}-12-31`)],
      },
    },
    raw: true,
  });

  const totalDays = parseInt(total[0].totalDays || 0);
  if (totalDays + diffDays > 12) {
    return res.status(400).json({ message: "Cuti tahunan melebihi 12 hari" });
  }

  // ✅ Validasi 2: tidak boleh cuti dua kali di bulan yang sama
  const existing = await Leave.findOne({
    where: {
      employeeId,
      id: { [Op.ne]: leave.id }, // ⛔ abaikan record yang sedang diedit
      [Op.and]: [
        fn("MONTH", col("startDate")),
        month,
        fn("YEAR", col("startDate")),
        year,
      ],
    },
  });

  if (existing) {
    return res.status(400).json({ message: "Sudah mengambil cuti bulan ini" });
  }

  // ✅ Simpan perubahan
  await leave.update({ employeeId, reason, startDate, endDate });
  res.json(leave);
};

exports.remove = async (req, res) => {
  const emp = await Leave.findByPk(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found", status: 404 });
  await emp.destroy();
  res.status(200).json({ message: "Deleted", status: 200 });
};
