//https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a
require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const fs = require('fs');
const path = require('path');

const createTransporter = async () => {

  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });

  //const accessToken = await oauth2Client.getAccessToken().token;
  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token.");
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN
    }
  });
  return transporter;
};

const sendEmail = async (emailOptions) => {
  try {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
  } catch (e) {
    console.log(e)
  }
};


function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

const readTemplate = (templateName) => {
  const templatePath = path.join(__dirname, '../templates', templateName);
  return fs.readFileSync(templatePath, 'utf8');
};

module.exports = { sendEmail, generateVerificationCode, readTemplate  }