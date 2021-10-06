const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = '526143807172-3uj0eneeqt1hk4a7mb9j2o85kf4rk5d0.apps.googleusercontent.com';
const SECRET = 'IlliSN-cJKHe9bTGBdShd50p';
const OURL = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04FY4mCrmEwfiCgYIARAAGAQSNwF-L9IrGSnZXvffDWvOLBsLQZHH7W-hWfoOAuAgv7rBWjbAqoPI37ZvMM6dnu1bmKl5FcHl4G4';

const oAuth2 = new google.auth.OAuth2(CLIENT_ID,SECRET,OURL);
oAuth2.setCredentials({refresh_token: REFRESH_TOKEN});

async function send(subject,message){
    try{
        const accessToken = await oAuth2.getAccessToken();

        var transporter = nodemailer.createTransport({
            service : 'gmail',
            auth: {
                type: 'OAuth2',
                user :'ineeddevemail@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken

            }
        });

        const mailOptions = {
            from: 'ineeddevemail@gmail.com',
            to: '16pxdesign@gmail.com',
            subject: subject,
            html: message
        };

        const result = await transporter.sendMail(mailOptions, function (err, info) {
            if(err)
                console.log(err)
            else
                console.log(info);
        });
        return result;

    }catch (err){
        return err;
    }
}

//send().then(result => console.log(result));

module.exports = {
    send : send
}