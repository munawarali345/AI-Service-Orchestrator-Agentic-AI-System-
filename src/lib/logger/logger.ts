// ================================================================
// Winston Logger Configuration
// ================================================================
// Purpose: Better logging than console.log()
// Features: Timestamps, log levels, JSON format
// Winston Node.js ka popular logging library hai jo console aur files me structured logs banata hai
import winston from 'winston';

// Create logger with configuration
//Ye logger object aage hum log messages bhejne ke liye use karenge (info, warn, error)
const logger = winston.createLogger({
    // Log level: info means log info and above (info, warn, error)
    // Ye info aur us se upar ke logs (warn, error) capture karega
    level: 'info', // Logger ka minimum log level set kiya

    // Format: combine timestamp and JSON
    // Logs ka format define kar rahe hain
    format: winston.format.combine(   // multiple formats ko combine karta hai
        winston.format.timestamp(),  // har log ke sath time attach hota hai
        winston.format.json()       // log ko JSON format me convert karta hai 
    ),

    // Where to send logs
    transports: [
        // Console: Show logs in terminal (like console.log)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),  // Add colors info/warn/error k alag 
                winston.format.simple()   // human readable text format, JSON nahi
            )
        }),

        // Error file: Save only errors
        // errors k saperate record
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error' //sirf error messages is file me store honge
        }),

        // Combined file: Save all logs
        // Sab logs (info, warn, error) ko combined file me store kar raha hai
        // Complete log history ek jagah → auditing / troubleshooting ke liye
        new winston.transports.File({
            filename: 'logs/combined.log'
        }),
    ],
});

export default logger;

