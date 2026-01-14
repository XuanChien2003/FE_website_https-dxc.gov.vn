import React from "react";
import { useNavigate } from "react-router-dom";
import "./SignInSelection.css";

const SignInSelection = () => {
  const navigate = useNavigate();

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "windows" || selectedValue === "forms") {
      navigate("/login");
    }
  };

  return (
    <div className="signin-container">
      <h1 className="signin-title">Sign In</h1>

      <p className="signin-desc">
        Select the credentials you want to use to logon to this SharePoint site:
      </p>

      <select
        className="signin-select"
        onChange={handleSelectChange}
        defaultValue=""
      >
        <option value="" disabled>
          Select credentials...
        </option>
        <option value="windows">Windows Authentication</option>
        <option value="forms">Forms Authentication</option>
      </select>
    </div>
  );
};

export default SignInSelection;
