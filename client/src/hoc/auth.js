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

        // Not logged in status
        if (!response.payload.isAuth) {
          if (option) {
            props.history.push("/login");
          }
        } else {
          // Logged in status
          if (adminRoute && !response.payload.isAdmin) {
            props.history.push("/");
          } else {
            if (option === false) {
              props.history.push("/");
            }
          }
        }
      });
    }, []);
    return <SpecifiComponent />;
  }
  return AuthenticationCheck;
}
