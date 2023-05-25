import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { auth } from "../../firebase";
import {
  updateProfile,
  createUserWithEmailAndPassword,
  // signInWithEmailAndPassword,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import md5 from "md5";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  //비밀번호확인 validation 을 위해 useRef 사용
  const passwordRef = useRef();
  passwordRef.current = watch("password");

  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      //Firebase에서 이메일과 비밀번호로 유저생성
      let createUser = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      //Firebase에서 생성된 유저에 추가 정보 입력
      await updateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: `http://gravatar.com/avatar/${md5(
          createUser.user.email
        )}?d=identicon`,
      });

      //Firebase 데이터베이스에 저장해주기
      const db = getDatabase();
      const usersRef = ref(db, "users/" + createUser.user.uid);
      await set(usersRef, {
        name: createUser.user.displayName,
        image: createUser.user.photoURL,
      });

      setLoading(false); //회원가입중에 submit 버튼 막기 위함
      reset();
    } catch (error) {
      setErrorFromSubmit(error.message);
      setLoading(false);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 5000);
      console.log(error);
    }
  };
  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <div className="title">회원가입</div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>이메일</label>
          <input
            name="email"
            type="email"
            {...register("email", {
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            })}
            autoFocus
          />
          {errors.email && <p>이메일을 입력해주세요</p>}

          <label>이름</label>
          <input
            name="name"
            type="text"
            {...register("name", { required: true, maxLength: 10 })}
          />
          {errors.name && errors.name.type === "required" && (
            <p>이름을 입력해주세요</p>
          )}
          {errors.name && errors.name.type === "maxLength" && (
            <p>이름은 최대 10글자 이내로 적어주세요</p>
          )}

          <label>비밀번호</label>
          <input
            name="password"
            type="password"
            {...register("password", { required: true, minLength: 8 })}
          />
          {errors.password && errors.password.type === "required" && (
            <p>비밀번호를 입력해주세요</p>
          )}
          {errors.password && errors.password.type === "minLength" && (
            <p>비밀번호는 최소 8자리 이상 입력해주세요</p>
          )}

          <label>비밀번호 확인</label>
          <input
            name="passwordConfirm"
            type="password"
            {...register("passwordConfirm", {
              required: true,
              validate: (value) => value === passwordRef.current,
            })}
          />
          {errors.passwordConfirm &&
            errors.passwordConfirm.type === "required" && (
              <p>비밀번호 확인을 입력해주세요</p>
            )}
          {errors.passwordConfirm &&
            errors.passwordConfirm.type === "validate" && (
              <p>비밀번호와 일치하지 않습니다</p>
            )}
          {errorFromSubmit && <p>{errorFromSubmit}</p>}
          <input type="submit" disabled={loading} />
        </form>
        <Link
          to="/login"
          style={{
            border: "none",
            textDecoration: "none",
            color: "gray",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          이미 아이디가 있다면?
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
