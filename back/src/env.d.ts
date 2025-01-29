declare namespace NodeJS {
    interface ProcessEnv {
        DB_PORT?: string;
        DB_HOST?: string;
        DB_USER?: string;
        DB_PASSWORD?: string;
        WS_PORT?: string;
    }
}