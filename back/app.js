const express = require("express");
const db = require("./models");
const app = express();
const cors = require("cors");
const cookies = require("cookie-parser"); //요청시 보내지는 쿠키 사용하기 위함 req.cookies


const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const authRouter = require('./routes/auth');
const imageRouter = require('./routes/image');
const botRouter = require('./routes/bot');
const hashtagRouter = require('./routes/hashtag');
const commentRouter = require('./routes/comment');


// db.sequelize.sync({ force: true }).then(() => {
db.sequelize.sync().then(() => {
    console.log("db 연결 성공")
}).catch(console.error);

app.use(cors({
    origin: true,
    credentials: true
}));

// app.use(cors({ origin: "https://goodlock.site", credentials: true }));


//이미지 업로드를 위한 미들웨어
app.use(express.static("./uploads"));

//req.body를 사용하기 위한 미들웨어
app.use(express.json({ limit: "50mb" }));
app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true,
    })
);
app.use(cookies());


//라우터 연결
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/auth", authRouter);
app.use("/image", imageRouter);
app.use("/bot", botRouter);
app.use("/hashtag", hashtagRouter);
app.use("/comment", commentRouter);

app.get("/", (req, res) => {
    res.send("server 실행중");
});

app.listen(4001, () => {
    console.log(
        `app is listening on 4001 port`
    );
});
