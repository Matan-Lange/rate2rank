import { useState } from "react";
import { json, redirect } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { Warpper } from "./AuthenticationStyles";
import BasicModal from "../components/BasicModal";
import { useEffect } from "react";

const Authentication = () => {
  const [modalToggle, setModalToggle] = useState(false);
  const [modalText, setModalText] = useState();

  return (
    <Warpper>
      {modalToggle && <BasicModal close={setModalToggle} text={modalText} />}
      <AuthForm modalText={setModalText} modalToggle={setModalToggle} />
    </Warpper>
  );
};

export default Authentication;

export const action = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get("mode") || "login";
  if (mode !== "login" && mode !== "register") {
    throw json({ message: "Unsupported mode." }, { status: 422 });
  }

  const data = await request.formData();
  let authData = {};
  if (mode === "login") {
    authData = {
      username: data.get("username"),
      password: data.get("password"),
    };
  } else {
    authData = {
      username: data.get("username"),
      password: data.get("password"),
      email_address: data.get("email"),
      name: data.get("name"),
    };
  }
  console.log(5);
  const res = await fetch("http://127.0.0.1:5000/" + mode, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(authData),
  });

  if (
    res.status === 422 ||
    res.status === 401 ||
    res.status === 400 ||
    res.status === 500
  ) {
    return res;
  }
  if (!res.ok) {
    throw json({ message: "Could not authenticate user." }, { status: 500 });
  }

  if (mode === "register") {
    return redirect("/auth");
  }
  const resData = await res.json();
  const token = resData.access_token;

  localStorage.setItem("token", token);

  return redirect("/");
};
