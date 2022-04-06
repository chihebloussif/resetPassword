const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
	try {
		const transporter = nodemailer.createTransport({
            service:"gmail",
			auth: {
				user: "votre address gmail",
				pass: "votre mot de passe gmail",
			},
		});
		await transporter.sendMail({
			from: 'test',
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
