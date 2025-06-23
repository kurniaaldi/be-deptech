"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Leave extends Model {
    static associate(models) {
      Leave.belongsTo(models.Employee, {
        foreignKey: "employeeId",
        as: "Employee",
      });
    }
  }

  Leave.init(
    {
      reason: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      employeeId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Leave",
    },
  );
  return Leave;
};
