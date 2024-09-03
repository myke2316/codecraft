import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Card, CardContent, Typography } from "@mui/material";

function StudentClassContainer() {
  const navigate = useNavigate();
  const userClass = useSelector((state) => state.class.class);
  const classId = userClass[0]?._id || userClass?._id;

  function handleClick() {
    navigate(`/studentClass/${classId}/classHome`);
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <Card 
        onClick={handleClick} 
        className="cursor-pointer hover:shadow-lg transition-shadow duration-300 ease-in-out"
        variant="outlined"
      >
        <CardContent className="text-center">
          <Typography variant="h6" component="div" className="font-bold mb-2">
            {userClass[0]?.className || userClass?.className}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Click to view class details
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentClassContainer;
