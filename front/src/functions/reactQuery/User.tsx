import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Axios from "../../apis/Axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface SignUpValue {
  email: string;
  password: any;
  nickname: string;
}
interface LoginValue {
  email: string;
  password: any;
}
interface CustomError extends Error {
  response?: {
    data: { message: string };
    status: number;
    headers: string;
  };
}
interface CustomError2 extends Error {
  response?: {
    data: string;
    status: number;
    headers: string;
  };
}

const User = {
  get: () => {
    const queryClient = useQueryClient();
    return useQuery(["user"], () => Axios.get("user/current").then((res) => res.data), {
      // staleTime: 60 * 1000,
      retry: false,
      refetchInterval: 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      onSuccess: (res) => {
        // console.log(res);
        //가끔 포스트 안딸려오는 문제 해결
        if (!res.Posts) {
          queryClient.invalidateQueries(["user"]);
        }
        // console.log("유저 정보 불러오기 성공");
      },
      onError: () => {
        console.log("유저 정보를 불러오지 못했습니다.");
      }
    });
  },
  delete: () => {
    const navigate = useNavigate();
    return useMutation((id: number) => Axios.delete(`user/${id}`), {
      onSuccess: () => {
        navigate("/");
        toast.success("회원탈퇴가 완료되었습니다.");
      }
    });
  },
  signUp: () => {
    return useMutation(
      ({ email, nickname, password }: SignUpValue) =>
        Axios.post("user/register", {
          email,
          nickname,
          password
        }),
      {
        onSuccess: (res) => {
          toast.success(res.data);
        },
        onError: (err: CustomError2) => {
          toast.error(err.response?.data);
        }
      }
    );
  },
  logIn: () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation(
      ({ email, password }: LoginValue) =>
        Axios.post("user/login", {
          email: email,
          password: password
        }),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["user"]);
          navigate("/home");
          window.location.reload();
        },
        onError: (err: CustomError) => {
          toast.error(err.response?.data?.message);
          console.log("로그인 중 에러 발생");
        }
      }
    );
  },
  socialLogIn: () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation(
      ({ email, profilePic }: any) =>
        Axios.post("user/login/social", {
          email,
          profilePic
        }),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["user"]);
          // setTimeout(() => {
          // navigate("/home");
          // window.location.reload();
          // }, 500);
        },
        onError: (err: CustomError) => {
          console.log(err);
          toast.error(err.response?.data?.message);
          // navigate("/");
          console.log("로그인 중 에러 발생");
        }
      }
    );
  },
  logout: () => {
    const queryClient = useQueryClient();

    return useMutation(() => Axios.get("user/logout"), {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);
        location.reload();
      },
      onError: (err: CustomError2) => {
        toast.warning(err.response?.data);
      }
    });
  },
  editPic: () => {
    const queryClient = useQueryClient();

    return useMutation((data: { profilePic: string }) => Axios.patch("user/edit/profilepic", data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);

        queryClient.invalidateQueries(["noticePosts"]);
        queryClient.invalidateQueries(["infoPosts"]);
        queryClient.invalidateQueries(["searchInfo"]);
        queryClient.invalidateQueries(["communityPosts"]);
        queryClient.invalidateQueries(["searchComm"]);
        queryClient.invalidateQueries(["activinfo"]);
        queryClient.invalidateQueries(["tipfeed"]);
        queryClient.invalidateQueries(["freefeed"]);

        queryClient.invalidateQueries(["userLikedPosts"]);
        queryClient.invalidateQueries(["userInfoPosts"]);
        queryClient.invalidateQueries(["userCommPosts"]);

        queryClient.invalidateQueries(["likedPosts"]);
        queryClient.invalidateQueries(["myCommPosts"]);
        queryClient.invalidateQueries(["myInfoPosts"]);

        toast.success("프로필 이미지 변경이 완료되었습니다.");
      },
      onError: (err: CustomError2) => {
        toast.warning(err.response?.data);
      }
    });
  },
  editNick: () => {
    const queryClient = useQueryClient();

    return useMutation((data: { nickname: string }) => Axios.patch("user/edit/nickname", data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);

        toast.success("닉네임 변경이 완료되었습니다.");
      },
      onError: (err: CustomError2) => {
        toast.warning(err.response?.data);
        // alert(err.response?.data);
      }
    });
  },
  editText: () => {
    const queryClient = useQueryClient();

    return useMutation((data: { usertext: string }) => Axios.patch("user/edit/usertext", data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);

        toast.success("상태메세지 변경이 완료되었습니다.");
      },
      onError: (err: CustomError2) => {
        toast.warning(err.response?.data);
      }
    });
  },
  follow: () => {
    const queryClient = useQueryClient();

    return useMutation((data: { userId: number }) => Axios.patch(`user/${data.userId}/follow`), {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);
        queryClient.invalidateQueries(["targetUser"]);
        toast.success("팔로우 완료");
      },
      onError: (err: CustomError2) => {
        toast.warning(err.response?.data);
      }
    });
  },
  unFollow: () => {
    const queryClient = useQueryClient();

    return useMutation((data: { userId: number }) => Axios.delete(`user/${data.userId}/follow`), {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);
        queryClient.invalidateQueries(["targetUser"]);
        toast.success("언팔로우 완료");
      },
      onError: (err: CustomError2) => {
        toast.warning(err.response?.data);
      }
    });
  },
  deleteFollower: () => {
    const queryClient = useQueryClient();

    return useMutation((data: { userId: number }) => Axios.delete(`user/${data.userId}/follower`), {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);
        toast.success("팔로워 삭제 완료");
      },
      onError: (err: CustomError2) => {
        toast.warning(err.response?.data);
      }
    });
  }
};

export default User;
