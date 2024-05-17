const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

const { EMAIL, PASSWORD } = require('../env.js');


/** send mail to testing account */
const signup = async (req, res) => {
    try {
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            },
        });

        let message = {
            from: '"Fred Foo" <test@example.com>',
            to: 'test@example.com',
            subject: 'Hello',
            text: 'Hello world?',
            html: '<b>Hello World?</b>'
        };

        let info = await transporter.sendMail(message);
        return res.status(201).json({
            msg: "Email diterima",
            info: info.messageId,
            preview: nodemailer.getTestMessageUrl(info)
        });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};



/** send mail from real gmail */
const getbill = async (req, res) => {
    const { userEmail } = req.body;

    if (!userEmail) {
        return res.status(400).json({ msg: "User email diperlukan" });
    }

    let config = {
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    };

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Mailgen",
            link: "http://mailgen.js"
        }
    });

    let response = {
        body: {
            name: "POS Keraton",
            intro: "Ini adalah tagihan Anda",
            table: {
                data: [
                    {
                        item: "Nodemailer Stack Book",
                        description: "BackEnd",
                        price: "10.99",
                    }
                ]
            },
            outro: "Menunggu tanggapan Anda"
        }
    };

    let mail = MailGenerator.generate(response);

    let message = {
        from: EMAIL,
        to: userEmail,
        subject: "Pesanan Ditempatkan",
        html: mail
    };

    try {
        await transporter.sendMail(message);
        return res.status(201).json({ msg: "Email diterima" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


module.exports = {
    signup,
    getbill
}