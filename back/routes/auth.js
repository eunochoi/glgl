const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt")
const router = express.Router();
const nodemailer = require("nodemailer");

const db = require("../models/index.js");
const User = db.User;

//code send for sign up
router.post("/code", async (req, res) => {
  let { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne(
      { where: { email } }
    );
    if (user) {
      if (user.level === 1) return res.status(401).json("이미 가입된 이메일입니다.");
      if (user.level === 2) return res.status(401).json("간편 로그인으로 가입된 이메일입니다.");
    }

    //인증 코드 생성
    let code = "";
    for (let i = 0; i < 6; i++) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let index = Math.floor(Math.random() * 52) //0 ~ 25
      code += characters[index];
    }
    // console.log(code);


    //인증 코드 발송
    let transporter = nodemailer.createTransport({
      service: 'gmail'
      , port: 587
      , host: 'smtp.gmail.com'
      , secure: false
      , requireTLS: true
      , auth: {
        user: process.env.AUTH_EMAIL
        , pass: process.env.AUTH_PW
      }
    });
    await transporter.sendMail({
      from: 'goodlockgodlock@gmail.com',
      to: email,
      subject: '굿락갓락, 회원가입 인증코드 안내',
      text: code,
      html: `
      <div style="width: 100%;height: auto;background-color: #C7D7FF; box-sizing: border-box; border-radius: 8px; padding: 12px;">
        <div style="background-color: white; width: 100%; box-sizing: border-box; border-radius: 8px; padding: 24px;margin-top: 40px;">
        <div style="font-size: 14px;">나만의 감성 더하기, 굿락갓락</div>
          <div style="font-size: 24px;margin-top: 8px;margin-bottom: 20px;font-weight: 600;">회원가입 인증코드 안내 </div>
          <div>
            <div style="font-size: 16px;line-height: 24px;">안녕하세요.</div>
            <div style="font-size: 16px;line-height: 24px;">굿락갓락을 방문해주셔서 감사드립니다.</div>
            <div style="font-size: 16px;line-height: 24px;">아래 인증코드로 인증 후 회원가입을 완료해주시기 바랍니다.</div>
            <div style="font-size: 16px;line-height: 24px;">감사합니다.</div>
            <div style="font-size: 24px;margin-top: 20px;margin-bottom: 20px;font-weight: 500;">인증코드 : ${code}</div>
          </div>
        </div>
        <img src="https://github.com/user-attachments/assets/0ad04659-fecc-4272-b627-b7e2e726a9aa" style="margin-top: 40px; width: 100%;object-fit: contain;">
      </div>  
      `

    });

    const hashedCode = await bcrypt.hash(code, 8);
    // console.log(hashedCode);

    return res.status(200).json({ code: hashedCode });
  } catch (err) {
    console.error(err);
    return res.status(401).json("인증코드 발송 실패");
  }
});

//code send for find password
router.post("/code/find/password", async (req, res) => {

  let { email } = req.body;
  console.log(email);
  try {
    //간편 로그인인지 확인
    const user = await User.findOne(
      { where: { email } }
    );

    if (user) {
      if (user.level === 2) {
        return res.status(401).json("간편 로그인으로 등록된 계정입니다.");
      }
    } else {
      return res.status(401).json("등록된 이메일 주소가 아닙니다.");
    }

    //인증 코드 생성
    let code = "";
    for (let i = 0; i < 6; i++) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let index = Math.floor(Math.random() * 52) //0 ~ 25
      code += characters[index];
    }
    // console.log(code);


    //인증 코드 발송
    let transporter = nodemailer.createTransport({
      service: 'gmail'
      , port: 587
      , host: 'smtp.gmail.com'
      , secure: false
      , requireTLS: true
      , auth: {
        user: process.env.AUTH_EMAIL
        , pass: process.env.AUTH_PW
      }
    });
    await transporter.sendMail({
      from: 'goodlockgodlock@gmail.com',
      to: email,
      subject: '굿락갓락, 비밀번호 초기화 인증코드 안내',
      text: code,
      html: `
        <div style="width: 100%;height: auto;background-color: #C7D7FF; box-sizing: border-box; border-radius: 8px; padding: 12px;">
          <div style="background-color: white; width: 100%; box-sizing: border-box; border-radius: 8px; padding: 24px;margin-top: 40px;">
            <div style="font-size: 14px;">나만의 감성 더하기, 굿락갓락</div>
            <div style="font-size: 24px;margin-top: 8px;margin-bottom: 20px;font-weight: 600;">비밀번호 초기화 인증코드 안내 </div>
            <div>
              <div style="font-size: 16px;line-height: 24px;">안녕하세요.</div>
              <div style="font-size: 16px;line-height: 24px;">굿락갓락을 이용해주셔서 감사드립니다.</div>
              <div style="font-size: 16px;line-height: 24px;">아래 인증코드로 인증 후 비밀번호 초기화를 완료해주시기 바랍니다.</div>
              <div style="font-size: 16px;line-height: 24px;">감사합니다.</div>
              <div style="font-size: 24px;margin-top: 20px;margin-bottom: 20px;font-weight: 500;">인증코드 : ${code}</div>
            </div>
          </div>
          <img src="https://github.com/user-attachments/assets/0ad04659-fecc-4272-b627-b7e2e726a9aa" style="margin-top: 40px; width: 100%;object-fit: contain;">
        </div>
        `
    });

    const hashedCode = await bcrypt.hash(code, 8);
    // console.log(hashedCode);

    return res.status(200).json({ code: hashedCode });
  } catch (err) {
    console.error(err);
    return res.status(401).json("인증코드 발송 실패");
  }
});
//code valid check
router.post("/code/check", async (req, res) => {
  try {
    const { code, authCode } = req.body;
    const confirm = await bcrypt.compare(
      code, //입력코드
      authCode //인증코드
    );
    if (confirm) {
      return res.status(200).json({ result: true });
    }
    else {
      return res.status(200).json({ result: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json("확인 과정 중 에러 발생");
  }
})

router.post("/password/reset", async (req, res) => {
  let { email } = req.body;
  // console.log(email);
  try {
    //임시 비밀번호 생성
    let tempPassword = "";
    for (let i = 0; i < 8; i++) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let index = Math.floor(Math.random() * 52) //0 ~ 25
      tempPassword += characters[index];
    }

    //비밀번호 초기화
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await User.update({
      password: hashedPassword
    }, {
      where: { email }
    });


    //인증 코드 발송
    let transporter = nodemailer.createTransport({
      service: 'gmail'
      , port: 587
      , host: 'smtp.gmail.com'
      , secure: false
      , requireTLS: true
      , auth: {
        user: process.env.AUTH_EMAIL
        , pass: process.env.AUTH_PW
      }
    });
    await transporter.sendMail({
      from: 'goodlockgodlock@gmail.com',
      to: email,
      subject: '굿락갓락, 비밀번호 초기화 안내',
      text: tempPassword,
      html: `
        <div style="width: 100%;height: auto;background-color: #C7D7FF; box-sizing: border-box; border-radius: 8px; padding: 12px;">
          <div style="background-color: white; width: 100%; box-sizing: border-box; border-radius: 8px; padding: 24px;margin-top: 40px;">
            <div style="font-size: 14px;">나만의 감성 더하기, 굿락갓락</div>
            <div style="font-size: 24px;margin-top: 8px;margin-bottom: 20px;font-weight: 600;">임시 비밀번호 안내 </div>
            <div>
              <div style="font-size: 16px;line-height: 24px;">안녕하세요.</div>
              <div style="font-size: 16px;line-height: 24px;">굿락갓락을 이용해주셔서 감사드립니다.</div>
              <div style="font-size: 16px;line-height: 24px;">아래 임시 비밀번호로 변경되었습니다.</div>
              <div style="font-size: 16px;line-height: 24px;">보안을 위해 로그인 후 즉시 비밀번호를 변경해주시기 바랍니다.</div>
              <div style="font-size: 16px;line-height: 24px;">감사합니다.</div>
              <div style="font-size: 24px;margin-top: 20px;margin-bottom: 20px;font-weight: 500;">임시 비밀번호 : ${tempPassword}</div>
            </div>
          </div>
          <img src="https://github.com/user-attachments/assets/0ad04659-fecc-4272-b627-b7e2e726a9aa" style="margin-top: 40px; width: 100%;object-fit: contain;">
        </div>
        `
    });

    return res.status(200).json("비밀번호 초기화가 완료되었습니다.");
  } catch (err) {
    console.error(err);
    return res.status(401).json("인증코드 발송 실패");
  }
});

module.exports = router;