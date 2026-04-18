const express = require("express");

const tokenCheck = require("../middleware/tokenCheck.js");

const db = require("../models/index.js");
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;

const router = express.Router();

//model load
const User = db.User;
const Post = db.Post;
const Comment = db.Comment;
const Image = db.Image;
const Hashtag = db.Hashtag;

//load posts - single post
router.get("/single", async (req, res) => {
  const { id } = req.query;
  try {
    const where = {};
    const SinglePost = await Post.findOne({
      where: [{
        id,
        UserId: { [Op.is]: !null },
      }],
      order: [
        [Comment, 'createdAt', 'ASC'],
        [Comment, { model: Comment, as: 'ReplyChild' }, 'createdAt', 'ASC'],//grand child order!!!//불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
      include: [
        {
          model: User,//게시글 작성자
          attributes: ['id', 'nickname', 'profilePic', 'email'],
        },
        {
          model: User, //좋아요 누른 사람
          as: 'Likers', //모델에서 가져온대로 설정
          attributes: ['id', 'nickname'],
        },
        {
          model: Image, //게시글의 이미지
        },
        {
          model: Comment, //게시글에 달린 댓글
          include: [
            {
              model: User, //댓글의 작성자
              attributes: ['id', 'nickname', 'profilePic'],
            },
            {
              model: Comment, //대댓글
              as: 'ReplyChild',
              include: [
                {
                  model: User, //대댓글의 작성자
                  attributes: ['id', 'nickname', 'profilePic'],
                }
              ],
            }
          ],
        }
      ],
    });
    if (!SinglePost) return res.status(403).json("포스트 id가 올바르지 않습니다.");
    return res.status(201).json(SinglePost);
  } catch (e) {
    console.error(e);
  }
})
//load posts - all
router.get("/", async (req, res) => {
  const { type, pageParam, tempDataNum } = req.query;
  try {
    const where = {};
    const Posts = await Post.findAll({
      where: [{
        type,
        UserId: { [Op.is]: !null },
      }],
      // limit: 10,
      include: [
        {
          model: User,//게시글 작성자
          attributes: ['id', 'nickname', 'profilePic', 'email'],
        },
        {
          model: User, //좋아요 누른 사람
          as: 'Likers', //모델에서 가져온대로 설정
          attributes: ['id', 'nickname'],
        },
        {
          model: Image, //게시글의 이미지
        },
        {
          model: Comment, //게시글에 달린 댓글
          include: [
            {
              model: User, //댓글의 작성자
              attributes: ['id', 'nickname', 'profilePic'],
            },
            {
              model: Comment, //대댓글
              as: 'ReplyChild',
              include: [
                {
                  model: User, //대댓글의 작성자
                  attributes: ['id', 'nickname', 'profilePic'],
                }
              ],
            }
          ],
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'ASC'],
        [Comment, { model: Comment, as: 'ReplyChild' }, 'createdAt', 'ASC'],//grand child order!!!//불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
    });

    return res.status(201).json(Posts.slice(tempDataNum * (pageParam - 1), tempDataNum * pageParam));
  } catch (e) {
    console.error(e);
  }
})
//load posts - info active
router.get("/activinfo", async (req, res) => {
  const { type, pageParam, tempDataNum } = req.query;

  const todayfull = new Date();
  let year = todayfull.getFullYear(); // 년도
  let month = todayfull.getMonth();  // 월
  let date = todayfull.getDate();  // 날짜
  const today = new Date(year, month, date);

  try {
    const where = {};
    const Posts = await Post.findAll({
      where: [{
        type: 1,
        UserId: { [Op.is]: !null },
        [Op.or]: [
          { end: { [Op.gte]: today } },
          { end: null }
        ]
      }],
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'ASC'],
        [Comment, { model: Comment, as: 'ReplyChild' }, 'createdAt', 'ASC'],//grand child order!!!//불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
      include: [
        {
          model: User,//게시글 작성자
          attributes: ['id', 'nickname', 'profilePic', 'email'],
        },
        {
          model: User, //좋아요 누른 사람
          as: 'Likers', //모델에서 가져온대로 설정
          attributes: ['id', 'nickname'],
        },
        {
          model: Image, //게시글의 이미지
        },
        {
          model: Comment, //게시글에 달린 댓글
          include: [
            {
              model: User, //댓글의 작성자
              attributes: ['id', 'nickname', 'profilePic'],
            },
            {
              model: Comment, //대댓글
              as: 'ReplyChild',
              include: [
                {
                  model: User, //대댓글의 작성자
                  attributes: ['id', 'nickname', 'profilePic'],
                }
              ],
            }
          ],
        }
      ],
    });

    return res.status(201).json(Posts.slice(tempDataNum * (pageParam - 1), tempDataNum * pageParam));
  } catch (e) {
    console.error(e);
  }
})
//load - top post this month
router.get("/month/top", async (req, res) => {

  const { type } = req.query;

  const todayfull = new Date();
  let year = todayfull.getFullYear(); // 년도
  let month = todayfull.getMonth();  // 월

  const rangeStart = new Date(year, month);
  const rangeEnd = new Date(year, month + 1);

  try {
    const where = {};
    const Posts = await Post.findAll({
      where: [{
        type,
        UserId: { [Op.is]: !null },
        [Op.and]: [
          { createdAt: { [Op.gte]: rangeStart } },
          { createdAt: { [Op.lte]: rangeEnd } }
        ],
      }],
      limit: 10,
      through: { attributes: [] },
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM goodlockgodlock.Like WHERE Post_id = Post.id)'),
            'LikeCount'
          ]
        ],
      },
      group: ['id'],
      include: [
        {
          model: User,//게시글 작성자
          attributes: ['id', 'nickname', 'profilePic', 'email'],
        },
        {
          model: User, //좋아요 누른 사람
          as: 'Likers', //모델에서 가져온대로 설정
          attributes: ['id'],
        },
        {
          model: Image, //게시글의 이미지
        },
        {
          model: Comment,
          attributes: ['id']
        },
      ],
      order: [[sequelize.col("LikeCount"), "DESC"], [sequelize.literal('rand()')]]
    });

    return res.status(200).json(Posts);

  } catch (e) {
    console.error(e);
  }
})


//length - new post this month
router.get("/month/new", async (req, res) => {

  const { type } = req.query;

  const todayfull = new Date();
  let year = todayfull.getFullYear(); // 년도
  let month = todayfull.getMonth();  // 월

  const rangeStart = new Date(year, month);
  const rangeEnd = new Date(year, month + 1);

  try {
    const where = {};
    const Posts = await Post.findAndCountAll({
      where: [{
        type,
        UserId: { [Op.is]: !null },
        [Op.and]: [
          { createdAt: { [Op.gte]: rangeStart } },
          { createdAt: { [Op.lte]: rangeEnd } }
        ],
      }]
      // , attributes: ['id', 'createdAt'],
    });

    return res.status(201).json(Posts.count);
  } catch (e) {
    console.error(e);
  }
})
//length - end liked post this month
router.get("/month/likeEnd", tokenCheck, async (req, res) => {

  const todayfull = new Date();
  let year = todayfull.getFullYear(); // 년도
  let month = todayfull.getMonth();  // 월

  const rangeStart = new Date(year, month);
  const rangeEnd = new Date(year, month + 1);



  try {
    const UserId = req.currentUserId;

    //좋아요 누른 포스트 id 배열 ,ex : [1, 2, 3]
    const likedPosts = await Post.findAll({
      attributes: ["id"],
      include: [{
        model: User,
        as: "Likers",
        where: { id: UserId }
      }]
    })
    if (likedPosts.length >= 1) {
      const Posts = await Post.findAndCountAll({
        attributes: ['id'],
        where: [{
          type: 1,
          UserId: { [Op.is]: !null },
          id: { [Op.in]: likedPosts.map(v => v.id) },
          [Op.and]: [
            { end: { [Op.gte]: rangeStart } },
            { end: { [Op.lte]: rangeEnd } }
          ],
        }]
      });
      return res.status(201).json(Posts.count);
    }
    else return res.status(201).json(0);
  } catch (e) {
    console.error(e);
  }
})
//length - feed posts in this month
router.get("/month/feed", tokenCheck, async (req, res) => {

  const { type } = req.query;
  const todayfull = new Date();
  let year = todayfull.getFullYear(); // 년도
  let month = todayfull.getMonth();  // 월

  const rangeStart = new Date(year, month);
  const rangeEnd = new Date(year, month + 1);

  try {
    const UserId = req.currentUserId;

    const followings = await User.findAll({
      attributes: ["id"],
      include: [{
        model: User,
        as: "Followers",
        where: {
          id: UserId
        }
      }]
    })

    if (!followings.length) {
      return res.status(201).json(0);
    }

    const Posts = await Post.findAndCountAll({
      where: [{
        type,
        UserId: { [Op.in]: followings.map(v => v.id) },
        [Op.and]: [
          { createdAt: { [Op.gte]: rangeStart } },
          { createdAt: { [Op.lte]: rangeEnd } }
        ],
      }],
    });
    return res.status(201).json(Posts.count);
  } catch (e) {
    console.error(e);
  }
})
//length - ongoing in this month
router.get("/month/activeinfo", async (req, res) => {
  const todayfull = new Date();
  let year = todayfull.getFullYear(); // 년도
  let month = todayfull.getMonth();  // 월
  let date = todayfull.getDate();  // 날짜

  const today = new Date(year, month, date);
  const rangeStart = new Date(year, month);
  const rangeEnd = new Date(year, month + 1);

  try {
    const Posts = await Post.findAndCountAll({
      where: [{
        type: 1,
        UserId: { [Op.is]: !null },
        [Op.and]: [
          { createdAt: { [Op.gte]: rangeStart } },
          { createdAt: { [Op.lte]: rangeEnd } }
        ],
        [Op.or]: [
          { end: { [Op.gte]: today } },
          { end: null }
        ]
      }],
    });

    return res.status(201).json(Posts.count);
  } catch (e) {
    console.error(e);
  }
})

//load posts - feed post(팔로잉 유저 포스트 모아보기)
router.get("/feed", tokenCheck, async (req, res) => {
  const { pageParam, tempDataNum, type } = req.query;
  try {
    const UserId = req.currentUserId;

    const followings = await User.findAll({
      attributes: ["id"],
      include: [{
        model: User,
        as: "Followers",
        where: {
          id: UserId
        }
      }]
    })

    if (!followings.length) {
      return res.status(201).json([]);
    }

    const Posts = await Post.findAll({
      where: [{
        type,
        UserId: { [Op.in]: followings.map(v => v.id) }
      }],
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'ASC'],
        [Comment, { model: Comment, as: 'ReplyChild' }, 'createdAt', 'ASC'],//grand child order!!!//불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
      include: [
        {
          model: User,//게시글 작성자
          attributes: ['id', 'nickname', 'profilePic', 'email'],
        },
        {
          model: User, //좋아요 누른 사람
          as: 'Likers', //모델에서 가져온대로 설정
          attributes: ['id', 'nickname'],
        },
        {
          model: Image, //게시글의 이미지
        },
        {
          model: Comment, //게시글에 달린 댓글
          include: [
            {
              model: User, //댓글의 작성자
              attributes: ['id', 'nickname', 'profilePic'],
            },
            {
              model: Comment, //대댓글
              as: 'ReplyChild',
              include: [
                {
                  model: User, //대댓글의 작성자
                  attributes: ['id', 'nickname', 'profilePic'],
                }
              ],
            }
          ],
        }
      ],
    });
    // return res.status(201).json(Posts);
    return res.status(201).json(Posts.slice(tempDataNum * (pageParam - 1), tempDataNum * pageParam));
  } catch (e) {
    console.error(e);
  }
})


//load posts - my post, type 구분
router.get("/my", tokenCheck, async (req, res) => {
  const { type, pageParam, tempDataNum } = req.query;
  try {
    const UserId = req.currentUserId;
    const Posts = await Post.findAll({
      where: [{
        type,
        UserId
      }],
      // limit: 10,
      order: [
        ['createdAt', 'DESC'],
        // [Comment, 'createdAt', 'ASC'], //불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
      include: [
        // {
        //   model: User,//게시글 작성자
        //   attributes: ['id', 'nickname', 'profilePic', 'email'],
        // },
        {
          model: Image, //게시글의 이미지
        },
        // {
        //   model: Comment, //게시글에 달린 댓글
        //   include: [
        //     {
        //       model: User, //댓글의 작성자
        //       attributes: ['id', 'nickname', 'profilePic'],
        //     }
        //   ],
        // }
      ],
    });

    return res.status(201).json(Posts.slice(tempDataNum * (pageParam - 1), tempDataNum * pageParam));
  } catch (e) {
    console.error(e);
  }
})
//load posts - my liked
router.get("/liked", tokenCheck, async (req, res) => {
  const { type, pageParam, tempDataNum } = req.query;
  try {
    const UserId = req.currentUserId;
    const likedPosts = await Post.findAll({
      attributes: ["id"],
      include: [{
        model: User,
        as: "Likers",
        where: { id: UserId }
      }]
    })
    const Posts = await Post.findAll({
      where: [{
        type,
        UserId: { [Op.is]: !null },
        id: { [Op.in]: likedPosts.map(v => v.id) }
      }],
      // limit: 10,
      order: [
        ['createdAt', 'DESC'],
        // [Comment, 'createdAt', 'ASC'], //불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
      include: [
        {
          model: User,//게시글 작성자
          attributes: ['id', 'nickname', 'profilePic', 'email'],
        },
        {
          model: User, //좋아요 누른 사람
          as: 'Likers', //모델에서 가져온대로 설정
          attributes: ['id', 'nickname'],
        },
        {
          model: Image, //게시글의 이미지
        },
        // {
        //   model: Comment, //게시글에 달린 댓글
        //   include: [
        //     {
        //       model: User, //댓글의 작성자
        //       attributes: ['id', 'nickname', 'profilePic'],
        //     }
        //   ],
        // }
      ],
    });

    return res.status(201).json(Posts.slice(tempDataNum * (pageParam - 1), tempDataNum * pageParam));
  } catch (e) {
    console.error(e);
  }
})

//load posts - search contents
router.get("/search", async (req, res) => {
  const { type, search, pageParam, tempDataNum } = req.query;

  try {
    const where = {};
    const Posts = await Post.findAll({
      where: [{
        type: type,
        UserId: { [Op.is]: !null },
        content: {
          [Op.like]: "%" + `${search}` + "%"
        }
      }],
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'ASC'],
        [Comment, { model: Comment, as: 'ReplyChild' }, 'createdAt', 'ASC'],//grand child order!!!//불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
      include: [
        {
          model: User,//게시글 작성자
          attributes: ['id', 'nickname', 'profilePic', 'email'],
        },
        {
          model: User, //좋아요 누른 사람
          as: 'Likers', //모델에서 가져온대로 설정
          attributes: ['id', 'nickname'],
        },
        {
          model: Image, //게시글의 이미지
        },
        {
          model: Comment, //게시글에 달린 댓글
          include: [
            {
              model: User, //댓글의 작성자
              attributes: ['id', 'nickname', 'profilePic'],
            },
            {
              model: Comment, //대댓글
              as: 'ReplyChild',
              include: [
                {
                  model: User, //대댓글의 작성자
                  attributes: ['id', 'nickname', 'profilePic'],
                }
              ],
            }
          ],
        }
      ],
    });
    // return res.status(201).json({ search, Posts });
    return res.status(201).json(Posts.slice(tempDataNum * (pageParam - 1), tempDataNum * pageParam));
  } catch (e) {
    console.error(e);
  }
})


//load posts - target user post (type)
router.get("/user", async (req, res) => {
  const { type, id } = req.query;
  const { pageParam, tempDataNum } = req.query;

  try {
    const Posts = await Post.findAll({
      where: [{
        type,
        UserId: id
      }],
      // limit: 10,
      order: [
        ['createdAt', 'DESC'],
        // [Comment, 'createdAt', 'ASC'], //불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
      include: [
        // {
        //   model: User,//게시글 작성자
        //   attributes: ['id', 'nickname', 'profilePic', 'email'],
        // },
        // {
        //   model: User, //좋아요 누른 사람
        //   as: 'Likers', //모델에서 가져온대로 설정
        //   attributes: ['id', 'nickname'],
        // },
        {
          model: Image, //게시글의 이미지
        },
        // {
        //   model: Comment, //게시글에 달린 댓글
        //   include: [
        //     {
        //       model: User, //댓글의 작성자
        //       attributes: ['id', 'nickname', 'profilePic'],
        //     }
        //   ],
        // }
      ],
    });

    return res.status(201).json(Posts.slice(tempDataNum * (pageParam - 1), tempDataNum * pageParam));
  } catch (e) {
    console.error(e);
  }
})
//load posts - target user bookmarked tip
router.get("/user/liked", async (req, res) => {
  const { id, type } = req.query;
  const { pageParam, tempDataNum } = req.query;

  try {
    const likedPosts = await Post.findAll({
      attributes: ["id"],
      include: [{
        model: User,
        as: "Likers",
        where: { id }
      }]
    })
    const Posts = await Post.findAll({
      where: [{
        type,
        id: { [Op.in]: likedPosts.map(v => v.id) }
      }],
      // limit: 10,
      order: [
        ['createdAt', 'DESC'],
        // [Comment, 'createdAt', 'ASC'], //불러온 comment도 정렬
        [Image, 'id', 'ASC'],
      ],
      include: [
        // {
        //   model: User,//게시글 작성자
        //   attributes: ['id', 'nickname', 'profilePic', 'email'],
        // },
        // {
        //   model: User, //좋아요 누른 사람
        //   as: 'Likers', //모델에서 가져온대로 설정
        //   attributes: ['id', 'nickname'],
        // },
        {
          model: Image, //게시글의 이미지
        },
        // {
        //   model: Comment, //게시글에 달린 댓글
        //   include: [
        //     {
        //       model: User, //댓글의 작성자
        //       attributes: ['id', 'nickname', 'profilePic'],
        //     }
        //   ],
        // }
      ],
    });

    return res.status(201).json(Posts.slice(tempDataNum * (pageParam - 1), tempDataNum * pageParam));
  } catch (e) {
    console.error(e);
  }
})


//add, edit, delete post
router.post("/", tokenCheck, async (req, res) => {
  try {
    //현재 로그인된 유저의 id와 포스트 text로 post 모델의 요소 생성
    const { type } = req.body;
    const userId = req.currentUserId;

    const user = await User.findOne({
      where: {
        id: userId
      }
    })
    if (user && user.level === 0) {
      return res.status(400).json("게스트 유저는 불가능합니다.");
    }
    if (user && type === 0 && user.level !== 10) {
      return res.status(400).json("admin 유저가 아닙니다.");
    }

    const post = await Post.create({
      type: req.body.type,
      content: req.body.content,
      UserId: req.currentUserId,
      start: req.body.start,
      end: req.body.end,
      link: req.body.link
    });

    if (post.type !== 0) {
      const hashtags = req.body.content.match(/#[^\s#]{1,15}/g);
      if (hashtags) {
        const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
          where: { name: tag.slice(1).toLowerCase() }
        })))
        await post.addHashtag(result.map(v => v[0]));
      }
    }

    //image 모델 요소 생성 후 Post 모델과 연결
    const postImages = req.body.images;

    if (postImages.length >= 1) {
      const images = [];
      for (i = 0; i < postImages.length; i++) {
        const temp = await Image.create({ src: postImages[i] });
        images.push(temp);
      }
      post.addImages(images);
      return setTimeout(() => {
        res.status(200).json({ postImages, images, post });
      }, 1000);
    }
    return setTimeout(() => {
      res.status(200).json(post);
    }, 1000);
  } catch (e) {
    console.error(e);
  }

})
router.patch("/:postId", tokenCheck, async (req, res) => {
  try {
    const postId = req.params.postId;

    //current user
    const currentUser = await User.findOne({
      where: { id: req.currentUserId },
    });

    const post = await Post.findOne({
      where: { id: postId },
      include: [
        {
          model: Hashtag,
          attributes: ['id'],
        }
      ]
    });

    if (!post) return res.status(403).json("게시글이 올바르지 않습니다.");
    if (post && post.UserId !== req.currentUserId && currentUser.level !== 10) {
      return res.status(403).json("다른 사람의 게시글 입니다.");
    }


    // 현재 로그인된 유저의 id와 포스트 text로 post 모델의 요소 생성
    await Post.update({
      content: req.body.content,
      start: req.body.start,
      end: req.body.end,
      link: req.body.link
    }, {
      where: { id: postId }
    }
    );

    if (post.type !== 0) {
      const beforeTags = post.Hashtags.map(v => v.id);
      post.removeHashtag(beforeTags);

      const hashtags = req.body.content.match(/#[^\s#]{1,15}/g);
      if (hashtags) {
        const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
          where: { name: tag.slice(1).toLowerCase() }
        })))
        await post.addHashtag(result.map(v => v[0]));
      }
    }


    //기존에 등록되어 있는 이미지 모델 삭제
    await Image.destroy({
      where: {
        PostId: postId
      }
    })

    //수정된 이미지들을 image 모델 요소 생성 후 Post 모델과 연결
    const postImages = req.body.images;
    if (postImages.length >= 1) {
      const images = [];
      for (i = 0; i < postImages.length; i++) {
        const temp = await Image.create({ src: postImages[i] });
        images.push(temp);
      }
      post.addImages(images);

      return setTimeout(() => {
        res.status(200).json({ postImages, images, post });
      }, 1000);
    }
    return setTimeout(() => {
      res.status(200).json(post);
    }, 1000);
  } catch (e) {
    console.error(e);
  }
})
router.delete("/:postId", tokenCheck, async (req, res) => {
  try {
    const postId = req.params.postId;

    //current user
    const currentUser = await User.findOne({
      where: { id: req.currentUserId },
    });
    //selected post
    const post = await Post.findOne({
      where: { id: postId }
    });

    if (!post) return res.status(403).json("게시글이 올바르지 않습니다.");
    if (post && post.UserId !== req.currentUserId && currentUser.level !== 10) {
      return res.status(403).json("다른 사람의 게시글 입니다.");
    }
    console.log(post);

    await Post.destroy({
      where: { id: postId }
    });
  } catch (e) {
    console.error(e);
  }
  res.status(200).json("post delete success");
})


//comment - add, edit, delete
router.post("/:postId/comment", tokenCheck, async (req, res) => {
  try {
    const postId = req.params.postId;

    const user = await User.findOne({
      where: {
        id: req.currentUserId
      }
    })
    if (user && user.level === 0) {
      return res.status(400).json("게스트 유저는 불가능합니다.");
    }

    const currentPost = await Post.findOne(
      { where: { id: postId } }
    );
    if (!currentPost) {
      return res.status(403).json("존재하지 않는 게시글입니다.");
    }

    const comment = await Comment.create({
      content: req.body.content,
      PostId: postId,
      UserId: req.currentUserId,
    });
    return setTimeout(() => {
      res.status(201).json(comment);
    }, 1000);
  }
  catch (e) {
    console.error(e);
  }
});
router.delete("/:postId/comment/:commentId", tokenCheck, async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    //current user
    const currentUser = await User.findOne({
      where: { id: req.currentUserId },
    });

    const comment = await Comment.findOne({
      where: { id: commentId, PostId: postId }
    });

    if (!comment) return res.status(403).json("게시글이 올바르지 않습니다.");
    if (comment && (comment.UserId !== req.currentUserId) && (currentUser.level !== 10)) {
      return res.status(403).json("다른 사람의 게시글 입니다.");
    }

    await Comment.destroy({
      where: { id: commentId, PostId: postId }
    });
  } catch (e) {
    console.error(e);
  }
  res.status(200).json("comment delete success");
})
router.patch("/:postId/comment/:commentId", tokenCheck, async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    //current user
    const currentUser = await User.findOne({
      where: { id: req.currentUserId },
    });

    //comment 확인
    const comment = await Comment.findOne({
      where: { id: commentId, PostId: postId }
    });

    if (!comment) return res.status(403).json("게시글이 올바르지 않습니다.");
    if (comment && (comment.UserId !== req.currentUserId) && (currentUser.level !== 10)) {
      return res.status(403).json("다른 사람의 게시글 입니다.");
    }

    //comment 수정
    await Comment.update({
      content: req.body.content,
    }, {
      where: { id: commentId, PostId: postId }
    }
    );

    return setTimeout(() => {
      res.status(200).json("post edit success");
    }, 1000);
  } catch (e) {
    console.error(e);
  }
})


//post like, unlike
router.patch("/:postId/like", tokenCheck, async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.currentUserId
      }
    })
    if (user && user.level === 0) {
      return res.status(400).json("게스트 유저는 불가능합니다.");
    }

    const postId = req.params.postId;

    const isMyPost = await Post.findOne(
      { where: { id: postId, UserId: req.currentUserId } }
    );
    if (isMyPost) return res.status(400).json("자신의 게시글에서 동작하지 않습니다.");

    const post = await Post.findOne(
      { where: { id: postId } }
    );
    if (!post) return res.status(400).json("게시글이 존재하지 않습니다.");

    if (req.currentUserId) {
      await post.addLikers(req.currentUserId);
      return res.status(200).json({ type: post.type, result: "좋아요 완료" });
    }
    else {
      return res.status(400).json("오류 발생");
    }
  }
  catch (e) { console.error(e) }
})
router.delete("/:postId/like", tokenCheck, async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.currentUserId
      }
    })
    if (user && user.level === 0) {
      return res.status(400).json("게스트 유저는 불가능합니다.");
    }

    const postId = req.params.postId;

    const isMyPost = await Post.findOne(
      { where: { id: postId, UserId: req.currentUserId } }
    );
    if (isMyPost) return res.status(400).json("자신의 게시글에서 동작하지 않습니다.");

    const post = await Post.findOne(
      { where: { id: postId } }
    );
    if (!post) return res.status(400).json("게시글이 존재하지 않습니다.");

    if (req.currentUserId) {
      await post.removeLikers(req.currentUserId);
      return res.status(200).json({ type: post.type, result: "좋아요 해제 완료" });
    }
    else {
      return res.status(400).json("오류 발생");
    }
  }
  catch (e) { console.error(e) }
})


module.exports = router;