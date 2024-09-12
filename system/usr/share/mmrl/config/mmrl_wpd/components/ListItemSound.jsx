import { ListItemButton, ListItemText, ListItemAvatar, Avatar } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import React from "react";

const ListItemSound = (props) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const aud = React.useMemo(() => {
    const a = new Audio(String(props.src));
    a.loop = props.loop;
    return a;
  }, []);

  React.useEffect(() => {
    const handleEnded = () => setIsPlaying(false);
    aud.addEventListener("ended", handleEnded);

    return () => {
      aud.removeEventListener("ended", handleEnded);
    };
  }, [aud]);

  const handlePlay = () => {
    if (aud.paused) {
      setIsPlaying(true);
      aud.play();
    } else {
      setIsPlaying(false);
      aud.pause();
    }
  };

  return (
    <ListItemButton onClick={handlePlay}>
      <ListItemAvatar>
        <Avatar>{isPlaying ? <Pause /> : <PlayArrow />}</Avatar>
      </ListItemAvatar>
      <ListItemText primary={props.title || "N/A"} />
    </ListItemButton>
  );
};

export { ListItemSound };
