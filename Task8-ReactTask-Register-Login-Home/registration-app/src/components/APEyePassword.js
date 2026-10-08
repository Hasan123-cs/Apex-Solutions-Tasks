import { useState } from "react";
export default function APEyePassword({
    placeholder,
    value,
    onChange
}) {
    const [showPassword,setShowPassword] = useState(false);
    return (
        <div className="password-box">
            <input
                className="ap-textbox"
                type={
                    showPassword
                    ? "text"
                    : "password"
                }
                placeholder={placeholder}
                value={value}
                onChange={onChange}

            />
            <span

                className="eye"

                onClick={() =>
                    setShowPassword(!showPassword)
                }

            >
                👁
            </span>


        </div>

    )


}