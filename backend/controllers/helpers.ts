import { NextFunction, Request, Response } from "express";
import { Server } from "node:http";
import { Pool } from "pg";

export const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export const wait = (seconds: number) => new Promise((res) => setTimeout(res, seconds*1000));

export const isInteger = (num: any): num is number => Number.isInteger(num); 

export const isString = (str: string): str is string => Object.prototype.toString.call(str) === '[object String]' && typeof str === 'string';

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}


export const formatColumnName = (name: string) => name.replaceAll(" ", "_").toLowerCase();

export const gracefulShutdown = (server: Server, pool: Pool) => {
    return async () => {
        try {
            server.close();
            await pool.end();
            console.log("Gracefully shutting down....");        
        } catch (err) {
            console.log("Ungracefully shutting down....");
            process.exit(-1);
        }
    }
}

export const unhandledRequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({
        status: "fail",
        message: "No such route exists!"
    });
}

export const SEARCH_IGNORE_WORDS = [
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren',
  'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn',
  'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
  'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
  'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'would', 'could', 'should', 'ought', 'might', 'must', 'need', 'dare',
  'may', 'shall', 'can', 'will', 'if', 'else', 'while', 'as', 'until',
  'unless', 'than', 'because', 'although', 'though', 'even', 'whether'
];


export function buildSearchPatterns(...texts: string[]): string[] {
  const words = texts.flatMap(text => text.split(/\s+/));
  const patterns = words
    .map(w => w.trim())
    .filter(w => w.length > 0 && !SEARCH_IGNORE_WORDS.includes(w.toLowerCase()))
    .map(w => `%${w}%`);

  return [...new Set(patterns)];
}

export function sendEmptySuccessResponse(res: Response, statusCode: number = 200) {
    return res.status(statusCode).json({
        status: "success",
        data: null
    });
}