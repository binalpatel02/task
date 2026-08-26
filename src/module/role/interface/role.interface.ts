export interface IRole {
    title: string;
    permission: {
        customer: {
            [key: string]: boolean;
        };
    };
}