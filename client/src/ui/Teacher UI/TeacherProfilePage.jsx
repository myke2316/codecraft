import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useLogoutMutation } from "../../features/LoginRegister/userService";
import { logout } from "../../features/LoginRegister/userSlice";
import { Container, Card, CardContent, Typography, Avatar, Button } from "@mui/material";

function TeacherProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userDetails);
  const [logoutApi] = useLogoutMutation();

  async function handleLogout() {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      console.log("LOGOUT SUCCESS");
      toast.success("Logout Successfully");
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error("Logout failed. Please try again.");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card variant="outlined" sx={{ padding: 2, textAlign: 'center' }}>
        <CardContent>
          <Avatar 
            alt="Profile Picture" 
            src={user.picture} 
            sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }} 
          />
          <Typography variant="h4" component="h1" gutterBottom>
            {user.username || user.given_name}
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            ID: {user._id}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Email: {user.email}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Role: {user.role}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogout} 
            sx={{ mt: 3 }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default TeacherProfilePage;
