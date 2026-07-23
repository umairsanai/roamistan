import { NextFunction, Request, Response } from "express";
import nodemailer from 'nodemailer';
import { Server } from "node:http";
import { Pool } from "pg";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
  }
});

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
            if (!pool.ended)
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

export async function sendPasswordResetEmail(to: string, token: string) {

    // PRODUCTION_LINK
    const resetLink = `${process.env.FRONTEND_URL}/auth.html?token=${token}`;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}.container{max-width:600px;margin:40px auto;background:#fff;padding:40px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.header{text-align:center;padding-bottom:20px;border-bottom:2px solid #f0f0f0}.header h1{color:#333;font-size:24px;margin:0}.content{padding:30px 0;color:#555;line-height:1.6}.content p{margin:15px 0}.button-container{text-align:center;margin:30px 0}.reset-button{display:inline-block;background:#4CAF50;color:#fff!important;padding:14px 40px;font-size:16px;font-weight:bold;text-decoration:none;border-radius:6px;transition:background 0.3s}.reset-button:hover{background:#45a049}.footer{text-align:center;padding-top:20px;border-top:2px solid #f0f0f0;color:#999;font-size:12px}.footer a{color:#4CAF50;text-decoration:none}.expiry-note{background:#f9f9f9;padding:12px;border-radius:4px;font-size:14px;color:#666;text-align:center}</style></head><body><div class="container"><div class="header"><h1>🔐 Password Reset</h1></div><div class="content"><p>Hello,</p><p>We received a request to reset your password. Click the button below to create a new password:</p><div class="button-container"><a href="${resetLink}" class="reset-button">Reset Password</a></div><p>If the button doesn't work, copy and paste this link into your browser:</p><p style="word-break:break-all;background:#f9f9f9;padding:10px;border-radius:4px;font-size:13px;color:#4CAF50;">${resetLink}</p><div class="expiry-note">⏰ This password reset link will expire in <strong>30 minutes</strong></div></div><div class="footer"><p>If you didn't request this, please ignore this email or contact support.</p><p>&copy; ${new Date().getFullYear()} Roamistan. All rights reserved.</p></div></div></body></html>`;

    await transporter.sendMail({
        from: `Admin: <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Password Reset - Roamistan',
        html,
    });
}