module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    id: {
      type: Sequelize.STRING, // Use STRING for SQLite instead of UUID
      defaultValue: Sequelize.UUIDV4, // Automatically generate a UUID
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          // Validates that the email follows a correct email format
          msg: "Please provide a valid email!",
        },
      },
      unique: {
        args: true, // Ensures the email is unique in the database
        msg: "Email already exists",
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          // Ensures the password is not empty
          msg: "Please provide a password!",
        },
      },
    },
  });

  User.beforeCreate(async (user, options) => {
    const existingUser = await User.findOne({
      where: { email: user.email },
    });
    if (existingUser) {
      throw new Error("Email already exists"); // Throwing an error if the email already exists
    }
  });

  User.beforeUpdate(async (user, options) => {
    if (user.email) {
      // Check only if the email is being updated
      const existingUser = await User.findOne({
        where: { email: user.email },
      });
      if (existingUser) {
        throw new Error("Email already exists");
      }
    }
  });

  return User;
};
