import React, { useEffect } from "react";
import Axios from "axios";
import { useDispatch } from "react-redux";
import { auth } from "../_actions/user_actions";

export default function (SpecifiComponent, option, adminRoute = null) {
  // null => Page accessible to anyone
  // true => Page accessible only to logged-in user
  // false => Page inaccessible to logged-in user

  function AuthenticationCheck(props) {
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(auth()).then((response) => {
        console.log(response);
      });
    }, []);
  }
  return AuthenticationCheck;
}
