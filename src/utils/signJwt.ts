import * as jwt from "jsonwebtoken";

const signJwt = (id: string): string =>
    jwt.sign({ id }, <string>process.env.JWT_KEY, {
        expiresIn: "3h",
    });

export default signJwt;
