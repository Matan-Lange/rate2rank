import { useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router-dom";
import { json, redirect } from "react-router-dom";

import classes from "./AuthForm.module.css";

function AuthForm({ modalText, modalToggle }) {
  const data = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [iD, setID] = useState();
  const [reID, setReID] = useState();
  console.log(data);
  let mode = searchParams.get("mode") || "login";
  const isLogin = mode === "login";
  const isSubmitting = navigation.state === "submitting";

  const chackingID = (e) => {
    if (e.target.id === "username") {
      setID(e.target.value);
    } else {
      setReID(e.target.value);
    }
  };

  const submitChecks = () => {
    if (reID !== iD) {
      console.log(2);
      modalText("your IDs dosent much, fix it.");
      modalToggle(true);
    } else if (reID.length !== 9) {
      modalText("your ID has to contain 9 digits, fix it.");
      modalToggle(true);
    } else if (data.msg) {
      console.log(1);
      modalText(data.msg);
      modalToggle(true);
    } else {
      modalToggle(false);
    }
  };
  return (
    <Form method="post" className={classes.form}>
      <h1>{isLogin ? "Login" : "Register"}</h1>
      {data && data.msg && modalText(data.msg) && modalToggle(true)}
      <p>
        {/* <label htmlFor="email">אימייל</label> */}
        <input
          id="username"
          type="text"
          name="username"
          placeholder="id"
          required
          size="9"
          onChange={(e) => chackingID(e)}
        />
      </p>
      <p>
        {/* <label htmlFor="image">Password</label> */}
        <input
          id="password"
          type="text"
          name="password"
          placeholder="re-enter your id"
          required
          size="9"
          onChange={(e) => chackingID(e)}
        />
      </p>
      {!isLogin && (
        <p>
          {/* <label htmlFor="image">Password</label> */}
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            required
          />
        </p>
      )}
      {!isLogin && (
        <p>
          {/* <label htmlFor="image">Password</label> */}
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Full Name"
            required
          />
        </p>
      )}
      <div className={classes.actions}>
        <Link to={`?mode=${isLogin ? "register" : "login"}`}>
          {isLogin ? "Register? click here!" : "Login? click here!"}
        </Link>
        <button disabled={isSubmitting} onClick={submitChecks}>
          {isSubmitting ? "Submitting..." : "ENTER"}
        </button>
      </div>
    </Form>
  );
}

export default AuthForm;
