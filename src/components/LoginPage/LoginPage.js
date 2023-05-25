import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../firebase";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [errorFromSubmit, setErrorFromSubmit] = useState("");

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      setErrorFromSubmit(error.message);
      setLoading(false);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 5000);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <div className="title">로 그 인</div>
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
          {errorFromSubmit && <p>{errorFromSubmit}</p>}
          <input type="submit" disabled={loading} />
        </form>
        <Link
          to="/register"
          style={{
            border: "none",
            textDecoration: "none",
            color: "gray",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          회원가입 하기
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
