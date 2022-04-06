const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
	try {
		const transporter = nodemailer.createTransport({
            service:"gmail",
			auth: {
				user: "loussif.chiheb1@gmail.com",
				pass: "SALVATORE@1994",
			},
		});
		await transporter.sendMail({
			from: 'chiheb loussif',
			to: email,
			subject: subject,
			text: text,
		});
		console.log("email sent successfully");
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return error;
	}
};