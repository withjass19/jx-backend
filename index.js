// server.js
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "91cd24de",
  apiSecret: "4UP8WksxFBOrxBc5"
})

const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Registration successful' });
});

app.post('/frontend/api/register/landing', (req, res) => {
  try{
    const {region, currencyCode, name, password, mobile, smsCode, referral} = req.body;
    console.log(name)
    if (!region || !currencyCode || !name || !password || !mobile) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    const smsOtp = generateOTP();

    const autoLoginToken = uuidv4();

    res.status(200).json({ status: 200, data: { smsOtp, autoLoginToken } });
  }catch(error){
    return res.status(400).json({status: 500, message:"Invalid request body!"})
  }
    
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

        
app.post('/api/public/sms/send', async(req, res) => {
  async function sendSMS() {
    const {area_code, mobile} = req.body;
    console.log(mobile, area_code);

    const code = area_code;
    const cuntary_code = code.split('+').join('');

    const from = "919056857858"
    const to =  cuntary_code + mobile;

    const otp = generateOTP();
    console.log("otp is ", otp);
    const text = `Your OTP is ${otp}`
    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
  }
  try{
    sendSMS().then(()=>res.status(200).json({msg:"Successfully Sent", status: 0}))
  } catch(e){
      console.log(e);
      res.status(400).json({msg: e});
  }

    // sendSMS();
  
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
