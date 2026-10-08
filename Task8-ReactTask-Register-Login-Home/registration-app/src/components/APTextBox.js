export default function APTextBox({
    type="text",
    placeholder,
    value,
    onChange
}) {
    return (
        <input

            className="ap-textbox"

            type={type}

            placeholder={placeholder}

            value={value}

            onChange={onChange}

        />

    )
}