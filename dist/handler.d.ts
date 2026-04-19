declare const serverlessHandler: import("serverless-http").Handler;
export declare function handler(event: Parameters<typeof serverlessHandler>[0], context: Parameters<typeof serverlessHandler>[1]): Promise<Object>;
export {};
