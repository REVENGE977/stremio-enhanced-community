import { createLogger, format, transports } from 'winston';

const Logger = createLogger({
    format: format.combine(
        format(info => {
            info.level = info.level.toUpperCase();
            return info;
        })(),
        format.colorize(),
        format.printf((info) => {
            const className = (info.className == undefined ? '' : "[ " + info.className + " ] ") || '';
            return `${info.level}: ${className}${info.message}`;
        })
    ),
    transports: [new transports.Console()]
});

export const getLogger = (className: string) => {
    return {
        info: (message: string) => Logger.info({ message, className }),
        error: (message: string) => Logger.error({ message, className }),
        warn: (message: string) => Logger.warn({ message, className })
    };
};

export default Logger;