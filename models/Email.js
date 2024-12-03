module.exports = (sequelize, Sequelize) => {
  const Email = sequelize.define(
    "Email",
    {
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        },
        allowNull: false,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Default to false
        allowNull: false, // Make sure it's not null
      },
    },
    {
      timestamps: true, // Keeps track of `createdAt` and `updatedAt` by default
    }
  );

  return Email;
};
