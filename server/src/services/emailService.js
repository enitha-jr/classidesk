const nodemailer = require("nodemailer");

const getTransporter = () => {
	const smtpHost = process.env.SMTP_HOST;
	const smtpPort = Number(process.env.SMTP_PORT || 587);
	const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
	const smtpUser = process.env.SMTP_USER;
	const smtpPass = process.env.SMTP_PASS;

	if (!smtpHost || !smtpUser || !smtpPass) {
		return null;
	}

	return nodemailer.createTransport({
		host: smtpHost,
		port: smtpPort,
		secure: smtpSecure,
		auth: {
			user: smtpUser,
			pass: smtpPass,
		},
	});
};

const sendTicketResolvedEmail = async ({ to, userName, ticketId, ticketTitle, remarks }) => {
	if (!to) {
		return;
	}

	const transporter = getTransporter();

	if (!transporter) {
		console.warn("Email skipped: SMTP credentials are not configured");
		return;
	}

	const from = process.env.MAIL_FROM || process.env.SMTP_USER;

	const subject = `Ticket #${ticketId} resolved`;
	const text = [
		`Hi ${userName || "User"},`,
		"",
		"Your ticket has been resolved.",
		`Ticket ID: ${ticketId}`,
		`Title: ${ticketTitle || "N/A"}`,
		remarks ? `Resolution remarks: ${remarks}` : null,
		"",
		"Thank you.",
	]
		.filter(Boolean)
		.join("\n");

	await transporter.sendMail({
		from,
		to,
		subject,
		text,
	});
};

module.exports = {
	sendTicketResolvedEmail,
};
