import { Dispatch } from "react";
import { IconContext } from "react-icons";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function SoundControl({ muted, setMuted }: { muted: boolean; setMuted: Dispatch<boolean> }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                setMuted(!muted);
            }}
        >
            <IconContext.Provider
                value={{
                    color: "black",
                    size: "2em",
                    className: "fixed left-0 top-0 m-4 hover:fill-white"
                }}
            >
                {!muted && <FaVolumeUp />}
                {muted && <FaVolumeMute />}
            </IconContext.Provider>
        </button>
    );
}
