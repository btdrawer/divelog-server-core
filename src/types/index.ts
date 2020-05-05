export interface Request {
    connection: {
        context: {
            Authorization: string;
        };
    };
    req: {
        headers: {
            authorization: string;
        };
    };
}
