const mailer = require("nodemailer");
const {
  userRegistrationMailContent,
  forgotPasswordMailContent,
  propertyRegistrationMailContent,
} = require("../utils/constants/emailConstants.js");
//const logger = require("../log/logger.js");

let mailTransporterCreater = () =>
  mailer.createTransport({
    service: process.env.SERVICE,
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD, //This should be a password generated by google App password
    },
  });

const mailSender = async (emailDetails) => {
  try {
    const mailTransporter = mailTransporterCreater();
    await mailTransporter.sendMail(emailDetails);
    return {
      success: true,
      message: "Email Sent Successfully",
    };
  } catch (error) {
    //logger.log("crit",`Error:- ${error?.message}`,{emailError:true})
    throw error;
  }
};

const forgotPasswordEmail = async (userEmail, otp) => {
  try {
    forgotPasswordMailContent.to = userEmail;
    forgotPasswordMailContent.from = {
      name: process.env.APP_NAME,
      address: process.env.EMAIL_ID,
    };
    forgotPasswordMailContent.html = forgotPasswordMailContent.html.replace(
      "{{OTP}}",
      otp
    );
    const response = await mailSender(forgotPasswordMailContent);
    return response;
  } catch (error) {
    throw error;
  }
};

const userRegistrationEmail = async (userEmail, username) => {
  try {
    userRegistrationMailContent.to = userEmail;
    userRegistrationMailContent.from = {
      name: process.env.APP_NAME,
      address: process.env.EMAIL_ID,
    };
    userRegistrationMailContent.html = userRegistrationMailContent.html.replace(
      "{{username}}",
      username
    );
    const response = await mailSender(userRegistrationMailContent);
    return response;
  } catch (error) {
    throw error;
  }
};

const propertyRegistrationEmail = async (
  userEmail,
  username,
  propertyName,
  category,
  listingType,
  address,
  price
) => {
  try {
    const wholeAddress = `${address?.locality}, ${address?.street}, ${address?.city}, ${address?.zipCode}, ${address?.state}, ${address?.country}`;

    const propertyCost = `${parseInt(price).toLocaleString("en-US", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })} ${listingType === "Rent" ? "Per Month" : ""}`;

    propertyRegistrationMailContent.to = userEmail;

    propertyRegistrationMailContent.from = {
      name: process.env.APP_NAME,
      address: process.env.EMAIL_ID,
    };

    propertyRegistrationMailContent.html = propertyRegistrationMailContent.html
      .replace("{{username}}", username)
      .replace("{{name}}", propertyName)
      .replace("{{category}}", category)
      .replace("{{address}}", wholeAddress)
      .replace("{{price}}", propertyCost);

    const response = await mailSender(propertyRegistrationMailContent);
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  forgotPasswordEmail,
  userRegistrationEmail,
  propertyRegistrationEmail,
};
