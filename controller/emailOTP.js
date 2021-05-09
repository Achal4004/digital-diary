const nodemailer = require("nodemailer");
module.exports=async function main( to,msg) {
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });
  let info = await transporter.sendMail({
          from: '"Digital Diary Team" digitaldiary@gmail.com',
          to: to,
          subject: "One Time Password",
          html: msg,
        });
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  //sending OTP through Gmail
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.GMAIL_ID,
  //     pass: process.env.GMAIL_PASSWORD,
  //   }
  // });
  // const mailOptions = {
  //   from: '"RPMS Team" <rpmsteam7@gamil.com>',
  //   to: to,
  //   subject: 'One-Time-Password',
  //   html: msg
  // };
  // transporter.sendMail(mailOptions, function(error, info){
  //   if (error) {
  //   console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // })

}