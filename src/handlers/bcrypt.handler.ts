// Import Package
import bcrypt from "bcrypt";
import UserDocument from "../interfaces/user.interface";

// Generate Salt & Hash Password
async function generateSaltAndHashPassword(plainTextPassword: string) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainTextPassword, 10, function (err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });
}

// Compare Hashed Password
async function compareHashedPassword(plainTextPassword: string, hashedPassword: UserDocument["password"]) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainTextPassword, hashedPassword, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Exports
export { generateSaltAndHashPassword, compareHashedPassword };
