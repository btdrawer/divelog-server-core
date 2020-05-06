import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

export const signJwt = (id: string): string =>
    jwt.sign({ id }, <string>process.env.JWT_KEY, {
        expiresIn: "3h",
    });

export const hashPassword = (password: string): string =>
    bcrypt.hashSync(password, 10);
